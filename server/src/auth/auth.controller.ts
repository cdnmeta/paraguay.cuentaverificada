import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  Res,
  UploadedFile,
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
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
}
