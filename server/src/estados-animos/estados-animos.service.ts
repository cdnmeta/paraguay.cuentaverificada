import { Injectable, NotFoundException } from '@nestjs/common';
import { ObtenerMensajeDelDiaDto } from './dto/obtner-mensaje.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { DatabasePromiseService } from '@/database/database-promise.service';

@Injectable()
export class EstadosAnimosService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly dbPromiseService: DatabasePromiseService,
  ) {}
  async obtenerMensajeDiario(body: ObtenerMensajeDelDiaDto) {
    try {
      const whereClause: any = {};

      const tipoExistente =
        await this.prismaService.tipo_estado_animo.findFirst({
          where: {
            id: body.id_tipo_mensaje,
          },
        });

      if (!tipoExistente) {
        throw new NotFoundException('El tipo de mensaje no existe');
      }

      if (body.id_mensaje_ant) {
        const estadoAnimoAnt =
          await this.prismaService.estados_animos.findFirst({
            where: {
              id: body.id_mensaje_ant,
            },
          });
        if (!estadoAnimoAnt) {
          throw new NotFoundException('El estado de ánimo no existe');
        }
      }

      let sql = `SELECT
                        ES.MENSAJE,
                        ES.ID_TIPO_ANIMO,
                        TES.DESCRIPCION AS DESCRIPCION_TIPO_MESAJE
                    FROM
                        ESTADOS_ANIMOS ES
                        LEFT JOIN TIPO_ESTADO_ANIMO TES ON TES.ID = ES.ID_TIPO_ANIMO where ES.ACTIVO = true`;

      if (body.id_mensaje_ant) {
        sql += ` AND ES.ID <> $(id_mensaje_ant )`;
        whereClause.id_mensaje_ant = body.id_mensaje_ant;
      }
      if (body.id_tipo_mensaje) {
        sql += ` AND ES.ID_TIPO_ANIMO = $(id_tipo_animo)`;
        whereClause.id_tipo_animo = body.id_tipo_mensaje;
      }
      sql += ` ORDER BY RANDOM() LIMIT 1;`;

      const mensaje = await this.dbPromiseService.result(sql, whereClause);

      return mensaje.rows[0];
    } catch (error) {
      throw error;
    }
  }
}
