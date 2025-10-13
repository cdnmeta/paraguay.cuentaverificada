import { Injectable } from '@nestjs/common';
import {
  NotificacionSolicitudVerificacionCuentaEmail,
  RecoveryPinEmail,
  VerificacionSolicitudCuentaEmail,
} from './dto/email.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPinRecoveryEmail(body: RecoveryPinEmail): Promise<SentMessageInfo> {
    // si es un array solo enviar al primero
    const toDestinatario = Array.isArray(body.to) ? body.to[0] : body.to;
    try {
      const resultCorreo = await this.mailerService.sendMail({
        from: `${process.env.EMAIL_ALIAS} <${process.env.EMAIL_USERNAME}>`,
        to: toDestinatario,
        bcc: body.bcc,
        cc: body.cc,
        subject: 'Recuperación de PIN',
        html: `<p>Haga clic en el siguiente enlace para recuperar su PIN:</p>
               <a href="${body.url}">${body.url}</a>`,
      });
      return resultCorreo;
    } catch (error) {
      throw error;
    }
  }

  async sendCodVerificacionSolicitudCuenta(
    body: VerificacionSolicitudCuentaEmail,
  ): Promise<SentMessageInfo> {
    try {
      const resultCorreo = await this.mailerService.sendMail({
        from: `${process.env.EMAIL_ALIAS} <${process.env.EMAIL_USERNAME}>`,
        to: body.to,
        subject: 'Código de Verificación',
        html: `<p>Su código de verificación es: <strong>${body.codigo_verificacion}</strong></p>`,
      });
      return resultCorreo;
    } catch (error) {
      throw error;
    }
  }
  async sendNotificacionSolicitudVerificacionCuenta(
    data: NotificacionSolicitudVerificacionCuentaEmail,
  ): Promise<SentMessageInfo> {
     const toDestinatario = Array.isArray(data.to) ? data.to[0] : data.to;
    const resultCorreo = await this.mailerService.sendMail({
      from: `${process.env.EMAIL_ALIAS} <${process.env.EMAIL_USERNAME}>`,
      to: toDestinatario,
      subject: 'Solicitud de Verificación de Cuenta',
      html: `<p>Hola ${data.nombre_usuario},</p>
                 <p>Se ha recibido una solicitud de verificación de cuenta para su correo electrónico: ${data.email_usuario}</p>`,
    });
    return resultCorreo;
  }
  catch(error) {
    throw error;
  }
}
