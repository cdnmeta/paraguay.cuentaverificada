import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IsPublic } from './decorators/public.decorator';
import { RegisterUsuariosDto } from 'src/usuarios/dto/register-usuarios';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import {
  instanceToPlain,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { UsuarioRegisterResponseDto } from './dto/usuarioResponse.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { cert } from 'firebase-admin/app';
import { PrismaService } from '@/prisma/prisma.service';
import { CambiarContrasenaDto, InicializarPasswordPinByToken, RecoveryPinDto, SolicitudRecoveryPinDto, SolicitudRecoveryPinPayloadDto, ValidacionTokenDto } from './dto/password-recovery.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { IsOnlyAdmin } from './decorators/onlyAdmin.decorator';
import { RequireUserPinGuard } from './guards/requireUserPin.guard';
import { AuthenticatedRequest } from './types/AuthenticatedRequest';
import { URL_ORIGINS } from '@/utils/constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
    private readonly prismaService: PrismaService,
  ) {}

  @IsPublic()
  @UseInterceptors(FileInterceptor('cedulaFrente'))
  @Post('register')
  async register(
    @Body() registerDto: RegisterUsuariosDto,
    @Res() res: Response,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024, message: 'El archivo es demasiado grande. Máximo 2MB.' }), // 2MB
          new FileTypeValidator({ fileType: 'image/(jpeg|png|jpg)',}), // acepta JPG, PNG, JPG
        ],
        fileIsRequired: true, // opcional, true por defecto
      }),
    )
    cedulaFrente: Express.Multer.File,
  ) {

    const files = {
      cedulaFrente: cedulaFrente,
    }

    const user = await this.authService.register(registerDto, files);
    // serializar la respuesta
    const userResponse = plainToInstance(UsuarioRegisterResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return res.status(200).json({
      message: 'Usuario registrado exitosamente',
      //user: userResponse,
    });
  }

  @IsPublic()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.login(loginDto);
    const userJwt = this.authService.toJwtPayload(user);
    const customToken = await this.authService.autenticarWithFirebase(user);
    return res.status(200).json({ token: customToken, user: userJwt });
  }

  @IsPublic()
  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies['refresh_token'];
    if (!token) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.userId;
      const user = await this.usuariosService.getUserInfoJwt(userId);
      const userResponse = this.authService.toJwtPayload(user);
      const newTokens = await this.authService.generarTokens(userResponse);
      const accessToken = newTokens.access_token;
      this.authService.setTokenResponse(res, { access_token: accessToken });
      return res
        .status(200)
        .json({ message: 'Token refrescado correctamente' });
    } catch (error) {
      return res
        .status(401)
        .json({ message: 'Token de actualización inválido' });
    }
  }

  @IsPublic()
  @Post('refresh-token')
  async refreshTokenWithCredentials(@Body() refreshTokenDto: RefreshTokenDto, @Res() res: Response) {
    try {
      // Validar el token y obtener información del usuario
      const result = await this.authService.refreshTokenWithCedula(refreshTokenDto);
  

      return res.status(200).json({
        message: 'Token refrescado correctamente',
        token: result.token,
        cedula: result.cedula
      });
    } catch (error) {
     throw error
    }
  }

  @IsPublic()
  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res
      .status(200)
      .json({ message: 'Sesión cerrada exitosamente' });
  }

  @Get("me")
  async getMe(@Req() req: any, @Res() res: Response) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const userInfo = await this.usuariosService.getUserinfo(user.userId); 
    return res.status(200).json(userInfo);
  }
  

  @IsPublic()
  @Post('inicializar-credenciales-token')
  async inicializarPasswordPin(@Body() dto: InicializarPasswordPinByToken, @Res() res: Response) {
    try {
      await this.authService.inicializarPasswordPinByToken(dto);
      return res.status(200).json({ message: 'PIN y contraseña inicializados correctamente' });
    } catch (error) {
      throw error
    }
  }

  @Get("grupos")
  @IsOnlyAdmin()
  async getGruposHabilitados(@Res() res: Response) {
    try {
      const grupos = await this.authService.getGruposHabilitados();
      return res.status(200).json(grupos);
    } catch (error) {
      throw error;
    }
  }


  @IsPublic()
  @Post("solicitud-recovery-pin")
  async recoveryPin(@Body() body: SolicitudRecoveryPinPayloadDto, @Res() res: Response, @Req() req: AuthenticatedRequest) {
    try {
      console.log(req)
      let url_origen = URL_ORIGINS[0]
      if(!url_origen) throw new BadRequestException('No se pudo determinar el origen de la solicitud. Asegúrese de que la cabecera "Origin" esté presente.');
      const data: SolicitudRecoveryPinDto = {
        ...body,
        url_origen: url_origen,
      }
      await this.authService.SolicitudRecoveryPin(data);
      return res.status(200).json({ message: 'PIN de recuperación enviado exitosamente' });
    } catch (error) {
      throw error;
    }
  }

  @IsPublic()
  @Get("verificar-token")
  async verifyToken(@Query() query: ValidacionTokenDto, @Res() res: Response) {
    try {
      if(!query.token) throw new BadRequestException('El token no puede estar vacío');
      await this.authService.verificarToken(query);
      return res.status(200).json({ message: 'Token valido' });
    } catch (error) {
      throw error;
    }
  }

  @IsPublic()
  @Post("recovery-pin")
  async resetPin(@Body() body: RecoveryPinDto, @Res() res: Response) {
    try {
      await this.authService.resetPin(body);
      return res.status(200).json({ message: 'PIN restablecido exitosamente' });
    } catch (error) {
      throw error;
    }
  }

  @IsPublic()
  @Post("reset-contrasena")
  async resetContrasena(@Body() body: CambiarContrasenaDto, @Res() res: Response) {
    try {
      await this.authService.resetContrasenaWithCedula(body);
      return res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
      throw error;
    }
  }

}
