// notification.types.ts
export type NotificationChannel = 'email' | 'fcm' | 'sms' | 'whatsapp';

export interface NotificationTarget {
  userId?: number;      // preferible
  toEmail?: string;     // fallback directo
  fcmTokens?: string[]; // si ya los tenés resueltos
}



export interface NotificationRequest {
  channel: NotificationChannel
  titulo: string            // para push
  descripcion?: string
  prioridad?: 1 | 2 | 3
  emailConfig?: {
    subject?: string
    toEmail: string[]
    template?: string
    cc?: string[]
    bcc?: string[]
  }
  fcmConfig?: {
    data?: Record<string, any>
    androidPriority?: 'normal' | 'high'
    apnsPriority?: '5' | '10'
    tokens: string[]
  }

}
