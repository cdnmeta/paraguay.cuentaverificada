import { Module } from '@nestjs/common';
import { FacturasSuscripcionesService } from './facturas-suscripciones.service';
import { FacturasSuscripcionesController } from './facturas-suscripciones.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  controllers: [FacturasSuscripcionesController],
  providers: [FacturasSuscripcionesService],
  imports: [PrismaModule,DatabaseModule]
})
export class FacturasSuscripcionesModule {}
