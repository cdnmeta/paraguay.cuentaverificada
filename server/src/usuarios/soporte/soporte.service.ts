import { DatabasePromiseService } from '@/database/database-promise.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SoporteService {
  constructor(
    private readonly dataBasepromiseService: DatabasePromiseService,
  ) {}

  async getIdSoporteDisponible() {
    try {
      const sql = `WITH soporte AS (
                SELECT u.id
                FROM usuarios u
                JOIN usuarios_grupos ug ON ug.id_usuario = u.id
                WHERE u.activo IS TRUE
                    AND ug.id_grupo = 5       -- <-- ajusta el id del grupo soporte
                ),
                open_tickets AS (
                SELECT
                    t.id_asignado          AS id_usuario,
                    COUNT(*)               AS abiertos,
                    MAX(t.ultimo_mensaje_at) AS ultima_act
                FROM ticket t
                WHERE t.activo = TRUE
                    AND t.id_asignado IS NOT NULL   
                    AND t.id_estado NOT IN (6, 7)             -- 6=resuelto, 7=cerrado
                GROUP BY t.id_asignado
                ),
                resolved_recent AS (
                SELECT
                    t.id_asignado AS id_usuario,
                    COUNT(*)      AS resueltos_7d
                FROM ticket t
                WHERE t.activo = TRUE
                    AND t.id_asignado IS NOT NULL
                    AND t.id_estado = 6                       -- resuelto
                    AND t.fecha_actualizacion >= now() - interval '7 days'
                GROUP BY t.id_asignado
                )
                SELECT s.id AS id_usuario
                FROM soporte s
                LEFT JOIN open_tickets   o ON o.id_usuario = s.id
                LEFT JOIN resolved_recent r ON r.id_usuario = s.id
                ORDER BY
                COALESCE(o.abiertos, 0) ASC,                -- menos abiertos primero
                COALESCE(r.resueltos_7d, 0) DESC,           -- más resueltos recientes
                COALESCE(o.ultima_act, TIMESTAMP '1900-01-01') ASC, -- más “libre” por antigüedad
                s.id ASC
                LIMIT 1;
                `;
      const usuarioSoporte = (await this.dataBasepromiseService.result(
        sql,
      )) as { rowCount: number; rows: { id_usuario: number }[] };
      if (usuarioSoporte.rowCount === 0)
        throw new BadRequestException('No hay usuarios de soporte disponibles');
      return usuarioSoporte.rows[0].id_usuario;
    } catch (error) {
      throw error;
    }
  }
}
