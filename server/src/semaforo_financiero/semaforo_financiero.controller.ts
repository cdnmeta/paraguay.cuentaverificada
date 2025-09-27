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
} from '@nestjs/common';
import { SemaforoFinancieroService } from './semaforo_financiero.service';
import { CreateSemaforoFinancieroDto } from './dto/create-semaforo_financiero.dto';
import { UpdateSemaforoFinancieroDto } from './dto/update-semaforo_financiero.dto';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import { Response } from 'express';

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
    createSemaforoFinancieroDto.id_usuario = req.user.userId;
    const movimientoNuevo = this.semaforoFinancieroService.create(
      createSemaforoFinancieroDto,
    );
    return res.status(200).json({message:"Movimiento creado con éxito"});
  }

  @Get()
  getSemaforoFinanciero(@Req() req: AuthenticatedRequest) {
    return this.semaforoFinancieroService.finanzasDeglosadasPorUsuario(req.user.userId);
  }


  @Get(':id')
  findOneByIdUser(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.semaforoFinancieroService.findOneByIdUser(+id, req.user.userId);
  }


  @Put(':id')
  update(
    @Param('id',ParseIntPipe) id: number,
    @Body() updateSemaforoFinancieroDto: UpdateSemaforoFinancieroDto,
    @Res() res: Response,
  ) {
    const resultado = this.semaforoFinancieroService.update(
      id,
      updateSemaforoFinancieroDto,
    );
    return res.status(200).json({message:"Movimiento actualizado con éxito"});
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number, @Res() res: Response) {
    const resultado = this.semaforoFinancieroService.remove(id);
    return res.status(200).json({message:"Movimiento eliminado con éxito"});
  }
}
