import { Module } from '@nestjs/common';
import { ParticipantesService } from './participantes.service';
import { ParticipantesController } from './participantes.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  controllers: [ParticipantesController],
  providers: [ParticipantesService],
  imports: [PrismaModule,DatabaseModule]
})
export class ParticipantesModule {}
