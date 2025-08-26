import { Module } from '@nestjs/common';
import { PlanesService } from './planes.service';
import { PlanesController } from './planes.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  controllers: [PlanesController],
  providers: [PlanesService],
  imports: [PrismaModule]
})
export class PlanesModule {}
