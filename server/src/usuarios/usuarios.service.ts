import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SolicitudCuentaDto } from '../verificacion-cuenta/dto/solicitud-cuenta.dto';
import { crearNombreArchivoDesdeMulterFile } from '@/utils/funciones';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { FirebaseService } from '@/firebase/firebase.service';
import {
  ArchivosSolicitudCuenta,
  UsuariosArchivos,
} from './types/archivos-solicitud';
import { DatabaseService } from '@/database/database.service';
import { userInfoSql } from './sql/consultas';
import {
  AgregarGrupoUsuario,
  CrearUsuarioDTO,
  RegisterUsuariosDto,
} from './dto/register-usuarios';
import { encrypt, generarUUIDHASH } from '@/utils/security';
import { UserByQuery, UsersForQueryMany } from './types/usuarios-query';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { Prisma } from '@prisma/client';

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
  private async generarCodigoVendedorUnico(limite: number = 999): Promise<number> {
    const maxIntentos = 10; // Máximo 10 intentos para evitar loops infinitos
    for (let intento = 0; intento < maxIntentos; intento++) {
      // Generar número aleatorio entre 1 y limite
      const codigo = Math.floor(Math.random() * limite) + 1;

      // Verificar si el código ya existe
      const existeCodigo = await this.prismaService.usuarios.findFirst({
        where: { codigo_vendedor: codigo.toString() },
        select: { id: true }
      });
      
      if (!existeCodigo) {
        return codigo;
      }
    }
    
    // Si no se pudo generar un código único después de varios intentos
    throw new BadRequestException('No se pudo generar un código de vendedor único. Intente nuevamente.');
  }

  /**
   * Función pública para generar código de vendedor
   * Útil para otros servicios o casos especiales
   */
  async generarCodigoVendedor(): Promise<string> {
    const codigo = await this.generarCodigoVendedorUnico();
    return codigo.toString();
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
    
    let uidUserFirebase = '';
    let codVendedor:string | null = null;
    try {
      // buscar usuarios

      const userExists = await this.prismaService.usuarios.findFirst({
          where: {
            OR: [{ email: dto.correo }, { documento: dto.documento }],
          },
        });

        if (userExists) {
          throw new BadRequestException('La cédula o correo ya están registrados');
        }

      // guardar ususario en firebase para autenticación
      const { cedulaFrente, cedulaReverso, selfie } = files || {};
      const firebaseUser = await this.firebaseService.createUser({
        email: dto.correo,
        password: dto.contrasena,
        displayName: `${dto.nombre} ${dto.apellido}`,
        emailVerified: true,
      });
  
      uidUserFirebase = firebaseUser.uid;

      console.log('Usuario creado en Firebase con UID:', firebaseUser.uid);


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

        if(selfie){
          const filePath = `${FIREBASE_STORAGE_FOLDERS.selfieUsuarios}/${nombre_selfie}`;
          rutaArchivoSelfie = await this.firebaseService.subirArchivoPrivado(
            selfie.buffer,
            filePath,
            selfie.mimetype,
          );
        }

      // verificar que el usuario no exista
       await this.prismaService.$transaction(async (tx) => {
        

        // encriptar contraseña
        const contrasenaEncryptada = await encrypt(dto.contrasena);
        const pinHash = dto.pin ? await encrypt(dto.pin) : null;

        
        
        if(dto.porcentaje_vendedor_primera_venta && dto.porcentaje_vendedor_venta_recurrente){
          // validar porcentajes de comisiones 
  
          const infoPorcentajes = await tx.participacion_empresa.findFirst({
            orderBy: { id: 'desc' },
          });

          if(!infoPorcentajes?.porcentaje_empresa_primera_venta || 
            !infoPorcentajes?.porcentaje_empresa_recurrente ||
            !infoPorcentajes?.porcentaje_participantes_primera_venta ||
            !infoPorcentajes?.porcentaje_participantes_recurrente ){
            throw new BadRequestException('No se han configurado los porcentajes de comisiones en la empresa. Contacte con el administrador.');
          }

          const suma_info_primera_venta = Number(infoPorcentajes.porcentaje_participantes_primera_venta) + Number(infoPorcentajes.porcentaje_empresa_primera_venta);
          const suma_info_venta_recurrente = Number(infoPorcentajes.porcentaje_participantes_recurrente) + Number(infoPorcentajes.porcentaje_empresa_recurrente);

         

          const suma_primer_vendedor = dto.porcentaje_vendedor_primera_venta + suma_info_primera_venta;
          const suma_recurrente_vendedor = suma_info_venta_recurrente + dto.porcentaje_vendedor_venta_recurrente;

           console.log(`Suma info primera venta: ${suma_info_primera_venta}, Suma info venta recurrente: ${suma_info_venta_recurrente}`);
          console.log(`Suma primera venta: ${suma_primer_vendedor}, Suma venta recurrente: ${suma_recurrente_vendedor}`);

          if( suma_primer_vendedor > 100){
            throw new BadRequestException(`El porcentaje de comisión por primera venta es inválido. La suma de los porcentajes deben ser  100%. Por favor, ajuste el porcentaje máximo a ${100 - suma_info_primera_venta}%.`);
          }

          if(suma_recurrente_vendedor > 100){
            throw new BadRequestException(`El porcentaje de comisión por venta recurrente es inválido. La suma de los porcentajes deben dar 100%. Por favor, ajuste el porcentaje máximo a ${100 - suma_info_venta_recurrente}%.`);
          }

         
          
        }


        if(dto?.grupos && dto.grupos.length > 0){
          // si vendedor (grupo 3)
          if(dto.grupos.includes(3)){
            // generar codigo de vendedor de 3 digitos numericos (1-999)
            const codigoNumerico = await this.generarCodigoVendedorUnico();
            codVendedor = codigoNumerico.toString();
          }
        }




        const newUser = await tx.usuarios.create({
          data: {
            nombre: dto.nombre,
            apellido: dto.apellido,
            documento: dto.documento,
            email: dto.correo,
            password: contrasenaEncryptada,
            uid_firebase: firebaseUser.uid,
            cedula_frente: rutaArchivoFrontal,
            cedula_reverso: rutaArchivoReverso,
            pin: pinHash,
            dial_code: dto.dial_code,
            telefono: dto.telefono,
            selfie: rutaArchivoSelfie,
            codigo_vendedor: codVendedor,
            porcentaje_comision_primera_venta: dto.porcentaje_vendedor_primera_venta || null,
            porcentaje_comision_recurrente: dto.porcentaje_vendedor_venta_recurrente || null,
          },
        });
        // si viene el id del usuario que registra, actualizar el campo
        if (dto.grupos && dto.grupos.length > 0) {
          await this.asignarGrupos({
            id_usuario: newUser.id,
            grupos: dto.grupos,
          }, tx);
        }

        return newUser;
      });
      return { message: 'Usuario creado exitosamente' };
    } catch (error) {
      if (uidUserFirebase) {
        // eliminar usuario en firebase
        await this.firebaseService.auth.deleteUser(uidUserFirebase);
      }
      throw error;
    }
  }

  async getUserByQuery(query: UserByQuery) {
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

  async getUsersByQuery(query: UsersForQueryMany): Promise<any[]> {
    const { documento, email, nombre } = query;
    const whereClause: any = {};
    try {
      let sql = `select 
        u.id,
        u.nombre, 
        u.apellido,
        u.documento,
        u.email,
        u.dial_code,
        u.telefono,
        u.direccion
        from usuarios u
        where u.activo = true  and u.is_super_admin <> true`;

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
      console.log(sql, whereClause);
      const resultUser = await this.dbPromise.result(sql, whereClause);
      return resultUser.rows;
    } catch (error) {
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

  async asignarGrupos(
    data: { id_usuario: number; grupos: number[] },
    tx?: Prisma.TransactionClient
  ) {
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

      return { message: 'Grupos actualizados correctamente' };
    });
  }
}
