import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { crearNombreArchivoDesdeMulterFile } from '@/utils/funciones';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { FirebaseService } from '@/firebase/firebase.service';
import { UsuariosArchivos } from './types/archivos-solicitud';
import { DatabaseService } from '@/database/database.service';
import { userInfoSql } from './sql/consultas';
import {
  AgregarGrupoUsuario,
  CrearUsuarioDTO,
} from './dto/register-usuarios';
import { encrypt } from '@/utils/security';
import { UserByQueryDto, UsersForQueryManyDto } from './dto/usuarios-query.dto';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { Prisma } from '@prisma/client';
import { AsignarGruposDto } from './dto/grupos.dto';
import { ActualizarUsuarioDTO } from './dto/actualizar-usuario.dto';
import {
  ActualizarDireccionUsuarioDTO,
  CrearDireccionUsuarioDTO,
} from './dto/direciones-usuario.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { GruposSistema } from '@/utils/constants';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly dbservice: DatabaseService,
    private readonly dbPromise: DatabasePromiseService,
  ) {}

  /**
   * Genera un código numérico único para vendedor (1-999)
   * Verifica que no exista en la base de datos
   */
  private async generarCodigoVendedorUnico(
    limite: number = 999,
  ): Promise<number> {
    const maxIntentos = 10; // Máximo 10 intentos para evitar loops infinitos
    for (let intento = 0; intento < maxIntentos; intento++) {
      // Generar número aleatorio entre 1 y limite
      const codigo = Math.floor(Math.random() * limite) + 1;

      // Verificar si el código ya existe
      const existeCodigo = await this.prismaService.usuarios.findFirst({
        where: { codigo_vendedor: codigo.toString() },
        select: { id: true },
      });

      if (!existeCodigo) {
        return codigo;
      }
    }

    // Si no se pudo generar un código único después de varios intentos
    throw new BadRequestException(
      'No se pudo generar un código de vendedor único. Intente nuevamente.',
    );
  }

  /**
   * Función pública para generar código de vendedor
   * Útil para otros servicios o casos especiales
   */
  async generarCodigoVendedor(): Promise<string> {
    const codigo = await this.generarCodigoVendedorUnico();
    return codigo.toString();
  }

  /**
   * Valida si el embajador asignado existe y tiene el rol correcto
   */
  private async validarEmbajadorExiste(id_usuario_embajador?: number | null): Promise<void> {
    if (!id_usuario_embajador) return;

    const embajadorExist = await this.prismaService.usuarios_grupos.findFirst({
      where: { id_usuario: id_usuario_embajador, id_grupo: GruposSistema.EMBAJADOR },
    });
    
    if (!embajadorExist) {
      throw new NotFoundException('El embajador asignado no existe o no es válido');
    }
  }

  /**
   * Maneja la asignación de código de vendedor solo si no existe previamente
   */
  private async manejarCodigoVendedor(
    grupos: number[], 
    usuarioId: number, 
    tx: Prisma.TransactionClient
  ): Promise<void> {
    if (!grupos.includes(GruposSistema.VENDEDOR)) return;

    // Verificar si el usuario ya tiene código de vendedor
    const usuarioActual = await tx.usuarios.findFirst({
      where: { id: usuarioId },
      select: { codigo_vendedor: true },
    });

    // Solo generar código si no existe
    if (!usuarioActual?.codigo_vendedor) {
      const codigoNumerico = await this.generarCodigoVendedorUnico();
      await tx.usuarios.update({
        where: { id: usuarioId },
        data: { codigo_vendedor: String(codigoNumerico) },
      });
    }
  }

  async getUserInfoJwt(id: number) {
    try {
      const user = await this.prismaService.usuarios.findFirst({
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          documento: true,
          is_super_admin: true,
        },
        where: { id: id },
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserinfo(id: number) {
    try {
      const userInfoSqlResult = await this.dbservice.query(userInfoSql, [id]);
      if (userInfoSqlResult.rowCount === 0) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return userInfoSqlResult.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getGruposByUsuario(id: number) {
    try {
      const userInfoSqlResult = await this.dbservice.query(userInfoSql, [id]);
      if (userInfoSqlResult.rowCount === 0) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return userInfoSqlResult.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async crearUsuario(dto: CrearUsuarioDTO, files?: UsuariosArchivos | any) {
    try {
      // Validar embajador si se proporciona
      await this.validarEmbajadorExiste(dto.id_usuario_embajador);

      // buscar usuarios existentes
      const userExists = await this.prismaService.usuarios.findFirst({
        where: {
          OR: [
            { email: dto.correo },
            { documento: dto.documento },
            { telefono: dto.telefono },
          ],
        },
      });

      if (userExists) {
        throw new BadRequestException(
          'La cédula, correo o teléfono ya están registrados',
        );
      }

      // guardar usuario en firebase para autenticación
      const { cedulaFrente, cedulaReverso, selfie } = files || {};
      /* const firebaseUser = await this.firebaseService.createUser({
        email: dto.correo,
        password: dto.contrasena,
        displayName: `${dto.nombre} ${dto.apellido}`,
        emailVerified: true,
      });

      uidUserFirebase = firebaseUser.uid; */

      // guardar la cedula del ususarios
      const nombre_cedula_frontal =
        cedulaFrente && crearNombreArchivoDesdeMulterFile(cedulaFrente);
      const nombre_cedula_reverso =
        cedulaReverso && crearNombreArchivoDesdeMulterFile(cedulaReverso);
      const nombre_selfie = selfie && crearNombreArchivoDesdeMulterFile(selfie);

      let rutaArchivoFrontal: string | null = null;
      let rutaArchivoReverso: string | null = null;
      let rutaArchivoSelfie: string | null = null;

      if (cedulaFrente) {
        const filePath = `${FIREBASE_STORAGE_FOLDERS.cedulasUsuarios}/${nombre_cedula_frontal}`;
        rutaArchivoFrontal = await this.firebaseService.subirArchivoPrivado(
          cedulaFrente.buffer,
          filePath,
          cedulaFrente.mimetype,
        );
      }

      if (cedulaReverso) {
        const filePath = `${FIREBASE_STORAGE_FOLDERS.cedulasUsuarios}/${nombre_cedula_reverso}`;
        rutaArchivoReverso = await this.firebaseService.subirArchivoPrivado(
          cedulaReverso.buffer,
          filePath,
          cedulaReverso.mimetype,
        );
      }

      if (selfie) {
        const filePath = `${FIREBASE_STORAGE_FOLDERS.selfieUsuarios}/${nombre_selfie}`;
        rutaArchivoSelfie = await this.firebaseService.subirArchivoPrivado(
          selfie.buffer,
          filePath,
          selfie.mimetype,
        );
      }

      // crear nuevo usuario en la base de datos
      const userNew = await this.prismaService.$transaction(async (tx) => {
        // encriptar contraseña
        const contrasenaEncryptada = await encrypt(dto.contrasena);
        const pinHash = dto.pin ? await encrypt(dto.pin) : null;

        const newUser = await tx.usuarios.create({
          data: {
            nombre: dto.nombre,
            apellido: dto.apellido,
            documento: dto.documento,
            email: dto.correo,
            password: contrasenaEncryptada,
            cedula_frente: rutaArchivoFrontal,
            cedula_reverso: rutaArchivoReverso,
            pin: pinHash,
            dial_code: dto.dial_code,
            telefono: dto.telefono,
            selfie: rutaArchivoSelfie,
            estado: dto.id_estado || 1,
            ip_origen: dto.ip_origen || null,
            dispositivo_origen: dto.dispositivo_origen || null,    
            id_embajador: dto.id_usuario_embajador || null,      
          },
        });

        // Asignar grupos si se proporcionan
        if (dto.grupos && dto.grupos.length > 0) {
          await this.asignarGrupos({
            id_usuario: newUser.id,
            grupos: dto.grupos,
          }, tx);
        }

        return newUser;
      });
      return userNew;
    } catch (error) {
      throw error;
    }
  }

  async getUserByQuery(query: UserByQueryDto) {
    const whereClause: any = { activo: true, is_super_admin: false };

    if (query.id) {
      whereClause.id = Number(query.id);
    }

    if (query.documento) {
      whereClause.documento = query.documento.trim();
    }

    if (query.email) {
      whereClause.email = query.email.trim();
    }

    const user = await this.prismaService.usuarios.findFirst({
      include: {
        usuarios_grupos: {
          select: {
            id_grupo: true,
          },
        },
      },
      where: whereClause,
    });

    console.log(user);

    if (!user) throw new NotFoundException('Usuario no encontrado');

    return user;
  }

  async getUsersByQuery(query: UsersForQueryManyDto): Promise<any[]> {
    const { documento, email, nombre, is_super_admin, estado, activo } = query;

    console.log(query);
    const whereClause: any = {};

    // Convertir strings a booleans cuando sea necesario
    const isActivoBoolean =
      activo === 'true' ? true : activo === 'false' ? false : undefined;
    const isSuperAdminBoolean =
      is_super_admin === 'true'
        ? true
        : is_super_admin === 'false'
          ? false
          : undefined;

    try {
      let sql = `select 
       U.ID,
        U.NOMBRE,
        U.APELLIDO,
        U.DOCUMENTO,
        U.EMAIL,
        U.DIAL_CODE,
        U.TELEFONO,
        U.DIRECCION,
        u.fecha_creacion,
        u.estado,
        u.is_super_admin,
        u.activo,
        u.roles_asignados,
        u.codigo_vendedor,
        u.porcentaje_comision_primera_venta,
        u.porcentaje_comision_recurrente
        from v_usuarios u`;

      // Lógica mejorada para el campo activo
      if (isActivoBoolean !== undefined) {
        sql += ` where u.activo = $(activo) `;
        whereClause.activo = isActivoBoolean;
      } else {
        sql += ` where u.activo = true `; // Por defecto solo usuarios activos
      }

      if (estado) {
        sql += ` and u.estado = $(estado) `;
        whereClause.estado = estado;
      }

      if (isSuperAdminBoolean !== undefined) {
        sql += ` and u.is_super_admin = $(is_super_admin)`;
        whereClause.is_super_admin = isSuperAdminBoolean;
      }

      if (nombre) {
        sql += ' and u.nombre ILIKE ${nombre}';
        whereClause.nombre = `%${nombre.trim()}%`;
      }

      if (documento) {
        sql += ` and u.documento = $(documento) `;
        whereClause.documento = documento.trim();
      }

      if (email) {
        sql += ` and u.email = $(email) `;
        whereClause.email = email.trim();
      }

      if (query.id_grupo) {
        sql += ` and jsonb_path_exists(u.roles_asignados, '$[*] ? (@.id == $(id_grupo))') `;
        whereClause.id_grupo = parseInt(query.id_grupo.toString());
      }
      console.log(sql, whereClause);
      const resultUser = await this.dbPromise.result(sql, whereClause);
      return resultUser.rows;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async agregarUsuarioGrupo(body: AgregarGrupoUsuario) {
    try {
      const usuarioExiste = await this.prismaService.usuarios.findFirst({
        where: { id: body.id_usuario, activo: true },
      });

      if (!usuarioExiste) throw new NotFoundException('Usuario no encontrado');

      // verificar si ya esta asignado al grupo
      const grupoAsignado = await this.prismaService.usuarios_grupos.findFirst({
        where: { id_usuario: body.id_usuario, id_grupo: body.id_grupo },
      });

      if (grupoAsignado)
        throw new BadRequestException('Usuario ya está asignado a este grupo');

      const { id_usuario, id_grupo } = body;
      await this.prismaService.usuarios.update({
        where: { id: id_usuario },
        data: {
          usuarios_grupos: {
            create: { id_grupo },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async asignarGrupos(data: AsignarGruposDto, tx?: Prisma.TransactionClient) {
    return this.prismaService.runInTransaction(tx, async (client) => {
      const gruposActuales = await client.usuarios_grupos.findMany({
        where: { id_usuario: data.id_usuario },
        select: { id_grupo: true },
      });

      const actuales = gruposActuales.map((g) => g.id_grupo);

      const aAgregar = data.grupos.filter((id) => !actuales.includes(id));
      const aEliminar = actuales.filter((id) => !data.grupos.includes(id));

      if (aAgregar.length > 0) {
        await client.usuarios_grupos.createMany({
          data: aAgregar.map((id_grupo) => ({
            id_usuario: data.id_usuario,
            id_grupo,
          })),
          skipDuplicates: true,
        });
      }

      if (aEliminar.length > 0) {
        await client.usuarios_grupos.deleteMany({
          where: {
            id_usuario: data.id_usuario,
            id_grupo: { in: aEliminar },
          },
        });
      }
      // Manejar código de vendedor si es necesario
      await this.manejarCodigoVendedor(data.grupos, data.id_usuario, client);

      return { message: 'Grupos actualizados correctamente' };
    });
  }

  async getUsuarioById(id: number) {
    try {
      const usuario = await this.prismaService.usuarios.findFirst({
        include: {
          usuarios_grupos: {
            select: { id_grupo: true },
          },
        },
        where: { id },
      });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return usuario;
    } catch (error) {
      throw error;
    }
  }

  async actualizarUsuario(
    id: number,
    dto: ActualizarUsuarioDTO,
    files?: UsuariosArchivos | any,
  ) {
    try {
      // Verificar que el usuario existe
      const usuarioExistente = await this.prismaService.usuarios.findFirst({
        where: { id, activo: true },
        include: {
          usuarios_grupos: {
            select: { id_grupo: true },
          },
        },
      });

      // Validar embajador si se proporciona
      await this.validarEmbajadorExiste(dto.id_usuario_embajador);

      if (!usuarioExistente) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (dto.documento || dto.correo || dto.telefono) {
        // Verificar que el email y documento no estén siendo usados por otro usuario
        const conflictoUsuario = await this.prismaService.usuarios.findFirst({
          where: {
            AND: [
              { id: { not: id } }, // Excluir el usuario actual
              {
                OR: [{ email: dto.correo }, { documento: dto.documento }, { telefono: dto.telefono }],
              },
            ],
          },
        });

        if (conflictoUsuario) {
          throw new BadRequestException(
            'El correo, documento o teléfono ya están siendo usados por otro usuario',
          );
        }
      }

      let uidUserFirebase = usuarioExistente.uid_firebase;

      await this.prismaService.$transaction(async (tx) => {
        // Datos base para actualizar
        const datosActualizacion: any = {
          nombre: dto.nombre,
          apellido: dto.apellido,
          documento: dto.documento,
          email: dto.correo,
          dial_code: dto.dial_code,
          telefono: dto.telefono,
          direccion: dto.direccion,
          id_embajador: dto.id_usuario_embajador || null,
        };

        // Actualizar contraseña si se proporciona
        if (dto.contrasena) {
          // Aquí podrías agregar verificación de la contraseña actual

          datosActualizacion.password = await encrypt(dto.contrasena);

          // Actualizar también en Firebase
          if (uidUserFirebase) {
            await this.firebaseService.auth.updateUser(uidUserFirebase, {
              password: dto.contrasena,
            });
          }
        }

        // Actualizar PIN si se proporciona
        if (dto.pin) {
          datosActualizacion.pin = await encrypt(dto.pin);
        }

        // Manejar archivos si se proporcionan
        const { cedulaFrente, cedulaReverso, selfie } = files || {};

        if (cedulaFrente) {
          const { crearNombreArchivoDesdeMulterFile } = await import(
            '@/utils/funciones'
          );
          const { FIREBASE_STORAGE_FOLDERS } = await import(
            '@/firebase/constantsFirebase'
          );

          const nombreArchivo = usuarioExistente.cedula_frente
            ? usuarioExistente.cedula_frente
            : crearNombreArchivoDesdeMulterFile(cedulaFrente);
          const filePath = `${FIREBASE_STORAGE_FOLDERS.cedulasUsuarios}/${nombreArchivo}`;
          const rutaArchivo = await this.firebaseService.subirArchivoPrivado(
            cedulaFrente.buffer,
            filePath,
            cedulaFrente.mimetype,
          );
          datosActualizacion.cedula_frente = rutaArchivo;
        }

        if (cedulaReverso) {
          const { crearNombreArchivoDesdeMulterFile } = await import(
            '@/utils/funciones'
          );
          const { FIREBASE_STORAGE_FOLDERS } = await import(
            '@/firebase/constantsFirebase'
          );

          const nombreArchivo = usuarioExistente.cedula_reverso
            ? usuarioExistente.cedula_reverso
            : crearNombreArchivoDesdeMulterFile(cedulaReverso);
          const filePath = `${FIREBASE_STORAGE_FOLDERS.cedulasUsuarios}/${nombreArchivo}`;
          const rutaArchivo = await this.firebaseService.subirArchivoPrivado(
            cedulaReverso.buffer,
            filePath,
            cedulaReverso.mimetype,
          );
          datosActualizacion.cedula_reverso = rutaArchivo;
        }

        if (selfie) {
          const { crearNombreArchivoDesdeMulterFile } = await import(
            '@/utils/funciones'
          );
          const { FIREBASE_STORAGE_FOLDERS } = await import(
            '@/firebase/constantsFirebase'
          );

          const nombreArchivo = usuarioExistente.selfie
            ? usuarioExistente.selfie
            : crearNombreArchivoDesdeMulterFile(selfie);
          const filePath = `${FIREBASE_STORAGE_FOLDERS.selfieUsuarios}/${nombreArchivo}`;
          const rutaArchivo = await this.firebaseService.subirArchivoPrivado(
            selfie.buffer,
            filePath,
            selfie.mimetype,
          );
          datosActualizacion.selfie = rutaArchivo;
        }

        // Actualizar datos básicos del usuario
        const usuarioActualizado = await tx.usuarios.update({
          where: { id },
          data: datosActualizacion,
        });

        // Actualizar grupos si se proporcionan
        if (dto.grupos && Array.isArray(dto.grupos)) {
          await this.asignarGrupos({
            id_usuario: id,
            grupos: dto.grupos,
          }, tx);
        }

        // Actualizar información en Firebase si es necesario
        if (uidUserFirebase) {
          await this.firebaseService.auth.updateUser(uidUserFirebase, {
            email: dto.correo,
            password: dto.contrasena ? dto.contrasena : undefined,
            displayName: `${dto.nombre} ${dto.apellido || ''}`.trim(),
          });
        }

        return usuarioActualizado;
      });

      return { message: 'Usuario actualizado exitosamente' };
    } catch (error) {
      throw error;
    }
  }
  async getFiltrosUsuarios() {
    try {
      const grupos = await this.prismaService.grupos.findMany({
        select: { id: true, descripcion: true },
        orderBy: { id: 'asc' },
      });

      return { grupos };
    } catch (error) {
      throw error;
    }
  }

  async obtenerDireccionesUsuarioById(id_usuario: number) {
    try {
      const direcciones =
        await this.prismaService.direcciones_usuarios.findMany({
          where: { id_usuario, activo: true },
        });
      return direcciones;
    } catch (error) {
      throw error;
    }
  }

  async agregarDireccionUsuario(body: CrearDireccionUsuarioDTO) {
    try {
      const nuevaDireccion =
        await this.prismaService.direcciones_usuarios.create({
          data: {
            id_usuario: body.id_usuario,
            titulo: body.titulo,
            direccion: body.direccion,
            url_maps: body.url_maps,
            referencia: body.referencia,
          },
        });
      return nuevaDireccion;
    } catch (error) {
      throw error;
    }
  }

  async actualizarDireccionUsuario(
    id: number,
    body: ActualizarDireccionUsuarioDTO,
  ) {
    try {
      const direccionExistente =
        await this.prismaService.direcciones_usuarios.findFirst({
          where: { id, activo: true },
        });
      if (!direccionExistente)
        throw new NotFoundException('Dirección no encontrada');
      const direccionActualizada =
        await this.prismaService.direcciones_usuarios.update({
          where: { id },
          data: {
            titulo: body.titulo,
            direccion: body.direccion,
            url_maps: body.url_maps,
            referencia: body.referencia,
          },
        });
      return direccionActualizada;
    } catch (error) {
      throw error;
    }
  }

  async obtenerDireccionById(id: number) {
    try {
      const direccion = await this.prismaService.direcciones_usuarios.findFirst(
        {
          where: { id, activo: true },
        },
      );
      if (!direccion) throw new NotFoundException('Dirección no encontrada');
      return direccion;
    } catch (error) {
      throw error;
    }
  }

  async eliminarDireccionUsuarioById(id: number) {
    try {
      const direccionExistente =
        await this.prismaService.direcciones_usuarios.findFirst({
          where: { id, activo: true },
        });
      if (!direccionExistente)
        throw new NotFoundException('Dirección no encontrada');
      await this.prismaService.direcciones_usuarios.update({
        where: { id },
        data: { activo: false },
      });
      return { message: 'Dirección eliminada correctamente' };
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id: number, dataDelete: DeleteUserDto) {
    try {
      const usuarioExistente = await this.prismaService.usuarios.findFirst({
        where: { id },
      });

      if (!usuarioExistente) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (usuarioExistente.estado == 1) {
        // borrar usuario pend activacion
        await this.prismaService.usuarios.delete({
          where: { id },
        });
        return null;
      }
      // desactivar usuario
      await this.prismaService.usuarios.update({
        where: { id },
        data: {
          activo: false,
          id_usuario_eliminacion: dataDelete.id_usuario_eliminacion,
          fecha_eliminacion: new Date(),
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
