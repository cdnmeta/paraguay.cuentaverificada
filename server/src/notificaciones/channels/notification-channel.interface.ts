import { NotificationChannel } from '../enums/notification.enums';

export interface NotificationMessage {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface SendResult {
  success: boolean;
  channel: NotificationChannel;
  error?: string;
}

export interface INotificationChannel {
  getChannel(): NotificationChannel;
  send(userId: number, message: NotificationMessage): Promise<SendResult>;
}