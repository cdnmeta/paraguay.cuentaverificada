import { Module } from '@nestjs/common';
import { PagoSuscripcionesService } from './pago-suscripciones.service';
import { PagoSuscripcionesController } from './pago-suscripciones.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { DatabaseModule } from '@/database/database.module';
import { CotizacionEmpresaModule } from '@/cotizacion-empresa/cotizacion-empresa.module';
import { VerificacionComercioModule } from '@/verificacion-comercio/verificacion-comercio.module';

@Module({
  controllers: [PagoSuscripcionesController],
  providers: [PagoSuscripcionesService],
  imports: [PrismaModule,DatabaseModule, CotizacionEmpresaModule,VerificacionComercioModule],
})
export class PagoSuscripcionesModule {}
