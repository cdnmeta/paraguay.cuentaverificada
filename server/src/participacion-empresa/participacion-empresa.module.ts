import { Module } from '@nestjs/common';
import { ParticipacionEmpresaService } from './participacion-empresa.service';
import { ParticipacionEmpresaController } from './participacion-empresa.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { DatabaseModule } from '@/database/database.module';


@Module({
  controllers: [ParticipacionEmpresaController],
  providers: [ParticipacionEmpresaService],
  imports: [PrismaModule,DatabaseModule]
})
export class ParticipacionEmpresaModule {}
