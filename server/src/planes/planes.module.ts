import { Module } from '@nestjs/common';
import { PlanesService } from './planes.service';
import { PlanesController } from './planes.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { DatabaseModule } from '@/database/database.module';
import { PlanesTiposRepartirService } from './planes-tipo-repartir/planes-tipos-repartir.service';

@Module({
  controllers: [PlanesController],
  providers: [PlanesService, PlanesTiposRepartirService],
  imports: [PrismaModule,DatabaseModule],
})
export class PlanesModule {}
