import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
  Put,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { ComerciosService } from './comercios.service';
import {
  CreateComercioDto,
  CreateComercioPayloadDto,
} from './dto/create-comercio.dto';
import { UpdateComercioDto } from './dto/update-comercio.dto';
import {
  SolicitarVerificacionComercioDto,
  UpdateSeguimientoAprobacionComercioDto,
  UpdateSolicitudComercioDto,
} from './dto/solicitud-verficacion.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { plainToInstance } from 'class-transformer';
import { ResponseComercioDto } from './dto/response-comercio.dto';
import {
  QueryForUsers,
  QueryManyComercios,
} from './dto/query-comercios-users.dto';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import { validateImageOrThrow } from '@/pipes/ImageValiationPipe';
import { FilesVerificacionComercio } from './types/archivos-comercios';
import { Response } from 'express';

@Controller('comercios')
export class ComerciosController {
  constructor(private readonly comerciosService: ComerciosService) {}

  

  @Get('opciones-filtro')
  async getOpcionesFiltroComercios() {
    return this.comerciosService.getOpcionesFiltroComercios();
  }

  @IsPublic()
  @Get('buscar')
  async buscarComercios(@Query() query: any) {
    return this.comerciosService.buscarComercios(query);
  }

  @Get('aprobacion-pagos')
  async getComerciosAprovacionPagos() {
    return this.comerciosService.getComerciosAprovacionPagos();
  }

  @Get('query-many')
  async getComerciosByMany(@Query() query: QueryManyComercios) {
    try {
      return this.comerciosService.getComerciosByMany(query);
    } catch (error) {
      throw error;
    }
  }

  /*Rutas dinamicas*/

  @Get(':id')
  async findOneUser(@Req() req: any, @Param('id') id: string) {
    const comercio = await this.comerciosService.findOneUser(
      +id,
      req.user.userId,
    );
    const comercioResponse = plainToInstance(ResponseComercioDto, comercio, {
      excludeExtraneousValues: true,
    });
    console.log(comercioResponse);
    return comercioResponse;
  }

  @Get('user/:id')
  async findAllForUsers(
    @Param('id') id: string,
    @Query() query: QueryForUsers,
  ) {
    return this.comerciosService.findAllForUsers(+id, query);
  }

}
