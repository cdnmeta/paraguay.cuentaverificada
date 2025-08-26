import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CotizacionEmpresaService } from './cotizacion-empresa.service';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { CotizacionDto } from './dto/regitrar-cotizacion.dto';
import { Response } from 'express';

@Controller('cotizacion-empresa')
export class CotizacionEmpresaController {
  constructor(private readonly cotizacionEmpresaService: CotizacionEmpresaService) {}

  @Get('monedas')                                         
  async getMonedas() {
    return this.cotizacionEmpresaService.getMonedas();
  }

  @Get()
  async getCotizaciones() {
    return this.cotizacionEmpresaService.getCotizaciones();
  }

  @Post('registrar-cotizacion')
  async registrarCotizacionByMoneda(@Req() req:any,@Body() data: CotizacionDto, @Res() res: Response) {
    data.id_usuario_registro = req.user.userId;
    await this.cotizacionEmpresaService.registrarCotizacionByMoneda(data);
    return res.status(200).json({ message: 'Cotización registrada exitosamente' });
  }
}
