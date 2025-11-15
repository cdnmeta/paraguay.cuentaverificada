import { BadRequestException, Injectable } from '@nestjs/common';
import { StrategyRegistry } from './strategies/strategy-registry';
import {
  NotificationRequest,
} from './types/notification.types';
import { SuscribeNotificacionDto } from './dto/suscribe-notificacion.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { QueryMisNotificacionesDto } from './dto/query-mis-notificaiones.dto';

@Injectable()
export class NotificacionesService {
  constructor(
    private readonly registry: StrategyRegistry,
    private readonly prismaService: PrismaService,
    private readonly databasePromiseService: DatabasePromiseService,
  ) {}

  // Envío sin cola (sincrónico)
  async sendNow(req: NotificationRequest) {
    // (opcional) idempotencia: verificar req.idempotencyKey en tabla notificacion
    const strategy = this.registry.resolve(req.channel);
    // (opcional) chequear preferencias del usuario
    const result = await strategy.send(req);
    // (opcional) persistir estado en notificacion
    return result;
  }

  async suscribeToNotifications(data: SuscribeNotificacionDto) {
    try {
      const usuarioExiste = await this.prismaService.usuarios.findFirst({
        where: { id: data.id_usuario, activo: true },
      });
      if (!usuarioExiste)
        throw new BadRequestException('Usuario no existe o no está activo');

      // Aquí puedes agregar la lógica para guardar la suscripción en la base de datos

      // verificar que este token no esté ya registrado para el usuario
      const suscripcionExistente =
        await this.prismaService.usuarios_notificaciones_push.findFirst({
          where: {
            id_usuario: data.id_usuario,
            token: data.token,
            activo: true,
          },
        });

      if (suscripcionExistente) return { message: 'Token ya registrado' };

      await this.prismaService.usuarios_notificaciones_push.create({
        data: {
          id_usuario: data.id_usuario,
          token: data.token,
          user_agent: data.user_agent,
          ip_origen: data.ip_origen,
          activo: true,
          proveedor: data.proveedor,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async resolveNotificationPreferences(
    id_usuario: number,
    baseRequest: NotificationRequest,
  ) {
    try {
      const suscripciones_push =
        await this.prismaService.usuarios_notificaciones_push.findMany({
          where: { id_usuario, activo: true },
        });

      if (suscripciones_push.length === 0) return [];


      // por defecto solo fcm

      const fcmTokens: string[] = suscripciones_push
        .filter(
          (s) =>
            s.proveedor === 'fcm' &&
            typeof s.token === 'string' &&
            s.token.length > 0,
        )
        .map((s) => s.token as string);

      const solitudesCanales: NotificationRequest[] = [];

      
      const request: NotificationRequest = {
        ...baseRequest,
        channel: 'fcm',
        fcmConfig: {
          tokens: fcmTokens,
        },
      };

      solitudesCanales.push(request);

      return solitudesCanales;
    } catch (error) {
       return []
    }
  }

  async sendNotificationToUser(
    id_usuario: number,
    requestBody: NotificationRequest,
  ) {
    try {

      // 1. Resolver canales según preferencias
      const solitudesCanales = await this.resolveNotificationPreferences(
        id_usuario,
        requestBody,
      );

      if (solitudesCanales && solitudesCanales.length === 0)  return { ok: false, error: 'No notification channels available' };
      // 2. Enviar por todos los canales autorizados
      const results = await Promise.allSettled(
        solitudesCanales.map((req) => this.sendNow(req)),
      );
      return results;
    } catch (error) {
      throw error;
    }
  }

  async getNotificaiconesByUserId(id_usuario: number, query:QueryMisNotificacionesDto) {
    const whereClausule:any = {}
    try {
      let  sql = `SELECT
      NUS.ID,
      NUS.TITULO,
      NUS.CUERPO,
      NUS.FECHA_CREACION,
      NUS.ID_ESTADO AS ID_ESTADO_NOTIFICACION,
      TPN.ID AS ID_TIPO_NOTIFICACION,
	    TPN.DESCRIPCION AS DESCRIPCION_TIPO_NOTIFICACION,
      (
        CASE
          WHEN NUS.ID_ESTADO = 1 THEN 'Pendiente'
          WHEN NUS.ID_ESTADO = 2 THEN 'enviada'
          WHEN NUS.ID_ESTADO = 3 THEN 'Leido'
          WHEN NUS.ID_ESTADO = 4 THEN 'Error'
          WHEN NUS.ID_ESTADO = 5 THEN 'No leido'
          ELSE 'No definido'
        END
      ) AS DESCRIPCION_ESTADO
    FROM
      NOTIFICACIONES_USUARIOS NUS
      LEFT JOIN TIPO_NOTIFICACION TPN ON TPN.ID = NUS.ID_TIPO_NOTIFICACION
   `
      whereClausule.id_usuario = id_usuario;
      sql += ` WHERE NUS.ID_USUARIO = $(id_usuario) `;

      if(query.id_estado){
        whereClausule.id_estado = query.id_estado;
        sql += ` AND NUS.ID_ESTADO = $(id_estado) `;
      }


      if(query.tipo_notificacion){
        whereClausule.id_tipo_notificacion = query.tipo_notificacion;
        sql += ` AND NUS.ID_TIPO_NOTIFICACION = $(id_tipo_notificacion) `;
      }

      if(query.fecha_desde){
        whereClausule.fecha_desde = query.fecha_desde;
        sql += ` AND NUS.FECHA_CREACION::DATE >= $(fecha_desde) `;
      }
      
      if(query.fecha_hasta){
        whereClausule.fecha_hasta = query.fecha_hasta;
        sql += ` AND NUS.FECHA_CREACION::DATE <= $(fecha_hasta) `;
      }


      sql += ` ORDER BY NUS.FECHA_CREACION DESC `;


    const result = await this.databasePromiseService.result(sql, whereClausule);
    return result.rows;
    } catch (error) {
      throw error;
    }
  }

}
