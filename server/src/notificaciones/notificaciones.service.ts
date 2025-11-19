import { BadRequestException, Injectable } from '@nestjs/common';
import { SuscribeNotificacionDto } from './dto/suscribe-notificacion.dto';
import { NotificationRequestDto, NotificationRequestPaylodDto } from './dto/notification-request.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { QueryMisNotificacionesDto } from './dto/query-mis-notificaiones.dto';
import { buildPagination, buildPaginationMeta } from '@/database/types/pagination';
import { NotificationProcessor } from './notificaciones.processor.service';

@Injectable()
export class NotificacionesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly databasePromiseService: DatabasePromiseService,
    private readonly notificationProcessor: NotificationProcessor,
  ) {}

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

  // TODO: Reimplementar con nueva arquitectura
  // async resolveNotificationPreferences(
  //   id_usuario: number,
  //   baseRequest: NotificationRequest,
  // ) {
  //   // Este método será reemplazado por la nueva arquitectura
  // }

  // ✅ Nueva API pública simple (Capa 1)
  async sendNotification(request: NotificationRequestDto) {
    return await this.notificationProcessor.processNotification(request);
  }

  // Método de compatibilidad con la API anterior
  async sendNotificationToUser(
    id_usuario: number,
    requestBody: NotificationRequestPaylodDto,
  ) {
    const notification: NotificationRequestDto = {
      ...requestBody,
      userId: id_usuario,
    };
    
    return await this.sendNotification(notification);
  }



  async getNotificaiconesByUserId(
  id_usuario: number,
  query: QueryMisNotificacionesDto & { page?: number; limit?: number },
) {
  const whereClausule: any = {};
  try {
    // 👉 usar helper de paginación
    const { page, limit, offset } = buildPagination(query, 10, 50);

    whereClausule.id_usuario = id_usuario;
    whereClausule.limit = limit;
    whereClausule.offset = offset;

    // 🔹 FROM + WHERE base (se reutiliza en las 3 queries)
    let baseSql = `
      FROM
        NOTIFICACIONES_USUARIOS NUS
        LEFT JOIN TIPO_NOTIFICACION TPN ON TPN.ID = NUS.ID_TIPO_NOTIFICACION
      WHERE NUS.ID_USUARIO = $(id_usuario)
    `;

    if (query.id_estado) {
      whereClausule.id_estado = query.id_estado;
      baseSql += ` AND NUS.ID_ESTADO = $(id_estado) `;
    }

    if (query.tipo_notificacion) {
      whereClausule.id_tipo_notificacion = query.tipo_notificacion;
      baseSql += ` AND NUS.ID_TIPO_NOTIFICACION = $(id_tipo_notificacion) `;
    }

    if (query.fecha_desde) {
      whereClausule.fecha_desde = query.fecha_desde;
      baseSql += ` AND NUS.FECHA_CREACION::DATE >= $(fecha_desde)::date `;
    }

    if (query.fecha_hasta) {
      whereClausule.fecha_hasta = query.fecha_hasta;
      baseSql += ` AND NUS.FECHA_CREACION::DATE <= $(fecha_hasta)::date `;
    }

    // 🔹 Query de datos paginados
    const sqlData = `
      SELECT
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
            WHEN NUS.ID_ESTADO = 2 THEN 'Enviada'
            WHEN NUS.ID_ESTADO = 3 THEN 'Leído'
            WHEN NUS.ID_ESTADO = 4 THEN 'Error'
            WHEN NUS.ID_ESTADO = 5 THEN 'No leído'
            ELSE 'No definido'
          END
        ) AS DESCRIPCION_ESTADO
      ${baseSql}
      ORDER BY NUS.FECHA_CREACION DESC
      LIMIT $(limit) OFFSET $(offset)
    `;

    // 🔹 Query de total para paginación
    const sqlCount = `
      SELECT COUNT(*)::int AS total
      ${baseSql}
    `;

    // 🔹 Query de tipos de notificación disponibles según los mismos filtros
    const sqlTipos = `
      SELECT DISTINCT
        TPN.ID AS ID_TIPO_NOTIFICACION,
        TPN.DESCRIPCION AS DESCRIPCION_TIPO_NOTIFICACION
      ${baseSql}
      ORDER BY TPN.DESCRIPCION
    `;

    // Ejecutar las 3 en paralelo
    const [dataResult, countResult, tiposResult] = await Promise.all([
      this.databasePromiseService.result(sqlData, whereClausule),
      this.databasePromiseService.one(sqlCount, whereClausule),
      this.databasePromiseService.result(sqlTipos, whereClausule),
    ]);

    const total = Number(countResult.total);
    const meta = buildPaginationMeta({ page, limit, total });

    return {
      data:{
        notificaciones: dataResult.rows,
        tipos_disponibles: tiposResult.rows, // [{ id_tipo_notificacion, descripcion_tipo_notificacion }, ...]

      },
      ...meta,
    };
  } catch (error) {
    throw error;
  }
  }




}
