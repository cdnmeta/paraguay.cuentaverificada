import { Injectable } from '@nestjs/common';
import { RecoveryPinEmail } from './types/recovery';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

    async sendPinRecoveryEmail(body:RecoveryPinEmail): Promise<SentMessageInfo>{ 
       try {
        const resultCorreo = await this.mailerService.sendMail({
        from: `${process.env.EMAIL_ALIAS} <${process.env.EMAIL_USERNAME}>`,
        to: `"${body.nombreDestinatario}" <${body.destinatario}>`,
        subject: 'Recuperación de PIN',
        html: `<p>Haga clic en el siguiente enlace para recuperar su PIN:</p>
               <a href="${body.url}">${body.url}</a>`,
        })
        return resultCorreo
       } catch (error) {
        throw error;
       }
    }
}
