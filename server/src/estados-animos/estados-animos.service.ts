import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ObtenerMensajeDelDiaDto } from './dto/obtner-mensaje.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { CreateEstadosAnimosDto } from './dto/create-estados-animos.dto';
import { UpdateEstadoAnimoDto } from './dto/update-estado-animo.dto';
import { DeleteEstadosAnimosDto } from './dto/delete-estados-animos.dto';
import { GuardarMensajeDiaDto } from './dto/guardar-mesaje-dia.dto';
import { TiposNotificaciones } from '@/notificaciones/enums/tipos-notificaciones';

@Injectable()
export class EstadosAnimosService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly dbPromiseService: DatabasePromiseService,
  ) {}
  async obtenerMensajeDiario(body: ObtenerMensajeDelDiaDto) {
    try {
      const whereClause: any = {};

      // buscar si hoy ya se le envió un mensaje al usuario

      const mensajeEnviado = await this.prismaService.notificaciones_usuarios.findFirst({
        where: {
          id_usuario: body.id_usuario,
          id_tipo_notificacion: TiposNotificaciones.ESTADOS_ANIMOS,
          fecha_creacion: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      if (mensajeEnviado)  throw new BadRequestException('Ya se ha enviado un mensaje del día al usuario hoy');

      const tipoExistente =
        await this.prismaService.tipo_estado_animo.findFirst({
          where: {
            id: body.id_tipo_mensaje,
          },
        });

      if (!tipoExistente) {
        throw new NotFoundException('El tipo de mensaje no existe');
      }

      


      let sql = `SELECT
                        ES.MENSAJE,
                        ES.ID_TIPO_ANIMO,
                        TES.DESCRIPCION AS DESCRIPCION_TIPO_MESAJE
                    FROM
                        ESTADOS_ANIMOS ES
                        LEFT JOIN TIPO_ESTADO_ANIMO TES ON TES.ID = ES.ID_TIPO_ANIMO where ES.ACTIVO = true`;

      if (body.id_tipo_mensaje) {
        sql += ` AND ES.ID_TIPO_ANIMO = $(id_tipo_animo)`;
        whereClause.id_tipo_animo = body.id_tipo_mensaje;
      }
      sql += ` ORDER BY RANDOM() LIMIT 1;`;

      const mensaje: any = await this.dbPromiseService.result(sql, whereClause);

      // Guardar notificación de mensaje del día para el usuario
      const mesajeExistente = await this.prismaService.notificaciones_usuarios.create({
        data: {
          id_usuario: body.id_usuario,
          titulo: 'Mensaje del día',
          cuerpo: mensaje.rows[0]?.mensaje || '',
          id_tipo_notificacion: TiposNotificaciones.ESTADOS_ANIMOS, // Asumiendo que 1 es el tipo para estados de ánimo
          id_estado: 3 //  3 es el estado "leido"
        }
      })

      return mensaje.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getListadoEsatdosAnimos() {
    try {
      let sql = `SELECT
        ESA.ID,
        ESA.MENSAJE,
        ESA.FECHA_CREACION,
        ESA.FECHA_ACTUALIZACION,
        ESA.FECHA_ELIMINACION,
        ESA.ID_TIPO_ANIMO,
        TEA.descripcion as DESCRIPCION_ESTADO_ANIMO,
        ESA.ACTIVO,
        (CRE.NOMBRE || ' ' || COALESCE(CRE.APELLIDO, '')) AS USUARIO_CREACION,
        (ACT.NOMBRE || ' ' || COALESCE(ACT.APELLIDO, '')) AS USUARIO_ACTUATIZACION
      FROM
        ESTADOS_ANIMOS ESA
        JOIN TIPO_ESTADO_ANIMO TEA ON TEA.ID = ESA.ID_TIPO_ANIMO
        AND TEA.ACTIVO = TRUE
        LEFT JOIN USUARIOS CRE ON CRE.ID = ESA.ID_USUARIO_CREACION
        LEFT JOIN USUARIOS ACT ON ACT.ID = ESA.ID_USUARIO_ACTUALIZACION
        order by ESA.id DESC
        `
      const estadosAnimos = await this.dbPromiseService.result(sql);
      console.log(estadosAnimos)
      return estadosAnimos.rows;
      
    } catch (error) {
      throw error;
    }
  }

  async getEstadoAnimoById(id: number) {
    try {
      const estadoAnimo = await this.prismaService.estados_animos.findFirst({
        where: { id },
      }); 
      if (!estadoAnimo) throw new NotFoundException('El estado de ánimo no existe');
      return estadoAnimo;
    } catch (error) {
      throw error;
    }
  }


  async crearMensajeEstadoAnimo(body: CreateEstadosAnimosDto) {
    try {
      const nuevoMensaje = await this.prismaService.estados_animos.create({
        data: {
          mensaje: body.mensaje,
          id_tipo_animo: body.id_estado_animo,
          id_usuario_creacion: body.id_usuario,
        },
      });
      return nuevoMensaje;
    } catch (error) {
      throw error;
    }
  }

  async updateMensajeEstadoAnimo(id: number, body: UpdateEstadoAnimoDto) {
    try {

      const mensajeExistente = await this.prismaService.estados_animos.findFirst({
        where: { id },
      });

      if(!mensajeExistente) throw new NotFoundException('El mensaje de estado de ánimo no existe');

      const mensajeActualizado = await this.prismaService.estados_animos.update(
        {
          where: { id },
          data: {
            mensaje: body.mensaje,
            id_tipo_animo: body.id_estado_animo,
            id_usuario_actualizacion: body.id_usuario,
            fecha_actualizacion: new Date(),
          },
        },
      );
      return mensajeActualizado;
    } catch (error) {
      throw error;
    }
  }

  async eliminarMensajeEstadoAnimo(id: number, data:DeleteEstadosAnimosDto) {
    try {
      const mensajeExistente = await this.prismaService.estados_animos.findFirst({
        where: { id },
      });

      if (!mensajeExistente) {
        throw new NotFoundException('El mensaje de estado de ánimo no existe');
      }

      await this.prismaService.estados_animos.update({
        where: { id },
        data: {
          activo: false,
          id_usuario_eliminacion: data.id_usuario,
          fecha_eliminacion: new Date(),
        },
      });
    } catch (error) {
      throw error;
    }
  }

}
