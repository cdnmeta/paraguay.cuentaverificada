import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { INotificationChannel, NotificationMessage, SendResult } from './notification-channel.interface';
import { NotificationChannel } from '../enums/notification.enums';

@Injectable()
export class FcmChannelService implements INotificationChannel {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  getChannel(): NotificationChannel {
    return NotificationChannel.FCM;
  }

  async send(userId: number, message: NotificationMessage): Promise<SendResult> {
    try {
      // 1. Obtener tokens FCM del usuario
      const tokens = await this.getUserFcmTokens(userId);
      
      if (tokens.length === 0) {
        return {
          success: false,
          channel: this.getChannel(),
          error: 'No FCM tokens found for user',
        };
      }

      // 2. Enviar a Firebase (simplificado para múltiples tokens)

      await this.firebaseService.messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: message.title,
            body: message.body,
          },
      })
     

      return {
        success: true,
        channel: this.getChannel(),
      };
    } catch (error) {
      return {
        success: false,
        channel: this.getChannel(),
        error: error.message,
      };
    }
  }

  private async getUserFcmTokens(userId: number): Promise<string[]> {
    const suscripciones = await this.prismaService.usuarios_notificaciones_push.findMany({
      where: {
        id_usuario: userId,
        proveedor: 'fcm',
        activo: true,
      },
    });

    return suscripciones
      .filter(s => typeof s.token === 'string' && s.token.length > 0)
      .map(s => s.token as string);
  }
}