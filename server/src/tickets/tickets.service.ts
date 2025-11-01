import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { crearNombreArchivoDesdeMulterFile } from '@/utils/funciones';
import { FirebaseService } from '@/firebase/firebase.service';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { MensajeTicketDto } from './dto/mensajeTicket.dto';
import { AgregarMensajeOpts } from './types/agregarMensajeOpts';
import { EstadoTicket, RolUsuario } from './types/enums';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { AbrirTicketDto, GetTicketHiloDto } from './dto/acciones-ticket.dto';
import { SoporteService } from '@/usuarios/soporte/soporte.service';
import { 
  GET_MENSAJES_PAGINADOS, 
  GET_MENSAJES_BY_ROLE, 
  CHECK_HAS_MORE_MENSAJES, 
  GET_TICKET_WITH_LAST_MESSAGE, 
  SQL_LISTADO_TICKETS_GENERALES
} from './sql/tickets-message-sql';
import { MensajesPaginadosResponseDto, MensajePaginadoDto, PaginationInfoDto } from './dto/mensajes-paginados.dto';
import { CerrarTicketDto, CompletarTicketDto, UpdateEstadoTicketDto } from './dto/update-ticket.dto';
import { QueryAdminTicketsDto, QueryTicketsSoporteDto } from './dto/query-tickets.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly dataBasePromise: DatabasePromiseService,
    private readonly firebaseService: FirebaseService,
    private readonly soporteService: SoporteService,
  ) {}

  async createTicket(
    data: CreateTicketDto,
    files?: Array<Express.Multer.File>,
  ) {
    this.logger.log(`Iniciando creación de ticket: ${data.titulo}`);

    let archivosSubidos: string[] = [];

    try {
      // 1. Subir archivos a Firebase ANTES de la transacción
      if (files && files.length > 0) {
        this.logger.log(`Subiendo ${files.length} archivos a Firebase`);

        for (const file of files) {
          // Validar archivo
          this.validateFile(file);

          const rutaStorage = `${FIREBASE_STORAGE_FOLDERS.tickets}/${crearNombreArchivoDesdeMulterFile(file)}`;

          try {
            const rutaArchivo = await this.firebaseService.subirArchivoPrivado(
              file.buffer,
              rutaStorage,
              file.mimetype,
            );

            archivosSubidos.push(rutaArchivo);
            this.logger.log(
              `Archivo subido: ${file.originalname} -> ${rutaArchivo}`,
            );
          } catch (uploadError) {
            this.logger.error(
              `Error subiendo archivo ${file.originalname}:`,
              uploadError,
            );
            // Si falla la subida de un archivo, limpiar los ya subidos
            if (archivosSubidos.length > 0) {
              await this.limpiarArchivosFirebase(archivosSubidos);
            }
            throw new Error(
              `Error al subir archivo ${file.originalname}: ${uploadError.message}`,
            );
          }
        }

        this.logger.log(`Todos los archivos subidos exitosamente`);
      }

      // 2. Ejecutar operaciones de BD en transacción (rápida)
      const resultado = await this.prismaService.$transaction(async (tx) => {
        // Crear el ticket principal
        const id_usuario_asignar = await this.soporteService.getIdSoporteDisponible();
        const ticket = await tx.ticket.create({
          data: {
            asunto: data.titulo,
            id_reportante: data.id_usuario,
            id_tipo_ticket: data.id_tipo_ticket,
            id_asignado: id_usuario_asignar,
            id_estado: data.id_estado_ticket,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
            ultimo_mensaje_at: new Date(),
          },
        });

        this.logger.log(`Ticket creado con ID: ${ticket.id}`);

        // Crear el mensaje inicial del ticket con URLs de archivos ya subidos
        const mensaje = await tx.ticket_mensaje.create({
          data: {
            id_ticket: ticket.id,
            id_autor: data.id_usuario,
            rol_autor: data.id_rol,
            mensaje: data.descripcion,
            url_archivo: archivosSubidos, // URLs ya disponibles
            fecha_creacion: new Date(),
          },
        });

        this.logger.log(`Mensaje inicial creado con ID: ${mensaje.id}`);

        return { ticket, mensaje };
      });

      this.logger.log(
        `Ticket ${resultado.ticket.id} creado exitosamente con ${archivosSubidos.length} archivos`,
      );

      return resultado.ticket;
    } catch (error) {
      this.logger.error('Error en createTicket:', error);

      // Limpiar archivos subidos en caso de error en la transacción de BD
      if (archivosSubidos.length > 0) {
        this.logger.warn(
          `Limpiando ${archivosSubidos.length} archivos subidos debido al error`,
        );
        await this.limpiarArchivosFirebase(archivosSubidos);
      }

      throw error;
    }
  }

  /**
   * Valida que el archivo cumple con los requisitos
   */
  private validateFile(file: Express.Multer.File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (file.size > maxSize) {
      throw new Error(
        `El archivo ${file.originalname} excede el tamaño máximo permitido (10MB)`,
      );
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Tipo de archivo no permitido: ${file.mimetype}`);
    }

    if (!file.originalname || file.originalname.trim() === '') {
      throw new Error('El nombre del archivo no puede estar vacío');
    }
  }

  /**
   * Limpia archivos de Firebase en caso de error
   */
  private async limpiarArchivosFirebase(
    rutasArchivos: string[],
  ): Promise<void> {
    for (const ruta of rutasArchivos) {
      try {
        await this.firebaseService.eliminarArchivo(ruta);
        this.logger.log(`Archivo limpiado de Firebase: ${ruta}`);
      } catch (error) {
        this.logger.warn(
          `No se pudo limpiar archivo de Firebase: ${ruta}`,
          error,
        );
      }
    }
  }

  /**
   * Agrega un mensaje a un ticket existente
   */
  async agregarMensaje(
    data: MensajeTicketDto,
    files?: Array<Express.Multer.File>,
    opts?: AgregarMensajeOpts,
  ) {
    const { id_ticket, id_usuario, rol_usuario, mensaje } = data;

    const {
      validateAsignado,
      validateEstadoResolucion,
      validateEstadosTickets,
      validateReportante,
    } = opts || {};

    this.logger.log(`Agregando mensaje al ticket ${id_ticket}`);

    const ticket = await this.prismaService.ticket.findFirst({
      where: { id: id_ticket, activo: true },
    });
    

    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if (
      (ticket.id_estado === EstadoTicket.CERRADO || ticket.id_estado === EstadoTicket.RESUELTO)
    )
      throw new BadRequestException(
        'No se pueden agregar mensajes a un ticket cerrado o resuelto',
      );
    if (!data.es_interno) {

      if (validateAsignado && ticket.id_asignado !== id_usuario)
        throw new ForbiddenException('No estas asignado  a este ticket');

      if (validateReportante && ticket.id_reportante !== id_usuario)
        throw new ForbiddenException(
          'No tienes permiso para agregar mensajes a este ticket',
        );

      if (validateEstadosTickets) {
        if (ticket.id_estado === 1)
          throw new BadRequestException('El ticket aun no ha sido asignado');
        if (ticket.id_estado === 3 && data.rol_usuario == RolUsuario.SOPORTE)
          throw new ForbiddenException('Espera a que el cliente responda');
        if (ticket.id_estado === 4 && data.rol_usuario == RolUsuario.CLIENTE)
          throw new ForbiddenException('Espera a que el soporte responda');
      }
    }

    let estado_asignar: number = 3;

    if (data.rol_usuario == RolUsuario.SOPORTE) {
      estado_asignar = 3; // En espera de respuesta del cliente
    } else if (data.rol_usuario == RolUsuario.CLIENTE) {
      estado_asignar = 4; // En espera de respuesta del soporte
    }

    let archivosSubidos: string[] = [];

    try {
      // 1. Subir archivos a Firebase ANTES de la transacción
      if (files && files.length > 0) {
        this.logger.log(`Subiendo ${files.length} archivos a Firebase`);

        for (const file of files) {
          this.validateFile(file);

          const rutaStorage = crearNombreArchivoDesdeMulterFile(file);

          try {
            const rutaArchivo = await this.firebaseService.subirArchivoPrivado(
              file.buffer,
              rutaStorage,
              file.mimetype,
            );

            archivosSubidos.push(rutaArchivo);
            this.logger.log(
              `Archivo subido: ${file.originalname} -> ${rutaArchivo}`,
            );
          } catch (uploadError) {
            this.logger.error(
              `Error subiendo archivo ${file.originalname}:`,
              uploadError,
            );
            // Si falla la subida de un archivo, limpiar los ya subidos
            if (archivosSubidos.length > 0) {
              await this.limpiarArchivosFirebase(archivosSubidos);
            }
            throw new Error(
              `Error al subir archivo ${file.originalname}: ${uploadError.message}`,
            );
          }
        }

        this.logger.log(`Todos los archivos subidos exitosamente`);
      }

      // 2. Crear mensaje en transacción (rápida)
      const nuevoMensaje = await this.prismaService.$transaction(async (tx) => {
        // Verificar que el ticket existe
        const ticket = await tx.ticket.findUnique({
          where: { id: id_ticket },
        });

        if (!ticket) {
          throw new Error(`Ticket ${id_ticket} no encontrado`);
        }

        // Crear el mensaje con URLs de archivos ya subidos
        const mensajeNuevo = await tx.ticket_mensaje.create({
          data: {
            id_ticket: id_ticket,
            id_autor: id_usuario,
            rol_autor: rol_usuario,
            mensaje: mensaje,
            url_archivo: archivosSubidos, // URLs ya disponibles
            fecha_creacion: new Date(),
            es_interno: data.es_interno || false,
          },
        });

        // Actualizar fecha de último mensaje en el ticket
        await tx.ticket.update({
          where: { id: id_ticket },
          data: {
            fecha_actualizacion: new Date(),
            ultimo_mensaje_at: new Date(),
            id_estado: estado_asignar,
          },
        });

        return mensajeNuevo;
      });

      this.logger.log(`Mensaje agregado exitosamente al ticket ${id_ticket}`);

      return {
        success: true,
        message: 'Mensaje agregado exitosamente',
        data: nuevoMensaje,
      };
    } catch (error) {
      this.logger.error(
        `Error agregando mensaje al ticket ${id_ticket}:`,
        error,
      );

      // Limpiar archivos subidos en caso de error en la transacción de BD
      if (archivosSubidos.length > 0) {
        this.logger.warn(
          `Limpiando ${archivosSubidos.length} archivos subidos debido al error`,
        );
        await this.limpiarArchivosFirebase(archivosSubidos);
      }

      throw error;
    }
  }

  async getMisTickets(id_usuario: number) {
    try {
      const sql = `SELECT
	TK.ID,
	TK.ASUNTO,
	TK.ULTIMO_MENSAJE_AT,
	TK.ID_TIPO_TICKET,
  TK.fecha_creacion,
	COALESCE(TTK.DESCRIPCION, 'No Asigando') AS DESCRIPCION_TIPO_TICKET,
	(
		CASE
			WHEN TK.PRIORIDAD = 1 THEN 'Alta'
			WHEN TK.PRIORIDAD = 2 THEN 'Media'
			WHEN TK.PRIORIDAD = 3 THEN 'Baja'
		END
	) AS PRIORIDAD,
	(REP.NOMBRE || ' ' || COALESCE(REP.APELLIDO, '')) AS NOMBRE_REPORTANTE,
	(ASG.NOMBRE || ' ' || COALESCE(ASG.APELLIDO, '')) AS NOMBRE_ASIGNADO,
	TK.ID_ESTADO,
	(
		CASE
			WHEN TK.ID_ESTADO = 1 THEN 'Nuevo'
			WHEN TK.ID_ESTADO = 2 THEN 'Abierto'
			WHEN TK.ID_ESTADO = 3 THEN 'Pend. Respuesta Cliente'
			WHEN TK.ID_ESTADO = 4 THEN 'Pend. Respuesta Soporte'
			WHEN TK.ID_ESTADO = 5 THEN 'En Espera'
			WHEN TK.ID_ESTADO = 6 THEN 'Resuelto'
			WHEN TK.ID_ESTADO = 7 THEN 'Cerrado'
		END
	) AS DESCRIPCION_ESTADO
FROM
	TICKET TK
	JOIN USUARIOS REP ON REP.ID = TK.ID_REPORTANTE
	LEFT JOIN TIPO_TICKET TTK ON TTK.ID = TK.ID_TIPO_TICKET
	LEFT JOIN USUARIOS ASG ON ASG.ID = TK.ID_ASIGNADO
WHERE
	TK.ID_REPORTANTE = $1 and tk.activo = true
  order by TK.ULTIMO_MENSAJE_AT DESC
  `;
      const resultado = await this.dataBasePromise.result(sql, [id_usuario]);
      return resultado.rows;
    } catch (error) {
      throw error;
    }
  }


  async getResumenMisTickets(id_usuario_asignado: number) {
    try {
      const sql = `SELECT
        COUNT(TK.ID) AS CANT_TOTAL_TICKETS,
        COUNT(TK.ID) FILTER (
          WHERE
            TK.ID_ESTADO = 1
        ) AS CANT_NUEVOS,
        COUNT(TK.ID) FILTER (
          WHERE
            TK.ID_ESTADO = 2
        ) AS CANT_ABIERTOS,
        COUNT(TK.ID) FILTER (
          WHERE
            TK.ID_ESTADO = 3
        ) AS CANT_PEND_CLIENTE,
        COUNT(TK.ID) FILTER (
          WHERE
            TK.ID_ESTADO = 4
        ) AS CANT_PEND_SOPORTE,
        COUNT(TK.ID) FILTER (
          WHERE
            TK.ID_ESTADO = 5
        ) AS CANT_EN_ESPERA,
        COUNT(TK.ID) FILTER (
          WHERE
            TK.ID_ESTADO = 6
        ) AS CANT_RESUELTOS,
        COUNT(TK.ID) FILTER (
          WHERE
            TK.ID_ESTADO = 7
        ) AS CANT_CERRADOS,
        (
          SELECT
            JSONB_AGG(
              JSONB_BUILD_OBJECT(
                'id',
                S.ID,
                'descripcion',
                S.ASUNTO,
                'reportante',
                S.NOMBRE_REPORTANTE,
                'fecha_creacion',
                S.FECHA_CREACION,
                'prioridad',
                S.PRIORIDAD
              )
              ORDER BY
                S.FECHA_CREACION DESC
            )
          FROM
            (
              SELECT
                TK.ID,
                TK.ASUNTO,
                TK.FECHA_CREACION,
                (REP.NOMBRE || ' ' || COALESCE(REP.APELLIDO, '')) AS NOMBRE_REPORTANTE,
                TK.PRIORIDAD
              FROM
                TICKET TK
                LEFT JOIN USUARIOS REP ON REP.ID = TK.ID_REPORTANTE
              WHERE
                TK.ACTIVO = TRUE and tk.id_estado = 1 and tk.id_asignado = $(id_usuario_asignado)
              ORDER BY
                TK.FECHA_CREACION DESC
              LIMIT
                5
            ) as  S
        ) AS tickets_recientes
      FROM
        TICKET TK
      WHERE
        TK.ACTIVO = TRUE AND TK.ID_ASIGNADO = $(id_usuario_asignado);`;

      const resultado = await this.dataBasePromise.result(sql, {id_usuario_asignado});
      return resultado.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async abrirTicket(id_ticket: number,data:AbrirTicketDto) {
    try {
      const ticketAnalizar = await this.prismaService.ticket.findFirst({
        where: { id: id_ticket, activo: true} // Solo si está en estado "Nuevo"
      });
      if (!ticketAnalizar) throw new NotFoundException('Ticket no encontrado');
      if (ticketAnalizar.id_estado !== 1) throw new BadRequestException('Solo se pueden abrir tickets en estado "Nuevo"');

      if(ticketAnalizar.id_asignado != data.id_usuario_asignado) throw new ForbiddenException('El asignado no coincide con el del ticket');

      const updatedTicket = await this.prismaService.ticket.update({
        where: { id: id_ticket },
        data:{
          id_estado: 2, // Abierto
          fecha_actualizacion: new Date()
        }
      }) 
      return updatedTicket;
    } catch (error) {
      throw error;
    }
  }

  async getTicketHilo(id_ticket: number, data: GetTicketHiloDto): Promise<MensajesPaginadosResponseDto> {
    try {
      // 1. Verificar que el ticket existe y el usuario tiene acceso
      const ticket = await this.prismaService.ticket.findFirst({
        where: { id: id_ticket, activo: true }
      });
      
      if (!ticket) {
        throw new NotFoundException('Ticket no encontrado');
      }

      // 2. Verificar permisos de acceso al ticket
      const tieneAcceso = ticket.id_reportante === data.id_usuario || ticket.id_asignado === data.id_usuario;
      if (!tieneAcceso) {
        throw new ForbiddenException('No tienes permiso para ver este ticket');
      }

      // 3. Determinar si incluir mensajes internos basado en el rol del usuario
      const esClienteReportante = ticket.id_reportante === data.id_usuario;
      const includeInternal = data.includeInternal ?? !esClienteReportante; // Los clientes no ven internos por defecto

      // 4. Preparar parámetros para la query
      const queryParams = {
        ticketId: id_ticket,
        lastMessageId: data.lastMessageId || null,
        firstMessageId: data.firstMessageId || null,
        limit: data.limit || 15,
        includeInternal
      };

      // 5. Ejecutar query optimizada según si incluye mensajes internos o no
      const mensajes = await this.dataBasePromise.any(
        includeInternal ? GET_MENSAJES_PAGINADOS : GET_MENSAJES_BY_ROLE,
        queryParams
      );

      // 6. Verificar si hay más mensajes (solo si estamos paginando hacia atrás)
      let hasMore = false;
      if (data.lastMessageId && mensajes.length === queryParams.limit) {
        const checkResult = await this.dataBasePromise.one(CHECK_HAS_MORE_MENSAJES, {
          ticketId: id_ticket,
          lastMessageId: mensajes[mensajes.length - 1]?.id
        });
        hasMore = checkResult.has_more;
      }

      // 7. Formatear respuesta
      const mensajesFormatted: MensajePaginadoDto[] = mensajes.map(msg => ({
        id: msg.id,
        mensaje: msg.mensaje,
        url_archivo: msg.url_archivo || [],
        rol_autor: msg.rol_autor,
        es_interno: msg.es_interno,
        fecha_creacion: msg.fecha_creacion,
        id_autor: msg.id_autor,
        autor_nombre: msg.autor_nombre || 'Usuario',
        autor_apellido: msg.autor_apellido || '',
        autor_email: msg.autor_email || ''
      }));

      const paginationInfo: PaginationInfoDto = {
        hasMore,
        hasPrevious: !!data.lastMessageId || !!data.firstMessageId,
        firstMessageId: mensajesFormatted[0]?.id,
        lastMessageId: mensajesFormatted[mensajesFormatted.length - 1]?.id,
        count: mensajesFormatted.length,
        limit: queryParams.limit
      };

      return {
        mensajes: mensajesFormatted,
        pagination: paginationInfo
      };

    } catch (error) {
      this.logger.error(`Error al obtener hilo del ticket ${id_ticket}:`, error);
      throw error;
    }
  }

  /**
   * Obtener información completa del ticket con el último mensaje
   * Útil para mostrar en listados o resúmenes
   */
  async getTicketWithLastMessage(ticketId: number) {
    try {
      const result = await this.dataBasePromise.oneOrNone(GET_TICKET_WITH_LAST_MESSAGE, {
        ticketId
      });

      return result;
    } catch (error) {
      this.logger.error(`Error al obtener ticket con último mensaje ${ticketId}:`, error);
      throw error;
    }
  }

  async getTicketInfoById(id: number) {
    try {
      const ticket = await this.prismaService.ticket.findFirst({
        where: { id, activo: true }
      });
      if (!ticket) throw new NotFoundException('Ticket no encontrado');
      return ticket;
    } catch (error) {
      throw error;
    }
  }

  async cerrarTicket(id_ticket: number, data: CerrarTicketDto) {
    try {
      const ticketAnalizar = await this.prismaService.ticket.findFirst({
        where: { id: id_ticket, activo: true} 
      });
      const estadosHabilitadoActualizar = [3, 4, 5]; // Pendiente de respuesta cliente, pendiente de respuesta soporte, en espera
      
      if (!estadosHabilitadoActualizar.includes(ticketAnalizar!.id_estado)) {
        throw new BadRequestException('El estado del ticket no es actualizable por esta vía');
      }
      
      if (!ticketAnalizar) throw new NotFoundException('Ticket no encontrado');

      const updatedTicket = await this.prismaService.ticket.update({
        where: { id: id_ticket },
        data:{
          id_estado: EstadoTicket.CERRADO, // Cerrado
          fecha_actualizacion: new Date(),
          id_usuario_cierre: data.id_usuario,
          motivo_cierre: data.motivo_cierre
        }
      }) 
      return updatedTicket;
    } catch (error) {
      throw error;

    }
  }

  async completarTicket(id_ticket: number, data:CompletarTicketDto) {
    try {
       const ticketAnalizar = await this.prismaService.ticket.findFirst({
        where: { id: id_ticket, activo: true} 
      });
      const estadosHabilitadoActualizar = [3, 4, 5]; // Pendiente de respuesta cliente, pendiente de respuesta soporte, en espera
      
      if (!estadosHabilitadoActualizar.includes(ticketAnalizar!.id_estado)) {
        throw new BadRequestException('El estado del ticket no es actualizable por esta vía');
      }
      
      if (!ticketAnalizar) throw new NotFoundException('Ticket no encontrado');
      const updatedTicket = await this.prismaService.ticket.update({
        where: { id: id_ticket },
        data:{
          id_estado: EstadoTicket.RESUELTO, // Resuelto
          fecha_actualizacion: new Date(),
          id_usuario_completado: data.id_usuario,
        }
      }) 
      return updatedTicket;
    } catch (error) {
      throw error;
    }
  }

  async listadoTicketsSoporteByIdSoporte(id_soporte:number,query: QueryTicketsSoporteDto) {
    try {
      const whereClause = {}
      let sql = `SELECT
      TK.ID,
      TK.ASUNTO,
      TK.ID_ESTADO,
      TK.ID_REPORTANTE,
      TK.PRIORIDAD,
      TK.FECHA_CREACION,
      TK.FECHA_ACTUALIZACION,
      TK.ID_USUARIO_COMPLETADO,
      TK.MOTIVO_CIERRE,
      (REP.NOMBRE || ' ' || COALESCE(REP.APELLIDO, '')) AS NOMBRE_USUARIO_REPORTANTE,
      REP.EMAIL AS EMAIL_REPORTANTE,
      REP.DIAL_CODE AS DIAL_CODE_REPORTANTE,
      REP.TELEFONO AS TELEFONO_REPORTANTE,
      TK.ID_TIPO_TICKET,
      TTK.DESCRIPCION AS DESCRIPCION_TIPO
    FROM
      TICKET TK
      LEFT JOIN USUARIOS REP ON REP.ID = TK.ID_REPORTANTE
      LEFT JOIN TIPO_TICKET TTK ON TTK.ID = TK.ID_TIPO_TICKET`

      whereClause['id_asignado'] = id_soporte
      sql += ' WHERE TK.ID_ASIGNADO = $(id_asignado) AND tk.activo = true'


      if(query?.titulo){
        sql += ' AND TK.ASUNTO ILIKE $(titulo)'
        whereClause['titulo'] = `%${query.titulo}%`
      }

      if(query.prioridad){
        sql += ' AND TK.PRIORIDAD = $(prioridad)'
        whereClause['prioridad'] = query.prioridad
      }

      if(query?.id_reportante){
        sql += ' AND tk.id_reportante = $(id_reportante)'
        whereClause['id_reportante'] = query.id_reportante

      }

      if(query?.id_estado){
        sql += ' AND tk.id_estado = $(id_estado)'
        whereClause['id_estado'] = query.id_estado
      }

      if(query?.id_tipo_ticket){
        sql += ' AND tk.id_tipo_ticket = $(id_tipo_ticket)'
        whereClause['id_tipo_ticket'] = query.id_tipo_ticket
      }

      sql += ' ORDER BY tk.fecha_creacion DESC'


      const resultado = await this.dataBasePromise.result(sql, whereClause);
      return resultado.rows;

    } catch (error) {
      throw error;
    }
  }


}
