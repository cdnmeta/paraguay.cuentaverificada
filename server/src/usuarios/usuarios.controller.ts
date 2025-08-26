import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { SolicitudCuentaDto } from './dto/solicitud-cuenta.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import { ArchivosSolicitudCuenta } from './types/archivos-solicitud';
import { validateImageOrThrow } from '@/pipes/ImageValiationPipe';
import { Response } from 'express';
import { IsPublic } from '@/auth/decorators/public.decorator';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @IsPublic()
  @Post('solicitud-cuenta')
  async registrarSolicitudCuenta(
    @Body() dto: SolicitudCuentaDto,
    @Res() res: Response,
  ) {
    try {
      const userSolicitud =
        await this.usuariosService.registrarSolicitudCuenta(dto);
      return res
        .status(200)
        .json({ message: 'Solicitud Recibida Correctamente' });
    } catch (error) {
      throw error;
    }
  }

  @Get('grupos')
  async getGruposByUsuarioSession(
    @Req() req: any
  ) {
    try {
      const id_usuario = req.user.userId;
      const grupos = await this.usuariosService.getGruposByUsuario(id_usuario);
      return grupos;
    } catch (error) {
      throw error;
    }
  }
}
