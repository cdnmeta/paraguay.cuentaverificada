import { Module } from '@nestjs/common';
import { EstadosAnimosService } from './estados-animos.service';
import { EstadosAnimosController } from './estados-animos.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { DatabaseModule } from '@/database/database.module';
import { TipoEstadosService } from './tipo-estados/tipo-estados.service';

@Module({
  controllers: [EstadosAnimosController],
  providers: [EstadosAnimosService, TipoEstadosService],
  imports: [PrismaModule, DatabaseModule],
})
export class EstadosAnimosModule {}
