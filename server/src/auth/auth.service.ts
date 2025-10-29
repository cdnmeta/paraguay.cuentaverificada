import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import {
  CrearUsuarioDTO,
  RegisterUsuariosDto,
} from 'src/usuarios/dto/register-usuarios';
import {
  encrypt,
  generarUUIDHASH,
  generateToken,
  hash,
  verify,
} from '@/utils/security';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { createHash } from 'crypto';
import {
  CambiarContrasenaDto,
  InicializarPasswordPinByToken,
  RecoveryPinDto,
  SolicitudRecoveryPinDto,
  ValidacionTokenDto,
} from './dto/password-recovery.dto';
import { RefreshCodigoVerificacion, RefreshTokenDto } from './dto/refresh-token.dto';
import { UsuariosService } from '@/usuarios/usuarios.service';
import { VerificacionCuentaService } from '@/verificacion-cuenta/verificacion-cuenta.service';
import { TokenSolicitud } from '@/verificacion-cuenta/types/token-solicitudes';
import { EmailService } from '@/email/email.service';
import {
  RecoveryPinEmail,
  VerificacionSolicitudCuentaEmail,
} from '@/email/dto/email.dto';
import { UsuariosArchivos } from '@/usuarios/types/archivos-solicitud';
import { generarCodigoNumericoAleatorio } from '@/utils/funciones';
import { usuarios } from '@prisma/client';
interface UsuariosArchivosRegister {
  cedulaFrente?: Express.Multer.File;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService, // Asegúrate de tener este servicio configurado
    private readonly usuariosService: UsuariosService,
    private readonly verificacionCuentaService: VerificacionCuentaService,
    private readonly emailService: EmailService,
  ) {}
  async setTokenResponse(
    res: Response,
    token: { access_token: string; refresh_token?: string },
  ) {
    res.cookie('access_token', token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    // Check if refresh_token exists before setting it
    if (!token.refresh_token) return;
    res.cookie('refresh_token', token.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 1 month
    });
  }

  async generarTokens(payload: any) {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m', // duración típica
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      subject: 'refresh',
      expiresIn: '7d', // más duradero
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async verificarToken(data: ValidacionTokenDto, verificar_exp = true) {
    const { token } = data;
    try {
      const tokenHash = createHash('sha256').update(token).digest('hex');

      // buscar token
      const tokenData = await this.prismaService.usuario_tokens.findFirst({
        where: { token_hash: tokenHash, activo: true },
      });

      if (!tokenData) {
        throw new NotFoundException('Token no encontrado');
      }

      // buscar usuario
      const user = await this.prismaService.usuarios.findFirst({
        where: { id: tokenData.id_usuario, activo: true },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (user.documento != data.cedula) {
        throw new BadRequestException(
          'El token no corresponde a esta solicitud',
        );
      }

      // verificar si el token ha expirado
      if (tokenData.fecha_vencimiento && verificar_exp) {
        const isExpired = tokenData.fecha_vencimiento < new Date();
        if (isExpired) {
          throw new BadRequestException('Token expirado');
        }
      }

      return { token_id: tokenData.id, id_usuario: tokenData.id_usuario };
    } catch (error) {
      throw error;
    }
  }

  async register(registerDto: RegisterUsuariosDto, files?: UsuariosArchivos) {
    const { cedulaFrente, cedulaReverso, selfie } = files || {};
    try {
      const userExiste = await this.prismaService.usuarios.findFirst({
        where: {
          OR: [
            { documento: registerDto.documento },
            { email: registerDto.correo },
          ],
        },
      });

      if (userExiste) {
        if (userExiste.estado === 2) {
          return {...userExiste,activo:true}; // Si el usuario ya está activo, simplemente retorna el usuario existente
        }
      }

      const dataUsuarioNuevo: CrearUsuarioDTO = {
        nombre: registerDto.nombre,
        apellido: registerDto.apellido,
        contrasena: registerDto.contrasena,
        documento: registerDto.documento,
        correo: registerDto.correo,
        telefono: registerDto.telefono,
        dial_code: registerDto.dial_code,
        ip_origen: registerDto.ip_origen,
        dispositivo_origen: registerDto.dispositivo_origen,
        id_estado: 1, // activo por defecto
      };

      let userNew: usuarios | null = userExiste;

     if(!userNew){
       userNew  = await this.usuariosService.crearUsuario(
        dataUsuarioNuevo,
        {
          cedulaFrente,
          cedulaReverso,
          selfie,
        },
      );
     }

      const codigoVerificacion = await this.generarTokenForUser(userNew.id, {
        tipo_token: 2, // codigo verificacion
      });

      const alias = `${userNew.nombre} ${userNew.apellido ? userNew.apellido : ''}`;

      const datCorreo: VerificacionSolicitudCuentaEmail = {
        to: `${alias} <${userNew.email}>`,
        codigo_verificacion: codigoVerificacion.token, // codigo sin hashear
      };
      await this.emailService.sendCodVerificacionSolicitudCuenta(datCorreo);
      return {...userNew, activo: false};
    } catch (error) {
      throw error;
    }
  }

  async confirmarUsuarioVerificacionWithCedula(
    dto: ValidacionTokenDto,
  ): Promise<void> {
    try {
      const { cedula, token } = dto;
      const tokenData = await this.verificarToken(dto);
      if (!tokenData) {
        throw new BadRequestException('código no válido');
      }

      const user = await this.prismaService.usuarios.findFirst({
        where: { id: tokenData.id_usuario, activo: true },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (user.verificado) {
        throw new BadRequestException('Usuario ya verificado');
      }

      if (user.documento !== cedula) {
        throw new BadRequestException('Cédula no coincide con el usuario');
      }

      await this.prismaService.$transaction(async (prisma) => {
        await prisma.usuarios.update({
          where: { id: user.id },
          data: { estado: 2 }, // cambiar estado a activo (La verificacion se hace aparte)
        });

        // marcar token como usado
        await prisma.usuario_tokens.update({
          where: { id: tokenData.token_id },
          data: { activo: false },
        });
      });
    } catch (error) {
      throw error;
    }
  }

  async login(loginDTO: LoginDto) {
    try {
      const { documento, password } = loginDTO;
      const userAutenticar = await this.prismaService.usuarios.findFirst({
        where: { documento, activo: true },
      });
      if (!userAutenticar) {
        throw new BadRequestException('Usuario no Encontrado');
      }
      // Verificar el token de Firebase
      const contrasenaEncryptada = await verify(
        password,
        userAutenticar.password ?? '',
      );

      if (!contrasenaEncryptada) {
        throw new BadRequestException('Documento o contraseña incorrecta');
      }

      return userAutenticar;
    } catch (error) {
      throw error;
    }
  }

  async autenticarWithFirebase(user: any) {
    const userResponse = this.toJwtPayload(user);
    const userVerificado = await this.firebaseService.auth.getUser(
      user.uid_firebase,
    );
    if (userVerificado.emailVerified === false) {
      throw new BadRequestException(
        'Usuario no verificado. Por favor, verifica tu correo electrónico.',
      );
    }
    const customToken = await this.firebaseService.auth.createCustomToken(
      user.uid_firebase,
      userResponse,
    );
    return customToken;
  }

  async generarTokenForUser(
    id_usuario: number,
    options?: { tipo_token?: number },
  ) {
    try {
      const { tipo_token = 1 } = options || {};

      const tokenResult: any = {};

      if (tipo_token == 1) {
        // generar token alfanumerico
        const { token, tokenHash } = generateToken();
        tokenResult.token = token;
        tokenResult.tokenHash = tokenHash;
      } else if (tipo_token == 2) {
        // generar codigo numerico de 6 digitos
        const codigoNumerico = generarCodigoNumericoAleatorio();
        const tokenHash = createHash('sha256')
          .update(codigoNumerico)
          .digest('hex');
        tokenResult.token = codigoNumerico;
        tokenResult.tokenHash = tokenHash;
      }

      const userExist = await this.prismaService.usuarios.findFirst({
        where: { id: id_usuario },
      });

      if (!userExist) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const user_token_anterior =
        await this.prismaService.usuario_tokens.findFirst({
          where: { id_usuario: id_usuario },
          orderBy: { fecha_creacion: 'desc' },
        });

      // desactivar el token anterior
      if (user_token_anterior && user_token_anterior.activo == true) {
        await this.prismaService.usuario_tokens.update({
          where: { id: user_token_anterior.id },
          data: { activo: false },
        });
      }

      // registrar el nuevo token
      const fecha_vencimiento = new Date();
      fecha_vencimiento.setHours(fecha_vencimiento.getHours() + 1); // Establecer la fecha de vencimiento a 1 hora a partir de ahora
      const tokenCreado = await this.prismaService.usuario_tokens.create({
        data: {
          id_usuario: id_usuario,
          token_hash: tokenResult.tokenHash,
          fecha_creacion: new Date(),
          fecha_vencimiento,
          tipo_token: options?.tipo_token ?? 1, // 1= token validacion, 2=codigo verificacion
        },
      });

      if (!userExist.documento)
        throw new BadRequestException('El usuario no tiene documento asociado');

      return {
        token: tokenResult.token,
        tokenHash: tokenResult.tokenHash,
        idToken: tokenCreado.id,
      };
    } catch (error) {
      throw error;
    }
  }

  async inicializarPasswordPinByToken(dto: InicializarPasswordPinByToken) {
    try {
      // buscar la solicitud aprobada

      const user =
        await this.prismaService.usuarios_solicitudes_cuenta.findFirst({
          where: { documento: dto.cedula, id_estado: 3 },
        });

      if (!user) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      const dataConsultarToken: TokenSolicitud = {
        token: dto.token,
        id_usuario_solicitud: user.id,
      };

      const { token_id } =
        await this.verificacionCuentaService.verificarTokenSolicitud(
          dataConsultarToken,
        );

      if (!token_id) {
        throw new NotFoundException('token no valido');
      }

      // Actualizar la contraseña y el PIN del usuario

      const passHaheado = await encrypt(dto.password);
      const pinHaheado = await encrypt(dto.pin);

      const dataUsuarioNuevo: CrearUsuarioDTO = {
        nombre: user.nombre,
        apellido: user.apellido,
        contrasena: passHaheado,
        pin: pinHaheado,
        documento: user.documento,
        correo: user.correo,
        telefono: user.telefono,
        dial_code: user.dial_code,
      };

      await this.prismaService.$transaction(async (prisma) => {
        // Crear usuario en Firebase
        const firebaseUser = await this.firebaseService.auth.createUser({
          email: dataUsuarioNuevo.correo,
          password: dto.password,
          displayName: `${dataUsuarioNuevo.nombre} ${dataUsuarioNuevo.apellido}`,
          emailVerified: true,
        });

        // Crear usuario en la base de datos
        await prisma.usuarios.create({
          data: {
            nombre: dataUsuarioNuevo.nombre,
            apellido: dataUsuarioNuevo.apellido,
            documento: dataUsuarioNuevo.documento,
            email: dataUsuarioNuevo.correo,
            telefono: dataUsuarioNuevo.telefono,
            dial_code: dataUsuarioNuevo.dial_code,
            password: dataUsuarioNuevo.contrasena,
            pin: dataUsuarioNuevo.pin,
            cedula_frente: user.cedula_frontal,
            cedula_reverso: user.cedula_reverso,
            uid_firebase: firebaseUser.uid,
            ip_origen: dto.ip_origen,
            dispositivo_origen: dto.dispositivo_origen,
          },
        });

        // Marcar el token como utilizado
        await prisma.tokens_usuarios_solicitudes.update({
          where: { id: token_id },
          data: { activo: false },
        });
      });

      return { message: 'Contraseña y PIN creados correctamente' };
    } catch (error) {
      throw error;
    }
  }

  toJwtPayload(usuario: any) {
    return {
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      userId: usuario.id,
      isa: usuario.is_super_admin || false,
      //empresa : usuario.empresa
    };
  }

  async getGruposHabilitados() {
    try {
      const grupos = await this.prismaService.grupos.findMany({
        select: { id: true, descripcion: true },
        where: {
          id: {
            notIn: [4], // excluir inversionista
          },
        },
      });
      return grupos;
    } catch (error) {
      throw error;
    }
  }

  async SolicitudRecoveryPin(dto: SolicitudRecoveryPinDto) {
    let idTokenCreado: number | null = null;
    try {
      const userEncontrado = await this.prismaService.usuarios.findFirst({
        where: { documento: dto.cedula, activo: true, email: dto.correo },
      });

      if (!userEncontrado) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Aquí puedes agregar la lógica para enviar el PIN de recuperación

      // generar token temporal para restablecer el pin

      const { token, idToken } = await this.generarTokenForUser(
        userEncontrado.id,
      );
      idTokenCreado = idToken;

      // armar la url de recuperación y enviar correo

      if (!userEncontrado.email)
        throw new BadRequestException(
          'Usuario no tiene correo electrónico asociado',
        );

      const alias = `${userEncontrado.nombre} ${userEncontrado.apellido ? userEncontrado.apellido : ''}`;
      const dataCorreo: RecoveryPinEmail = {
        to: `${alias} <${userEncontrado.email}>`,
        url: `${dto.url_origen}/reset-pin?token=${token}&cedula=${userEncontrado.documento}`,
      };

      console.log(dataCorreo);

      const resultCorreo =
        await this.emailService.sendPinRecoveryEmail(dataCorreo);
      console.log(resultCorreo);
    } catch (error) {
      if (idTokenCreado) {
        // eliminar el token creado
        await this.prismaService.usuario_tokens.delete({
          where: { id: idTokenCreado },
        });
      }
      throw error;
    }
  }

  async resetPin(dto: RecoveryPinDto) {
    try {
      // Verificar el token

      const dataValidarToken: ValidacionTokenDto = {
        token: dto.token,
        cedula: dto.cedula,
      };
      const tokenValido = await this.verificarToken(dataValidarToken);
      if (!tokenValido) {
        throw new BadRequestException('Token inválido');
      }

      // Verificar la cédula
      const usuario = await this.prismaService.usuarios.findFirst({
        where: { documento: dto.cedula, activo: true },
      });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Actualizar el PIN
      const pinHaheado = await encrypt(dto.pin);
      await this.prismaService.usuarios.update({
        where: { id: usuario.id },
        data: { pin: pinHaheado },
      });

      return { message: 'PIN actualizado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refrescar token usando cédula y token como credenciales
   * Usa el sistema de tokens hasheados de la tabla usuario_tokens
   */
  async refreshTokenWithCedula(refreshTokenDto: RefreshTokenDto) {
    const { token, cedula } = refreshTokenDto;

    try {
      // 1. Hashear el token para buscar en la base de datos
      const tokenHash = createHash('sha256').update(token).digest('hex');

      // 2. Buscar el token en la tabla usuario_tokens

      const dataValidarToken: ValidacionTokenDto = {
        token: token,
        cedula: cedula,
      };

      const tokenValido = await this.verificarToken(dataValidarToken);

      // 3. crear token ya validado

      const tokenNuevo = await this.generarTokenForUser(tokenValido.id_usuario);

      return { token: tokenNuevo.token, cedula: cedula };
    } catch (error) {
      console.error('Error en refreshTokenWithCedula:', error);
      throw error;
    }
  }

  async refreshCodigoVerificacion(data:RefreshCodigoVerificacion){
    const { cedula } = data;

    try {

      const userEncontrado = await this.prismaService.usuarios.findFirst({
        where: { documento: cedula, activo: true },
      });

      if (!userEncontrado) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // 1. crear token ya validado

      const tokenNuevo = await this.generarTokenForUser(userEncontrado.id,{tipo_token:2});

      return { token: tokenNuevo.token, cedula: cedula };
    } catch (error) {
      throw error;
    }
  }



  async resetContrasenaWithCedula(dto: CambiarContrasenaDto) {
    try {
      //1. buscar cedula
      const usuario = await this.prismaService.usuarios.findFirst({
        where: { documento: dto.cedula, activo: true },
      });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      //2. verificar token (si hay)

      if (dto.token) {
        const dataValidarToken: ValidacionTokenDto = {
          token: dto.token,
          cedula: dto.cedula,
        };
        const tokenValido = await this.verificarToken(dataValidarToken);
        if (!tokenValido) {
          throw new BadRequestException('Token inválido');
        }
      }

      // 3. Validar pin (Obligatorio)
      if (!usuario.pin)
        throw new BadRequestException('Usuario no tiene un pin configurado');
      const pinMatches = await verify(dto.pin, usuario.pin);
      if (!pinMatches) throw new BadRequestException('Pin incorrecto');

      //4. actualizar contraseña
      const passHaheado = await encrypt(dto.password);
      await this.prismaService.usuarios.update({
        where: { id: usuario.id },
        data: { password: passHaheado },
      });

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      throw error;
    }
  }
}
