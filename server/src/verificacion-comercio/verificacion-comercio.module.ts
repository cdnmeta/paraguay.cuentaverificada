import { Module } from '@nestjs/common';
import { VerificacionComercioService } from './verificacion-comercio.service';
import { VerificacionComercioController } from './verificacion-comercio.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { DatabaseModule } from '@/database/database.module';
import { ParticipantesModule } from '@/participantes/participantes.module';
import { NotificacionesModule } from '@/notificaciones/notificaciones.module';

@Module({
  controllers: [VerificacionComercioController],
  providers: [VerificacionComercioService],
  exports:[VerificacionComercioService],
  imports: [PrismaModule,FirebaseModule,DatabaseModule,ParticipantesModule, NotificacionesModule],
})
export class VerificacionComercioModule {}
