import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateVerificacionCuentaDto } from './dto/create-verificacion-cuenta.dto';
import {
  AprobarCuenta,
  RechazoCuentaDto,
  UpdateVerificacionCuentaDto,
} from './dto/update-verificacion-cuenta.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { ImagenesVerificacionCuenta } from './types/imagenes-verificacion';
import { OpcionesVerificacionUsuario } from './types/opcionesVerificacionUsuario';
import {
  crearNombreArchivoDesdeMulterFile,
  generarCodigoNumericoAleatorio,
} from '@/utils/funciones';
import * as path from 'path';
import { FirebaseService } from '@/firebase/firebase.service';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { AuthService } from '@/auth/auth.service';
import {
  SolicitudCuentaDto,
  ValidarCodigoSolicitudDto,
} from './dto/solicitud-cuenta.dto';
import { generateToken } from '@/utils/security';
import { createHash } from 'crypto';
import { TokenSolicitud } from './types/token-solicitudes';
import { DatabaseService } from '@/database/database.service';
import {
  consulta_verificador_asignar,
  listadoSolicitudes,
} from './sql/consultas';
import { AprobarCuentaOpciones } from './types/services';
import { EmailService } from '@/email/email.service';
import {
  QueryListadoSolicitudes,
  QueryResumenSolicitudes,
} from './types/query';
import { NotificacionSolicitudVerificacionCuentaEmail } from '@/email/dto/email.dto';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { WalletService } from '@/wallet/wallet.service';
import { plainToClass, plainToInstance } from 'class-transformer';
import { UsuarioVerificadoDto } from './dto/response-solicitud-cuenta.dto';
@Injectable()
export class VerificacionCuentaService {
  constructor(
    private prismaService: PrismaService,
    private firebaseService: FirebaseService,
    private readonly dbservice: DatabaseService,
    private readonly dbPromiseService: DatabasePromiseService,
    private readonly walletService: WalletService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  async listadoUsuariosSolicitudes(query: QueryListadoSolicitudes) {
    try {
      const whereClausula: any = {};
      let sql = `SELECT
                  US.ID,
                  US.NOMBRE,
                  US.APELLIDO,
                  US.EMAIL,
                  US.ESTADO,
                  US.DIAL_CODE,
                  US.TELEFONO,
                  US.DOCUMENTO,
                  US.VERIFICADO,
                  US.ID_VERIFICADOR_ASIGNADO,
                  (VER.NOMBRE || ' ' || VER.APELLIDO) AS NOMBRE_VERIFICADOR
                FROM
                  USUARIOS US
                  LEFT JOIN USUARIOS VER ON VER.ID = US.ID_VERIFICADOR_ASIGNADO
                WHERE
                  US.ACTIVO = TRUE`;
      console.log(query);
      if (query.id_estado) {
        sql += ` and US.ESTADO = $(id_estado)`;
        whereClausula.id_estado = query.id_estado;
      }
      if (query.verificado) {
        console.log(query.verificado, typeof query.verificado);
        sql += ` and US.VERIFICADO = $(verificado)`;
        whereClausula.verificado = query.verificado;
      }
      const resultado = await this.dbPromiseService.result(sql, whereClausula);
      return resultado.rows;
    } catch (error) {
      throw error;
    }
  }

  async resumenSolicitudesCuenta(query: QueryResumenSolicitudes) {
    try {
      const whereClausula: any = {};
      let sql = `SELECT
        COALESCE(SUM(1) FILTER (WHERE US.ESTADO = 2),0) as cant_activos,
		    COALESCE(SUM(1) FILTER (WHERE US.ESTADO = 3),0) as cant_pend_verificacion,
        COALESCE(SUM(1) FILTER (WHERE US.verificado),0) as cant_verificados
      FROM
        usuarios US 
        where US.activo = true
        `;
      if (query.id_verificador) {
        sql += ` and US.id_verificador_asignado = $1`;
        whereClausula.id_verificador = Number(query.id_verificador);
      }

      const resultado = await this.dbservice.query(
        sql,
        Object.values(whereClausula),
      );
      return resultado.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async listadoUsuariosSolicitudesByVerificador(
    id_verificador: number,
    query: QueryListadoSolicitudes,
  ) {
    try {
      const clasulaWhere = {
        activo: true,
        id_verificador_asignado: id_verificador,
      };

      if (query.id_estado) {
        clasulaWhere['estado'] = query.id_estado;
      }

      const usuarios = await this.prismaService.usuarios.findMany({
        select: {
          id: true,
          email: true,
          nombre: true,
          estado: true,
          apellido: true,
          dial_code: true,
          telefono: true,
          documento: true,
          activo: true,
          verificado: true,
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
      const user = await this.prismaService.usuarios.findFirst({
        where: {
          id: id,
        },
      });

      if (!user) throw new NotFoundException('Solicitud no encontrada');

      //if(!user?.cedula_frontal  || !user?.cedula_reverso || !user?.selfie  ) throw new BadRequestException('La cedula o selfie es obligatoria, no se ha registrado, son necesarias para actualizar la solicitud');

      if (!user?.cedula_frente && !cedula_frontal)
        throw new BadRequestException(
          'La cedula frontal es obligatoria, no se ha registrado, es necesaria para actualizar la solicitud',
        );
      if (!user?.cedula_reverso && !cedula_reverso)
        throw new BadRequestException(
          'La cedula reverso es obligatoria, no se ha registrado, es necesaria para actualizar la solicitud',
        );
      if (!user?.selfie && !selfie_user)
        throw new BadRequestException(
          'La selfie es obligatoria, no se ha registrado, es necesaria para actualizar la solicitud',
        );

      let url_cedula_frontal = '';
      let url_cedula_reverso = '';
      let url_selfie_user = '';

      if (cedula_frontal) {
        const nombre_cedula_frontal = user?.cedula_frente
          ? path.basename(user?.cedula_frente)
          : crearNombreArchivoDesdeMulterFile(files?.cedula_frontal[0]);
        url_cedula_frontal = `${FIREBASE_STORAGE_FOLDERS.cedulasUsuarios}/${nombre_cedula_frontal}`;
        await this.firebaseService.subirArchivoPrivado(
          cedula_frontal.buffer,
          url_cedula_frontal,
          cedula_frontal.mimetype,
        );
      }

      if (cedula_reverso) {
        const nombre_cedula_reverso = user?.cedula_reverso
          ? path.basename(user?.cedula_reverso)
          : crearNombreArchivoDesdeMulterFile(files?.cedula_reverso[0]);
        url_cedula_reverso = `${FIREBASE_STORAGE_FOLDERS.cedulasUsuarios}/${nombre_cedula_reverso}`;
        await this.firebaseService.subirArchivoPrivado(
          cedula_reverso.buffer,
          url_cedula_reverso,
          cedula_reverso.mimetype,
        );
      }

      if (selfie_user) {
        const nombre_selfie_user = user?.selfie
          ? path.basename(user?.selfie)
          : crearNombreArchivoDesdeMulterFile(files?.selfie_user[0]);
        url_selfie_user = `${FIREBASE_STORAGE_FOLDERS.selfieUsuarios}/${nombre_selfie_user}`;
        await this.firebaseService.subirArchivoPrivado(
          selfie_user.buffer,
          url_selfie_user,
          selfie_user.mimetype,
        );
      }

      await this.prismaService.usuarios.update({
        where: {
          id: id,
        },
        data: {
          nombre: updateVerificacionCuentaDto.nombre,
          apellido: updateVerificacionCuentaDto.apellido,
          documento: updateVerificacionCuentaDto.documento,
          telefono: updateVerificacionCuentaDto.telefono,
          dial_code: updateVerificacionCuentaDto.dial_code,
          email: updateVerificacionCuentaDto.correo,
          cedula_frente: url_cedula_frontal,
          cedula_reverso: url_cedula_reverso,
          selfie: url_selfie_user,
          fecha_actualizacion: new Date(),
          estado: 4, // colocar en pendiente aprobacion
          id_usuario_actualizacion:
          updateVerificacionCuentaDto.id_usuario_actualizacion,
          fecha_nacimiento: updateVerificacionCuentaDto.fecha_nacimiento ? new Date(updateVerificacionCuentaDto.fecha_nacimiento) : null,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async rechazarCuenta(dto: RechazoCuentaDto) {
    try {
      const id_estado_asignar = 5;
      const cuenta = await this.prismaService.usuarios.findFirst({
        where: {
          id: dto.id_usuario_rechazo,
        },
      });

      if (!cuenta) throw new NotFoundException('Cuenta no encontrada');

      if (cuenta.estado === id_estado_asignar)
        throw new BadRequestException(
          'La cuenta ya se encuentra en estado rechazado',
        );

      await this.prismaService.usuarios.update({
        where: {
          id: dto.id_usuario_rechazo,
        },
        data: {
          estado: 5, // estado 5 es "Verificacion Rechazada"
          motivo_rechazo: dto.motivo,
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
      const id_estado_asignar = 2; // estado 2 es "activo"
      const cuenta_aprobar_solicitud =
        await this.prismaService.usuarios.findFirst({
          where: {
            id: dto.id_usuario_aprobacion,
          },
        });

      if (!cuenta_aprobar_solicitud)
        throw new NotFoundException('Solicitud no encontrada');

      if (cuenta_aprobar_solicitud.estado !== 4)
        throw new BadRequestException(
          'La cuenta no se encuentra en estado pendiente de aprobacion',
        );

      if (Number(cuenta_aprobar_solicitud.verificado))
        throw new BadRequestException('La cuenta ya se encuentra verificada');

      // Envolver en una transacción de Prisma

      const usuarioSolicitud = await this.prismaService.$transaction(
        // verificar la cuenta del usuario
        async (tx) => {
          await tx.usuarios.update({
            where: {
              id: dto.id_usuario_aprobacion,
            },
            data: {
              estado: id_estado_asignar, // estado 2 es "activo"
              id_usuario_actualizacion: dto.id_usuario_actualizacion,
              fecha_actualizacion: new Date(),
              fecha_verificacion: new Date(),
              verificado: true,
            },
          });
          // crear wallet para el usuario
          const monedaWalletDefault = await this.prismaService.empresa_config.findFirst({
            select: { id_moneda_wallet: true },
            where: { id: 1 },
          });

          if(!monedaWalletDefault?.id_moneda_wallet){
            throw new BadRequestException('No se ha configurado la moneda por defecto para las wallets');
          }
          await this.walletService.crearWalletParaUsuario(
            {
              id_usuario: dto.id_usuario_aprobacion,
              id_moneda: monedaWalletDefault.id_moneda_wallet, // moneda por defecto es la configurada en empresa_config
            },
            tx,
          );
        },
      );

      return usuarioSolicitud;
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
        throw new BadRequestException(
          'No se encontró un verificador disponible',
        );
      }

      // generar codigo de verificacion
      const codigo_verificacion = generarCodigoNumericoAleatorio();

      // enviar correo al usuario con el codigo de verificacion
      const alias = `${dto.nombre} ${dto.apellido ? dto.apellido : ''}`;
      const dataCorreo = {
        to: `'${alias} <${dto.correo}>'`,
        codigo_verificacion: codigo_verificacion,
      };

      await this.emailService.sendCodVerificacionSolicitudCuenta(dataCorreo);

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
            codigo_verificacion: codigo_verificacion,
            ip_origen: dto.ip_origen,
            dispositivo_origen: dto.dispositivo,
            id_estado: dto.id_estado || 1, // estado 1 es "pendiente verificacion"
          },
        });
      return userSolicitud;
    } catch (error) {
      throw error;
    }
  }

  async validarSolicitudCuenta(dto: ValidarCodigoSolicitudDto) {
    try {
      const solicitud =
        await this.prismaService.usuarios_solicitudes_cuenta.findFirst({
          where: {
            id: dto.id_usuario,
            activo: true,
            id_estado: 5, // solo si esta en estado 5 (pendiente verificar codigo)
          },
        });

      if (!solicitud) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      // Validar código
      if (solicitud.codigo_verificacion !== dto.codigo_verificacion) {
        throw new BadRequestException('Código de verificación inválido');
      }

      // Actualizar solicitud para marcar como codigo verificado

      const solicitudActualizada =
        await this.prismaService.usuarios_solicitudes_cuenta.update({
          where: { id: dto.id_usuario },
          data: {
            id_estado: 1, // estado 1 es "Pendiente de Verificacion"
            fecha_actualizacion: new Date(),
            id_usuario_actualizacion: dto.id_usuario,
          },
        });

      return solicitudActualizada;
    } catch (error) {
      throw error;
    }
  }

  async obtenerCodigoVerificacion(id_usuario: number) {
    try {
      const solicitud =
        await this.prismaService.usuarios_solicitudes_cuenta.findFirst({
          where: {
            id: id_usuario,
            activo: true,
            id_estado: 1, // solo si esta en estado 1 (creado)
          },
        });

      if (!solicitud) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      // generar nuevo codigo de verificacion
      const nuevoCodigo = generarCodigoNumericoAleatorio();

      // actualizar solicitud con nuevo codigo
      await this.prismaService.usuarios_solicitudes_cuenta.update({
        where: { id: id_usuario },
        data: { codigo_verificacion: nuevoCodigo },
      });

      // enviar correo al usuario con el codigo de verificacion
      const alias = `${solicitud.nombre} ${solicitud.apellido ? solicitud.apellido : ''}`;
      const dataCorreo = {
        to: `'${alias} <${solicitud.correo}>'`,
        codigo_verificacion: nuevoCodigo,
      };
      await this.emailService.sendCodVerificacionSolicitudCuenta(dataCorreo);
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

      const { token_id } = await this.verificarTokenSolicitud(
        { token: data.token, id_usuario_solicitud: usuarioSolicitud.id },
        false,
      );

      // regenerar token a solicitudes aprobadas

      // deactivar otros tokens generados
      await this.prismaService.tokens_usuarios_solicitudes.update({
        where: { id: token_id },
        data: {
          activo: false,
        },
      });
      const { token } = await this.generarTokenSolicitud(usuarioSolicitud.id);
      return { token, documento: usuarioSolicitud.documento };
    } catch (error) {
      throw error;
    }
  }

  async generarTokenSolicitudById(id_usuario_solicitud: number) {
    try {
      // BUSCAR TOKENS ANTERIORES E INVALIDARLOS
      const tokenAnteriores =
        await this.prismaService.tokens_usuarios_solicitudes.findMany({
          where: { id_usuario_solicitud, activo: true },
        });

      if (tokenAnteriores.length > 0) {
        const ids = tokenAnteriores.map((token) => token.id);
        await this.prismaService.tokens_usuarios_solicitudes.updateMany({
          where: { id: { in: ids } },
          data: { activo: false },
        });
      }

      const user =
        await this.prismaService.usuarios_solicitudes_cuenta.findUnique({
          where: { id: id_usuario_solicitud },
        });

      if (!user) {
        throw new NotFoundException('Solicitud no encontrada');
      }
      const { token } = await this.generarTokenSolicitud(id_usuario_solicitud);

      return {
        token: token,
        documento: user.documento,
        id_usuario_solicitud: user.id,
      };
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
      const solicitud = await this.prismaService.usuarios.findUnique({
        select: {
          apellido: true,
          nombre: true,
          documento: true,
          dial_code: true,
          telefono: true,
          estado: true,
          cedula_frente: true,
          cedula_reverso: true,
          selfie: true,
          email: true,
          id: true,
          motivo_rechazo: true,
          fecha_nacimiento: true,
        },

        where: { id, activo: true },
      });
      if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
      return solicitud;
    } catch (error) {
      throw error;
    }
  }

  async solicitarVerificacionUsuario(
    userId: number,
    options?: OpcionesVerificacionUsuario,
  ) {
    try {
      const { notificar_por_correo = true } = options || {};
      const usuario = await this.prismaService.usuarios.findFirst({
        where: { id: userId, activo: true },
      });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      if (usuario.verificado)
        throw new BadRequestException('El usuario ya está verificado');

      if (usuario.estado === 3)
        throw new BadRequestException(
          'El usuario ya esta aguardando verificación',
        );

      // obtener verificador disponible
      const usuarioAsignar = await this.dbservice.transaction(async (tx) => {
        return await tx.query(consulta_verificador_asignar);
      });

      if (usuarioAsignar.rowCount == 0) {
        throw new BadRequestException(
          'No se encontró un verificador disponible',
        );
      }

      await this.prismaService.usuarios.update({
        where: { id: userId },
        data: {
          estado: 3, // estado 3 es "aguardando verificación"
          fecha_actualizacion: new Date(),
          id_verificador_asignado: usuarioAsignar.rows[0].id,
        },
      });

      const verificador =  plainToInstance(UsuarioVerificadoDto, usuarioAsignar.rows[0],{excludeExtraneousValues: true});

      if (notificar_por_correo) {
        const alias = `${usuario.nombre} ${usuario.apellido ? usuario.apellido : ''}`;
        const dataCorreo: NotificacionSolicitudVerificacionCuentaEmail = {
          to: `'${alias} <${usuario.email}>'`,
          nombre_usuario: usuario.nombre,
          email_usuario: usuario.email ?? '',
        };
        await this.emailService.sendNotificacionSolicitudVerificacionCuenta(
          dataCorreo,
        );
      }

      return {verificador: verificador};
    } catch (error) {
      throw error;
    }
  }
}
