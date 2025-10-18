import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { DatabaseModule } from '@/database/database.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { TipoTicketService } from './tipo-ticket/tipo-ticket.service';
import { SoporteService } from '@/usuarios/soporte/soporte.service';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService, TipoTicketService, SoporteService],
  imports: [PrismaModule,DatabaseModule,FirebaseModule]
})
export class TicketsModule {}
