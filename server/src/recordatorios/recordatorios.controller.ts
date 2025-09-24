import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  ValidationPipe,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RecordatoriosService } from './recordatorios.service';
import {
  CreateRecordatorioPayloadDto,
  CreateRecordatorioDto,
  UpdateRecordatorioDto,
  EliminarImagenesDto,
  UpdateRecordatorioPayloadDto,
  UpdateEstadoDto,
  UpdateEstadoPayloadDto,
} from './dto/recordatorios.dto';
import { Request, Response } from 'express';
import { Auth } from 'firebase-admin/lib/auth/auth';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import { plainToInstance } from 'class-transformer';
import { ResponseRecordatorioDto } from './dto/response-recordatorio.dto';

@Controller('recordatorios')
export class RecordatoriosController {
  constructor(private readonly recordatoriosService: RecordatoriosService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('imagenes', 10)) // Máximo 10 imágenes
  async crearRecordatorio(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body(ValidationPipe) payload: CreateRecordatorioPayloadDto,
    @UploadedFiles() imagenes?: Express.Multer.File[],
  ) {
    // Extraer id_usuario del token JWT autenticado
    const id_usuario = req.user.userId;
    
    // Crear el DTO completo con el id_usuario inyectado
    const createRecordatorioDto: CreateRecordatorioDto = {
      ...payload,
      id_usuario
    };
    try {
      const recordatorio =
        await this.recordatoriosService.registrarRecordatorio(
          createRecordatorioDto,
          imagenes,
        );
      return res.status(200).json({ message: 'Recordatorio creado exitosamente' });
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('imagenes', 10))
  async actualizarRecordatorio(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateRecordatorioDto: UpdateRecordatorioPayloadDto,
    @UploadedFiles() imagenes?: Express.Multer.File[],
  ) {
    try {
      const id_usuario = req.user.userId;
    const body:UpdateRecordatorioDto = {
      ...updateRecordatorioDto,
      id_usuario
    }
    const recordatorioActualizado = await this.recordatoriosService.actualizarRecordatorio(
      id,
      body,
      imagenes,
    );
    return res.status(200).json({ message: 'Recordatorio actualizado exitosamente'});
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async eliminarRecordatorio(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const id_usuario = req.user.userId;
    return this.recordatoriosService.eliminarRecordatorio(id, id_usuario);
  }

  @Delete(':id/permanente')
  async eliminarRecordatorioPermanente(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const id_usuario = req.user.userId;
    return this.recordatoriosService.eliminarRecordatorioPermanente(id, id_usuario);
  }

  @Delete(':id/imagenes')
  async eliminarImagenes(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) eliminarImagenesDto: EliminarImagenesDto,
  ) {
    const id_usuario = req.user.userId;
    const recordatorioActualizado = await this.recordatoriosService.eliminarImagenesRecordatorio(
      id,
      eliminarImagenesDto.urlsAEliminar,
      id_usuario,
    );

    return res.status(200).json({ message: 'Imágenes eliminadas exitosamente' });
  }

  @Get('mis-recordatorios')
  async obtenerMisRecordatorios(
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const id_usuario = req.user.userId;
      const recordatorio = await this.recordatoriosService.obtenerRecordatoriosPorUsuario(id_usuario);
      const recordatorioResponse = plainToInstance(ResponseRecordatorioDto, recordatorio, { excludeExtraneousValues: true });
      return recordatorioResponse;
    } catch (error) {
      throw error;
    }
  }

  @Get('usuario/:idUsuario')
  async obtenerRecordatoriosPorUsuario(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
  ) {
    // Este endpoint podría ser para administradores que pueden ver recordatorios de otros usuarios
    return this.recordatoriosService.obtenerRecordatoriosPorUsuario(idUsuario);
  }

  @Get(':id')
  async obtenerRecordatorioPorId(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const id_usuario = req.user.userId;
    return this.recordatoriosService.obtenerRecordatorioPorId(id, id_usuario);
  }

  @Put('estado/:id')
  async actualizarEstadoRecordatorio(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateEstadoDto: UpdateEstadoPayloadDto,
  ) {
   try {
     const id_usuario = req.user.userId;
    const body:UpdateEstadoDto = {
      ...updateEstadoDto,
      id_usuario
    }
    await this.recordatoriosService.actualizarEstadoRecordatorio(id, body);
    return res.status(200).json({ message: 'Estado del recordatorio actualizado exitosamente' });
   } catch (error) {
    throw error;
   }
  }
}
