// strategies/fcm.strategy.ts
import { INotificationStrategy } from './notification.strategy';
import { NotificationRequest } from '../types/notification.types';
import { Injectable } from '@nestjs/common';
import { FirebaseService } from '@/firebase/firebase.service';
import { PrismaService } from '@/prisma/prisma.service';


const INVALID_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/mismatched-credential',
  'messaging/sender-id-mismatch',
  // 'messaging/invalid-argument'  // úsalo con cuidado; valida que se refiera al token
]);

@Injectable()
export class FcmStrategy implements INotificationStrategy {
  constructor(private firebaseService: FirebaseService, private prismaService:PrismaService) {}

  canHandle(channel: string) { return channel === 'fcm'; }

  async send(req: NotificationRequest) {
    const tokens = req.fcmConfig?.tokens;

    if (!tokens?.length) return { ok: false, error: 'No FCM tokens' };

    const payload = {
      notification: { title: req.titulo ?? 'Notificación', body: req.descripcion ?? '' },
    };

    try {
      // divide en lotes si hay muchos tokens
       const result = await this.firebaseService.messaging.sendEachForMulticast({
        tokens,
        ...payload,
      });
      console.log("enviar por fmc",req, result);

      if( result.failureCount > 0 ) {
        const failedTokens: string[] = [];
        result.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error && INVALID_TOKEN_CODES.has(resp.error.code)) {
            failedTokens.push(tokens[idx]);
          }
        });

        // eliminar tokens inválidos de la base de datos
        if (failedTokens.length > 0) {
          await this.prismaService.usuarios_notificaciones_push.deleteMany({
            where: { token: { in: failedTokens }, proveedor: 'fcm' },
          })
        }


      }
      
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? 'fcm error' };
    }
  }
}
