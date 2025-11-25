
export interface NotificationRequest { 
  titulo: string            // para push
  descripcion?: string
  code: String               // código de notificación para plantillas
  prioridad?: 1 | 2 | 3
  data?: Record<string, any>
  priority?: 'low' | 'normal' | 'high'
}
