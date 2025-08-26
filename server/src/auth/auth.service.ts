import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { RegisterUsuariosDto } from 'src/usuarios/dto/register-usuarios';
import { encrypt, generarUUIDHASH, generateToken, verify } from '@/utils/security';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { URL_FRONTEND_REACT } from '@/utils/constants';
import { url } from 'inspector';

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
  ) {}
  async setTokenResponse(res: Response, token: { access_token: string, refresh_token?: string }) {
    res.cookie('access_token', token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    // Check if refresh_token exists before setting it
    if(!token.refresh_token) return;
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

  async generarLinkVerificacion(dataUri:{cedula:string,token:string}){
    const url = `${URL_FRONTEND_REACT}/verificacion-cuenta/?token=${encodeURIComponent(dataUri.token)}&cedula=${encodeURIComponent(dataUri.cedula)}`;
    return url;
  }

  async register(registerDto: RegisterUsuariosDto,files:UsuariosArchivosRegister) {

    const {cedulaFrente} = files;
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
          fecha_nacimiento: registerDto.fechaNacimiento ? new Date(registerDto.fechaNacimiento) : null,
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
          cedulaFrente.mimetype
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

  async login(
    loginDTO: LoginDto,
  ) {
    try {
      const { documento, password } = loginDTO;
      const userAutenticar = await this.prismaService.usuarios.findFirst({
        where: { documento, activo: true },
      });
      if (!userAutenticar) {
        throw new BadRequestException('Usuario no Encontrado');
      }
      // Verificar el token de Firebase
      const contrasenaEncryptada = await verify(password, userAutenticar.password ?? '');

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
    const userVerificado = await this.firebaseService.auth.getUser(user.uid_firebase);
    if(userVerificado.emailVerified === false) {
      throw new BadRequestException('Usuario no verificado. Por favor, verifica tu correo electrónico.');
    }
    const customToken = await this.firebaseService.auth.createCustomToken(user.uid_firebase, userResponse);
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

      const user_token_anterior = await this.prismaService.usuario_tokens.findFirst({
        where: { id_usuario: id_usuario },
        orderBy: { fecha_creacion: 'desc' },
      });

      // desactivar el token anterior
      if(user_token_anterior && user_token_anterior.activo == true){
        await this.prismaService.usuario_tokens.update({
          where: { id: user_token_anterior.id },
          data: { activo: false },
        });
      }

      // registrar el nuevo token
      const fecha_vencimiento = new Date();
      fecha_vencimiento.setHours(fecha_vencimiento.getHours() + 1); // Establecer la fecha de vencimiento a 1 hora a partir de ahora
      await this.prismaService.usuario_tokens.create({
        data: {
          id_usuario: id_usuario,
          token_hash: tokenHash,
          fecha_creacion: new Date(),
          fecha_vencimiento,
        },
      });

      if(!userExist.documento) throw new BadRequestException('El usuario no tiene documento asociado');


      return { token, tokenHash, url_verificacion: this.generarLinkVerificacion({ cedula: userExist.documento, token }) };
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
}
