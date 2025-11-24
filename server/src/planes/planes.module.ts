import { Module } from '@nestjs/common';
import { PlanesService } from './planes.service';
import { PlanesController } from './planes.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  controllers: [PlanesController],
  providers: [PlanesService],
  imports: [PrismaModule,DatabaseModule],
})
export class PlanesModule {}
