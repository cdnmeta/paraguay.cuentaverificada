import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef
} from '@nestjs/common';
import { CreateVerificacionCuentaDto } from './dto/create-verificacion-cuenta.dto';
import {
  AprobarCuenta,
  RechazoCuentaDto,
  UpdateVerificacionCuentaDto,
} from './dto/update-verificacion-cuenta.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { ImagenesVerificacionCuenta } from './types/imagenes-verificacion';
import { crearNombreArchivoDesdeMulterFile } from '@/utils/funciones';
import * as path from 'path';
import { FirebaseService } from '@/firebase/firebase.service';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { AuthService } from '@/auth/auth.service';
import { SolicitudCuentaDto } from './dto/solicitud-cuenta.dto';
import { generateToken } from '@/utils/security';
import { createHash } from 'crypto';
import { TokenSolicitud } from './types/token-solicitudes';
import { DatabaseService } from '@/database/database.service';
import { consulta_verificador_asignar, listadoSolicitudes } from './sql/consultas';
import { AprobarCuentaOpciones } from './types/services';
@Injectable()
export class VerificacionCuentaService {
  constructor(
    private prismaService: PrismaService,
    private firebaseService: FirebaseService,
    private readonly dbservice: DatabaseService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}


  async listadoUsuariosSolicitudes() {
    try {
      const estado = [1,2,3,4]
      const resultado = await this.dbservice.query(listadoSolicitudes,[estado]);
      return resultado.rows;
    } catch (error) {
      throw error;
    }
  }

  async listadoUsuariosSolicitudesByVerificador(id_verificador: number) {
    try {

      const clasulaWhere = {
        id_estado: {
          in: [1, 2, 3, 4],
        },
        id_verificador: id_verificador,
      };
     
      const usuarios =
        await this.prismaService.usuarios_solicitudes_cuenta.findMany({
          select: {
            id: true,
            correo: true,
            nombre: true,
            id_estado: true,
            apellido: true,
            dial_code: true,
            telefono: true,
            documento: true,
          },
          where: clasulaWhere,
        });
      return usuarios;
    } catch (error) {
      throw error;
    }
  }

