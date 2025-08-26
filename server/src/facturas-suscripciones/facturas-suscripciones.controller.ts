import { Controller, Get, Param } from '@nestjs/common';
import { FacturasSuscripcionesService } from './facturas-suscripciones.service';
import { IsPublic } from '@/auth/decorators/public.decorator';

@Controller('facturas-suscripciones')
export class FacturasSuscripcionesController {
  constructor(
    private readonly facturasSuscripcionesService: FacturasSuscripcionesService,
  ) {}

  @Get('info-pago/:id')
  async getInfoPago(@Param('id') id: string) {
    return this.facturasSuscripcionesService.getInfoPago(+id);
  }
}
