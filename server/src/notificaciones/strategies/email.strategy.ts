import { INotificationStrategy } from './notification.strategy';
import { NotificationRequest } from '../types/notification.types';
import { Injectable } from '@nestjs/common';
import { FirebaseService } from '@/firebase/firebase.service';
import { EmailService } from '@/email/email.service';


@Injectable()
export class EmailStrategy implements INotificationStrategy {
    constructor(private emailService: EmailService) {}
    canHandle(channel: string): boolean {
        return channel === 'email';
    }

    send(request: NotificationRequest): Promise<{ ok: boolean; error?: string; }> {
        const toEmails = request.emailConfig?.toEmail;
        if (!toEmails?.length) {
            return Promise.resolve({ ok: false, error: 'No email addresses provided' });
        }
        return this.emailService.sendMail({
            to: toEmails,
            subject: request.titulo || 'Notificación',
            html: '<p>' + request.descripcion + '</p>',
        })
    }

}