  async actualizarUsuarioVerificacion(
    id: number,
    updateVerificacionCuentaDto: UpdateVerificacionCuentaDto,
    files: ImagenesVerificacionCuenta,
  ) {
    try {
      const cedula_frontal = files.cedula_frontal?.[0];
      const cedula_reverso = files.cedula_reverso?.[0];
      const selfie_user = files.selfie_user?.[0];
      // guardar las cedulas en firebase
      const user =
        await this.prismaService.usuarios_solicitudes_cuenta.findFirst({
          where: {
            id: id,
          },
        });

      if (!user) throw new NotFoundException('Solicitud no encontrada');

      if (user.id_estado === 3)
        throw new BadRequestException('La solicitud ya ha sido aprobada');

      const nombre_cedula_frontal = user?.cedula_frontal
        ? path.basename(user?.cedula_frontal)
        : crearNombreArchivoDesdeMulterFile(files?.cedula_frontal[0]);
      const nombre_cedula_reverso = user?.cedula_reverso
        ? path.basename(user?.cedula_reverso)
        : crearNombreArchivoDesdeMulterFile(files?.cedula_reverso[0]);
      const nombre_selfie_user = user?.selfie
        ? path.basename(user?.selfie)
        : crearNombreArchivoDesdeMulterFile(files?.selfie_user[0]);

      let url_cedula_frontal = `${FIREBASE_STORAGE_FOLDERS.cedulasUsuarios}/${nombre_cedula_frontal}`;
      let url_cedula_reverso = `${FIREBASE_STORAGE_FOLDERS.cedulasUsuarios}/${nombre_cedula_reverso}`;
      let url_selfie_user = `${FIREBASE_STORAGE_FOLDERS.selfieUsuarios}/${nombre_selfie_user}`;

      if (cedula_frontal) {
        await this.firebaseService.subirArchivoPrivado(
          cedula_frontal.buffer,
          url_cedula_frontal,
          cedula_frontal.mimetype,
        );
      }

      if (cedula_reverso) {
        await this.firebaseService.subirArchivoPrivado(
          cedula_reverso.buffer,
          url_cedula_reverso,
          cedula_reverso.mimetype,
        );
      }

      if (selfie_user) {
        await this.firebaseService.subirArchivoPrivado(
          selfie_user.buffer,
          url_selfie_user,
          selfie_user.mimetype,
        );
      }

      await this.prismaService.usuarios_solicitudes_cuenta.update({
        where: {
          id: id,
        },
        data: {
          ...updateVerificacionCuentaDto,
          cedula_frontal: url_cedula_frontal,
          cedula_reverso: url_cedula_reverso,
          selfie: url_selfie_user,
          id_usuario_actualizacion:
            updateVerificacionCuentaDto.id_usuario_actualizacion,
          fecha_actualizacion: new Date(),
          id_estado: 2, // colocar en pendiente
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async rechazarCuenta(dto: RechazoCuentaDto) {
    try {
      const id_estado_asignar = 4;
      const cuenta =
        await this.prismaService.usuarios_solicitudes_cuenta.findFirst({
          where: {
            id: dto.id_usuario_rechazo,
          },
        });

      if (!cuenta) throw new NotFoundException('Cuenta no encontrada');

      if (cuenta.id_estado === id_estado_asignar)
        throw new BadRequestException(
          'La cuenta ya se encuentra en estado rechazado',
        );

      await this.prismaService.usuarios_solicitudes_cuenta.update({
        where: {
          id: dto.id_usuario_rechazo,
        },
        data: {
          id_estado: 4, // estado 4 es "rechazado"
          observacion: dto.motivo,
          id_usuario_actualizacion: dto.id_usuario_actualizacion,
          fecha_actualizacion: new Date(),
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async aprobarCuenta(dto: AprobarCuenta, opciones?: AprobarCuentaOpciones) {
    try {
      const { crear_token = false } = opciones || {};
      const id_estado_asignar = 3;
      const cuenta_aprobar_solicitud =
        await this.prismaService.usuarios_solicitudes_cuenta.findFirst({
          where: {
            id: dto.id_usuario_aprobacion,
            id_estado: 2, // estado 2 es "pendiente"
          },
        });

      if (!cuenta_aprobar_solicitud)
        throw new NotFoundException('Solicitud no encontrada');

      if (cuenta_aprobar_solicitud.id_estado === id_estado_asignar)
        throw new BadRequestException(
          'La cuenta ya se encuentra en estado aprobado',
        );

      const usuarioExistente = await this.prismaService.usuarios.findFirst({
        where: {
          documento: cuenta_aprobar_solicitud.documento,
          activo: true,
        },
      });

      if (usuarioExistente)
        throw new BadRequestException(
          'Ya existe un usuario con este documento',
        );

      // Envolver en una transacción de Prisma

     const usuarioSolicitud = await this.prismaService.usuarios_solicitudes_cuenta.update({
        where: {
          id: dto.id_usuario_aprobacion,
        },
        data: {
          id_estado: id_estado_asignar, // estado 3 es "aprobado"
          id_usuario_actualizacion: dto.id_usuario_actualizacion,
          fecha_actualizacion: new Date(),
        },
      });

      if (crear_token) {
        const { token } = await this.generarTokenSolicitud(usuarioSolicitud.id);
        return { cuenta: cuenta_aprobar_solicitud, token: token };
      }

      return { cuenta: cuenta_aprobar_solicitud };
    } catch (error) {
      throw error;
    }
  }

  async registrarSolicitudCuenta(dto: SolicitudCuentaDto) {
    try {
      const userExisteCorreo =
        await this.prismaService.usuarios_solicitudes_cuenta.findFirst({
          where: {
            OR: [{ correo: dto.correo }, { documento: dto.documento }],
          },
        });

      if (userExisteCorreo) {
        throw new BadRequestException('Solicitud ya existe');
      }

      // verificar entre los usuarios registrados

      const userRegistrado = await this.prismaService.usuarios.findFirst({
        where: {
          OR: [{ email: dto.correo }, { documento: dto.documento }],
        },
      });

      if (userRegistrado) {
        throw new BadRequestException(
          'Ya existe un usuario registrado con este correo o documento',
        );
      }

      // obtener verificador disponible
      const usuarioAsignar = await this.dbservice.transaction(async (tx) => {
        return await tx.query(consulta_verificador_asignar);
      });

      if (usuarioAsignar.rowCount == 0) {
        throw new BadRequestException('No se encontró un verificador disponible');
      }
      // guardar cedula en firebase
      const userSolicitud =
        await this.prismaService.usuarios_solicitudes_cuenta.create({
          data: {
            nombre: dto.nombre,
            apellido: dto.apellido,
            correo: dto.correo,
            dial_code: dto.dial_code,
            telefono: dto.telefono,
            documento: dto.documento,
            id_verificador: usuarioAsignar.rows[0].id,
          },
        });
      return userSolicitud;
    } catch (error) {
      throw error;
    }
  }

  async verificarTokenSolicitud(data: TokenSolicitud, verificar_exp = true) {
    try {
      const tokenHash = createHash('sha256').update(data.token).digest('hex');
      const tokenData =
        await this.prismaService.tokens_usuarios_solicitudes.findFirst({
          where: {
            token_hash: tokenHash,
            activo: true,
            id_usuario_solicitud: data.id_usuario_solicitud,
          },
        });

      if (!tokenData) {
        throw new NotFoundException('Token no encontrado');
      }

      const tokenVencimiento = tokenData.fecha_vencimiento;

      if (verificar_exp) {
        if (!tokenVencimiento)
          throw new BadRequestException('Token no tiene fecha de vencimiento');
        const isExpired = tokenVencimiento < new Date();
        if (isExpired) {
          throw new BadRequestException('Token expirado');
        }
      }
      return { token_id: tokenData.id };
    } catch (error) {
      throw error;
    }
  }

  async regenerarTokenVerificacion(data: { token: string; cedula: string }) {
    try {

      const usuarioSolicitud =
        await this.prismaService.usuarios_solicitudes_cuenta.findFirst({
          where: { documento: data.cedula, id_estado: 3, activo: true },
        });

      if (!usuarioSolicitud) {
        throw new NotFoundException('Solicitud verificacion no encontrada');
      }

      const { token_id } = await this.verificarTokenSolicitud({ token: data.token, id_usuario_solicitud: usuarioSolicitud.id }, false);

      // regenerar token a solicitudes aprobadas
      
      

      // deactivar otros tokens generados
      await this.prismaService.tokens_usuarios_solicitudes.update({
        where: { id: token_id },
        data: {
          activo: false,
        },
      });
      const {token} = await this.generarTokenSolicitud(usuarioSolicitud.id);
      return { token, documento: usuarioSolicitud.documento };
    } catch (error) {
      throw error;
    }
  }

  async generarTokenSolicitudById(id_usuario_solicitud: number) {
    try {
      // BUSCAR TOKENS ANTERIORES E INVALIDARLOS
      const tokenAnteriores = await this.prismaService.tokens_usuarios_solicitudes.findMany({
        where: { id_usuario_solicitud, activo: true },
      });

      if (tokenAnteriores.length > 0) {
        const ids = tokenAnteriores.map(token => token.id);
        await this.prismaService.tokens_usuarios_solicitudes.updateMany({
          where: { id: { in: ids } },
          data: { activo: false },
        });
      }

      const user = await this.prismaService.usuarios_solicitudes_cuenta.findUnique({
        where: { id: id_usuario_solicitud },
      });

      if (!user) {
        throw new NotFoundException('Solicitud no encontrada');
      }
      const {token} = await this.generarTokenSolicitud(id_usuario_solicitud);

      return { token: token, documento: user.documento, id_usuario_solicitud: user.id };
    } catch (error) {
      throw error;
    }
  }

  async generarTokenSolicitud(id_usuario_solicitud: number) {
    try {
      const { token, tokenHash } = generateToken();

      const fecha_vencimiento = new Date();
      fecha_vencimiento.setHours(fecha_vencimiento.getHours() + 1); // Establecer la fecha de vencimiento a 1 hora a partir de ahora

      await this.prismaService.tokens_usuarios_solicitudes.create({
        data: {
          token_hash: tokenHash,
          id_usuario_solicitud,
          fecha_creacion: new Date(),
          fecha_vencimiento,
        },
      });

      return { token, tokenHash };
    } catch (error) {
      throw error;
    }
  }

  async getSolicitudById(id: number) {
    try {
      const solicitud =  await this.prismaService.usuarios_solicitudes_cuenta.findUnique({
        select:{
          apellido: true,
          nombre: true,
          documento: true,
          dial_code: true,
          telefono: true,
          id_estado: true,
          cedula_frontal: true,
          cedula_reverso: true,
          selfie: true,
          correo: true,
          id: true,
          observacion: true
        },

        where: { id, activo: true },
      });
      if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
      return solicitud;
    } catch (error) {
      throw error;
    }
  }
}
