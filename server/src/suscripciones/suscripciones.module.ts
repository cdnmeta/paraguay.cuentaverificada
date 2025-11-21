import { Module } from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { SuscripcionesController } from './suscripciones.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  controllers: [SuscripcionesController],
  providers: [SuscripcionesService],
  imports: [PrismaModule,DatabaseModule],
})
export class SuscripcionesModule {}
