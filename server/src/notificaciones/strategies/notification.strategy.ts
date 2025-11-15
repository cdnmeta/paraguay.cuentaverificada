import { NotificationRequest } from "../types/notification.types";

export interface INotificationStrategy {
  canHandle(channel: string): boolean; // define si la estrategia puede manejar el canal dado
  send(request: NotificationRequest): Promise<{ ok: boolean; error?: string }>; // envía la notificación
}