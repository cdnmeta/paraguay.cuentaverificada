import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificationProcessor } from './notificaciones.processor.service';
import { FcmChannelService } from './channels/fcm-channel.service';
import { EmailChannelService } from './channels/email-channel.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { NotificacionesController } from './notificaciones.controller';
import { FirebaseModule } from '@/firebase/firebase.module';
import { EmailModule } from '@/email/email.module';
import { DatabaseModule } from '@/database/database.module';


@Module({
  providers: [
    // Capa 1 - API pública
    NotificacionesService,
    
    // Capa 2 - Procesamiento
    NotificationProcessor,
    
    // Canales de notificación
    FcmChannelService,
    EmailChannelService,
  ],
  exports: [NotificacionesService],
  imports: [PrismaModule, FirebaseModule, EmailModule, DatabaseModule],
  controllers: [NotificacionesController],
})
export class NotificacionesModule {}
