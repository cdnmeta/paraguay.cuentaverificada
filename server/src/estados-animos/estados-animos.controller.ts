import { Body, Controller, Get, Query, Res } from '@nestjs/common';
import { EstadosAnimosService } from './estados-animos.service';
import { Response } from 'express';
import { ObtenerMensajeDelDiaDto } from './dto/obtner-mensaje.dto';
import { IsPublic } from '@/auth/decorators/public.decorator';

@Controller('estados-animos')
export class EstadosAnimosController {
  constructor(private readonly estadosAnimosService: EstadosAnimosService) {}
  @Get('obtener-mensaje')
  @IsPublic()
  async obtenerMensajeDiario(
    @Res() res: Response,
    @Query() query: ObtenerMensajeDelDiaDto,
  ) {
    const mensaje = await this.estadosAnimosService.obtenerMensajeDiario(query);
    return res.status(200).json(mensaje);
  }
}
