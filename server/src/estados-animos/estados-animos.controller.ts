import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { EstadosAnimosService } from './estados-animos.service';
import { Request, Response } from 'express';
import { ObtenerMensajeDelDiaDto } from './dto/obtner-mensaje.dto';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { CreateEstadosAnimosDtoPayload } from './dto/create-estados-animos.dto';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import {
  UpdateEstadoAnimoDto,
  UpdateEstadoAnimoDtoPayload,
} from './dto/update-estado-animo.dto';
import { TipoEstadosService } from './tipo-estados/tipo-estados.service';
import { IsOnlyAdmin } from '@/auth/decorators/onlyAdmin.decorator';
import { plainToInstance } from 'class-transformer';
import { TiposEstadosResponseDto } from './dto/tipos-estados-response.dto';
import { EstadosAnimosResponseDto } from './dto/esatados-animos-response.dto';

@Controller('estados-animos')
export class EstadosAnimosController {
  constructor(private readonly estadosAnimosService: EstadosAnimosService,
    private readonly tipoEstadosService: TipoEstadosService
  ) {}

  @Get('tipos-estados')
  async obtenerTiposEstados(
    @Res() res: Response,
  ) {
   try {
     const tipos = await this.tipoEstadosService.getDataTipoEstados();
     const responseTipos = plainToInstance(TiposEstadosResponseDto, tipos, { excludeExtraneousValues: true });
    return res.status(200).json(responseTipos);
   } catch (error) {
    return error;
   }
  }

  @IsOnlyAdmin()
  @Get('listado')
  async listarEstadosAnimos(
    @Res() res: Response,
  ) {
    try {
      console.log("hay consulta")
      const estadosAnimos = await this.estadosAnimosService.getListadoEsatdosAnimos();
      console.log(estadosAnimos)
      return res.status(200).json(estadosAnimos);
    } catch (error) {
      throw error;
    }
  }

  @Get('obtener-mensaje')
  @IsPublic()
  async obtenerMensajeDiario(
    @Res() res: Response,
    @Query() query: ObtenerMensajeDelDiaDto,
  ) {
    const mensaje = await this.estadosAnimosService.obtenerMensajeDiario(query);
    return res.status(200).json(mensaje);
  }

  @Post()
  async crearMensajeEstadoAnimo(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateEstadosAnimosDtoPayload,
  ) {
    try {
      const dataEnviar = {
        ...body,
        id_usuario: req.user.userId,
      };
      return this.estadosAnimosService.crearMensajeEstadoAnimo(dataEnviar);
    } catch (error) {
      throw error;
    }
  }

  /*Rutas dinamicas*/

  @Get(':id')
  async getMensajeEstadoAnimo(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    try {
      const estado = await this.estadosAnimosService.getEstadoAnimoById(id);
      const responseEstadosAnimos = plainToInstance(EstadosAnimosResponseDto, estado, { excludeExtraneousValues: true });
      return res.status(200).json(responseEstadosAnimos);
    } catch (error) {
      throw error;
    }
  }


  @Put(':id')
  async updateMensajeEstadoAnimo(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateEstadoAnimoDtoPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      const dataEnviar: UpdateEstadoAnimoDto = {
        ...body,
        id_usuario: req.user.userId,
      };
      return this.estadosAnimosService.updateMensajeEstadoAnimo(id, dataEnviar);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async eliminarMensajeEstadoAnimo(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      const dataEnviar = {
        id_usuario: req.user.userId,
      }
      return this.estadosAnimosService.eliminarMensajeEstadoAnimo(id, dataEnviar);
    } catch (error) {
      throw error;
    }
  }

}
