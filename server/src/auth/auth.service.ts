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
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UsuariosService } from '@/usuarios/usuarios.service';
import { VerificacionCuentaService } from '@/verificacion-cuenta/verificacion-cuenta.service';
import { TokenSolicitud } from '@/verificacion-cuenta/types/token-solicitudes';
import { EmailService } from '@/email/email.service';
import { RecoveryPinEmail } from '@/email/types/recovery';
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

  async register(
    registerDto: RegisterUsuariosDto,
    files: UsuariosArchivosRegister,
  ) {
    const { cedulaFrente } = files;
    try {
      const sqlUserExiste =
        'SELECT id FROM usuarios WHERE documento = $1 or email = $2';
      const user = await this.db.query(sqlUserExiste, [
        registerDto.documento,
        registerDto.correo,
      ]);
      if ((user.rowCount ?? 0) > 0) {
        throw new BadRequestException(
          'Usuario con ese documento o correo ya existe',
        );
      }

      // guardar ususario en firebase para autenticación
      const firebaseUser = await this.firebaseService.createUser({
        email: registerDto.correo,
        password: registerDto.contrasena,
        displayName: `${registerDto.nombre} ${registerDto.apellido}`,
      });

      // encriptar contraseña
      const contrasenaEncryptada = await encrypt(registerDto.contrasena);

      const newUser = await this.prismaService.usuarios.create({
        data: {
          nombre: registerDto.nombre,
          apellido: registerDto.apellido,
          documento: registerDto.documento,
          email: registerDto.correo,
          password: contrasenaEncryptada,
          uid_firebase: firebaseUser.uid,
          sexo: registerDto.sexo ? parseInt(registerDto.sexo) : null,
          fecha_nacimiento: registerDto.fechaNacimiento
            ? new Date(registerDto.fechaNacimiento)
            : null,
          metodo_registro: registerDto.metodoRegistro || null,
        },
      });

      // guardar la cedula del usarios

      if (cedulaFrente) {
        const extension = cedulaFrente.mimetype.split('/')[1];
        // Generar un nombre único para el archivo
        const fileName = `${generarUUIDHASH()}.${extension}`;
        const filePath = `${FIREBASE_STORAGE_FOLDERS.cedulasUsuarios}/${fileName}`;
        const rutaArchivo = await this.firebaseService.subirArchivoPrivado(
          cedulaFrente.buffer,
          filePath,
          cedulaFrente.mimetype,
        );

        // Actualizar el usuario con la ruta del archivo
        await this.prismaService.usuarios.update({
          where: { id: newUser.id },
          data: {
            cedula_frente: rutaArchivo,
          },
        });
      }

      const { password, ...userResponse } = newUser;
      // Aquí podrías enviar un correo de bienvenida o realizar otras acciones
      return userResponse;
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

  async generarTokenForUser(id_usuario: number) {
    try {
      const { token, tokenHash } = generateToken();

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
          token_hash: tokenHash,
          fecha_creacion: new Date(),
          fecha_vencimiento,
        },
      });

      if (!userExist.documento)
        throw new BadRequestException('El usuario no tiene documento asociado');

      return { token, tokenHash, idToken: tokenCreado.id };
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

      const dataCorreo: RecoveryPinEmail = {
        nombreDestinatario: `${userEncontrado.nombre} ${userEncontrado.apellido ? userEncontrado.apellido : ''}`,
        destinatario: userEncontrado.email,
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

  async resetContrasenaWithCedula(dto: CambiarContrasenaDto) {
    try {
      //1. buscar cedula
      const usuario = await this.prismaService.usuarios.findFirst({
        where: { documento: dto.cedula, activo: true },
      });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      //2. verificar token (si hay)

      if(dto.token){
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
      if (!usuario.pin) throw new BadRequestException('Usuario no tiene un pin configurado');
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
