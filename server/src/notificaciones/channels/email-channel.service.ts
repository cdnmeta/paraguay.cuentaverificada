import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { INotificationChannel, NotificationMessage, SendResult } from './notification-channel.interface';
import { NotificationChannel } from '../enums/notification.enums';

@Injectable()
export class EmailChannelService implements INotificationChannel {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  getChannel(): NotificationChannel {
    return NotificationChannel.EMAIL;
  }

  async send(userId: number, message: NotificationMessage): Promise<SendResult> {
    try {
      // 1. Obtener email del usuario
      const user = await this.prismaService.usuarios.findFirst({
        where: { id: userId, activo: true },
        select: { email: true },
      });

      if (!user?.email) {
        return {
          success: false,
          channel: this.getChannel(),
          error: 'No email found for user',
        };
      }

      // 2. Enviar email simple
      await this.emailService.sendMail({
        to: user.email,
        subject: message.title,
        html: `<h3>${message.title}</h3><p>${message.body}</p>`,
      });

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
}