import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { NotificationRequestDto } from './dto/notification-request.dto';
import { INotificationChannel, NotificationMessage } from './channels/notification-channel.interface';
import { FcmChannelService } from './channels/fcm-channel.service';
import { EmailChannelService } from './channels/email-channel.service';
import { NotificationChannel } from './enums/notification.enums';

@Injectable()
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  private readonly channels = new Map<NotificationChannel, INotificationChannel>();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly fcmChannel: FcmChannelService,
    private readonly emailChannel: EmailChannelService,
  ) {
    // Registro simple de canales disponibles
    this.channels.set(NotificationChannel.FCM, this.fcmChannel);
    this.channels.set(NotificationChannel.EMAIL, this.emailChannel);
  }

  async processNotification(request: NotificationRequestDto) {
    try {
      // 1. Crear mensaje básico
      const message: NotificationMessage = {
        title: request.title,
        body: request.description || '',
        data: request.data || {},
      };

      // 2. Obtener canales del usuario (por ahora solo FCM por defecto - KISS)
      const userChannels = await this.getUserChannels(request.userId);

      // 3. Enviar por cada canal
      const results = await Promise.allSettled(
        userChannels.map(channel => this.sendToChannel(channel, request.userId, message))
      );

      // 4. Registrar en BD (simplificado)
      await this.prismaService.notificaciones_usuarios.create({
        data: {
          id_usuario: request.userId,
          titulo: request.title,
          cuerpo: request.description || '',
          id_tipo_notificacion: request.tipo_notificacion,
        },
      })

      return {
        success: true,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason }),
      };
    } catch (error) {
      this.logger.error('Error processing notification', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async getUserChannels(userId: number): Promise<NotificationChannel[]> {
    // Simplificado: por defecto solo FCM
    // Más adelante se puede hacer configurable por usuario
    return [NotificationChannel.FCM];
  }

  private async sendToChannel(channel: NotificationChannel, userId: number, message: NotificationMessage) {
    const channelService = this.channels.get(channel);
    if (!channelService) {
      return {
        success: false,
        channel,
        error: `Channel ${channel} not available`,
      };
    }

    return await channelService.send(userId, message);
  }

  
}