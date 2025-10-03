import { Controller, Get, Param } from '@nestjs/common';
import { FacturasSuscripcionesService } from './facturas-suscripciones.service';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { IsOnlyAdmin } from '@/auth/decorators/onlyAdmin.decorator';

@Controller('facturas-suscripciones')
export class FacturasSuscripcionesController {
  constructor(
    private readonly facturasSuscripcionesService: FacturasSuscripcionesService,
  ) {}

  @Get('info-pago/:id')
  async getInfoPago(@Param('id') id: string) {
    return this.facturasSuscripcionesService.getInfoPago(+id);
  }
  @Get('ganancias-facturas')
  @IsOnlyAdmin()
  async getGananciasFacturas() {
    return this.facturasSuscripcionesService.getGananciasFacturas();
  }
}
