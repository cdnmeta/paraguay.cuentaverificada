import { Controller, Get, Req } from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';

@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly suscripcionesService: SuscripcionesService) {}

  @Get('mis-suscripciones')
  async getMisSuscripciones(@Req() req: AuthenticatedRequest) {
    try {
      const userId = req.user.userId;
      return this.suscripcionesService.obtenerSuscripcionesPorUsuario(userId);
    } catch (error) {
      throw error;
    }
  }
}
