import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { SolicitudCuentaDto } from '../verificacion-cuenta/dto/solicitud-cuenta.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import { ArchivosSolicitudCuenta } from './types/archivos-solicitud';
import { validateImageOrThrow } from '@/pipes/ImageValiationPipe';
import { Response } from 'express';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { UserByQuery } from './types/usuarios-query';
import { UserResponseDto } from './dto/user-response.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { AgregarGrupoUsuario } from './dto/register-usuarios';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  

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

  @Post('agregar-grupo')
  async agregarUsuarioGrupo(
    @Body() body: AgregarGrupoUsuario,
    @Res() res: Response
  ) {
    try {
      await this.usuariosService.agregarUsuarioGrupo(body);
      return res.status(200).json({ message: 'Usuario agregado al grupo exitosamente' });
    } catch (error) {
      throw error;
    }
  }

  @Get("query-one")
  async getUserByQuery(@Query() query: UserByQuery) {
    try {
      if (Object.keys(query).length === 0) {
        throw new BadRequestException('No query parameters provided');
      }
      const user = await this.usuariosService.getUserByQuery(query);
      const userResponse = plainToInstance(UserResponseDto, user,{excludeExtraneousValues:true});
      return userResponse;
    } catch (error) {
      throw error;
    }
  }
}
