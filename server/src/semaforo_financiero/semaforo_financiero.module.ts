import { Module } from '@nestjs/common';
import { SemaforoFinancieroService } from './semaforo_financiero.service';
import { SemaforoFinancieroController } from './semaforo_financiero.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  controllers: [SemaforoFinancieroController],
  providers: [SemaforoFinancieroService],
  imports: [PrismaModule, DatabaseModule],
})
export class SemaforoFinancieroModule {}
