import { Module } from '@nestjs/common';
import { EstadosAnimosService } from './estados-animos.service';
import { EstadosAnimosController } from './estados-animos.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  controllers: [EstadosAnimosController],
  providers: [EstadosAnimosService],
  imports: [PrismaModule, DatabaseModule],
})
export class EstadosAnimosModule {}
