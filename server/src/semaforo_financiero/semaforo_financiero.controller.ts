import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { SemaforoFinancieroService } from './semaforo_financiero.service';
import { CreateSemaforoFinancieroDto, RegistrarAbonoMovimientoDto, RegistrarAbonoMovimientoPayloadDto } from './dto/create-semaforo_financiero.dto';
import { BorrarAbonoSemaforoFinancieroDto, UpdateSemaforoFinancieroDto } from './dto/update-semaforo_financiero.dto';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { ResponseSemaforoFinancieroDto } from './dto/response-semaforo.dto';
import { QuerySemaforoFinancieroByUsuarioDto } from './dto/query-semaforo-financiero';

@Controller('semaforo-financiero')
export class SemaforoFinancieroController {
  constructor(
    private readonly semaforoFinancieroService: SemaforoFinancieroService,
  ) {}

  @Post()
  create(
    @Body() createSemaforoFinancieroDto: CreateSemaforoFinancieroDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      createSemaforoFinancieroDto.id_usuario = req.user.userId;
    const movimientoNuevo = this.semaforoFinancieroService.create(
      createSemaforoFinancieroDto,
    );
    return res.status(200).json({message:"Movimiento creado con éxito"});
    } catch (error) {
      throw error;
    }
  }

  @Get()
  getSemaforoFinanciero(@Req() req: AuthenticatedRequest, @Query() query?: QuerySemaforoFinancieroByUsuarioDto) {
    try {
      return this.semaforoFinancieroService.finanzasDeglosadasPorUsuario(req.user.userId, query);
    } catch (error) {
      throw error;
    }
  }


  @Post('abonos')
    async registrarAbono(
      @Body() registrarAbonoMovimientoDto: RegistrarAbonoMovimientoPayloadDto,
      @Req() req: AuthenticatedRequest,
      @Res() res: Response,
    ) {
      try {
        const dataEnviar:RegistrarAbonoMovimientoDto = {
          ...registrarAbonoMovimientoDto,
          id_usuario: req.user.userId,
        }
        const resultado = await this.semaforoFinancieroService.registrarAbonoMovimiento(
          registrarAbonoMovimientoDto.id_movimiento,
          dataEnviar
        );
        return res.status(200).json({ message: "Abono registrado con éxito" });
      } catch (error) {
        throw error;
      }
    
  }


  @Get(':id')
  findOneByIdUser(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    try {
      const mov = this.semaforoFinancieroService.findOneByIdUser(id, req.user.userId);
    const movSerializado  = plainToInstance(ResponseSemaforoFinancieroDto, mov, { excludeExtraneousValues: true });
    return movSerializado;
    } catch (error) {
      throw error;
    }
  }


  @Put(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id',ParseIntPipe) id: number,
    @Body() updateSemaforoFinancieroDto: UpdateSemaforoFinancieroDto,
    @Res() res: Response,
  ) {
   try {
     updateSemaforoFinancieroDto.id_usuario = req.user.userId;

     const resultado = this.semaforoFinancieroService.update(
      id,
      updateSemaforoFinancieroDto,
    );
    return res.status(200).json({message:"Movimiento actualizado con éxito"});
   } catch (error) {
     throw error;
   }
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number, @Res() res: Response) {
    try {
      const resultado = this.semaforoFinancieroService.remove(id);
    return res.status(200).json({message:"Movimiento eliminado con éxito"});
    } catch (error) {
      throw error;
    }
  }

  @Delete('abonos/:id')
  async eliminarAbono(@Param('id',ParseIntPipe) id: number, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const dataEnviar:BorrarAbonoSemaforoFinancieroDto = {
        id_usuario: req.user.userId,
      }
      const resultado = await this.semaforoFinancieroService.eliminarabono(id, dataEnviar);
      return res.status(200).json({message:"Abono eliminado con éxito"});
    } catch (error) {
      throw error;
    }
  }
}
