import { DatabaseService } from '@/database/database.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { consultaSelectFacturaInfoPago } from './sql/consultas';
import { DatabasePromiseService } from '@/database/database-promise.service';

@Injectable()
export class FacturasSuscripcionesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly databaseService: DatabaseService, // Assuming you have a DatabaseService for additional database operations
    private readonly databasePromiseService: DatabasePromiseService, // Assuming you have a DatabaseService for additional database operations
  ) {}

  async getInfoPago(id: number) {
    try {
      const factura = this.prismaService.factura_suscripciones.findFirst({
        where: { id, activo: true },
      });

      if (!factura) {
        throw new NotFoundException('Factura no encontrada');
      }

      const resultfacturainfo = await this.databaseService.query(
        consultaSelectFacturaInfoPago,
        [id],
      );

      if (resultfacturainfo.rows.length === 0) {
        throw new NotFoundException('Información de pago no encontrada');
      }

      return resultfacturainfo.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getGananciasFacturas() {
    try {
      const sql = `WITH
	GANANCIAS_FACTURAS AS (
		SELECT
			GF.ID,
			GF.ID_FACTURA,
			GF.ID_USUARIO,
			GF.ACTIVO,
			GF.MONTO,
			FS.ID_MONEDA,
			M.NOMBRE AS DESCRIPCION_MONEDA,
			M.SIGLA_ISO,
			(US.NOMBRE || ' ' || US.APELLIDO) AS NOMBRE_USUARIO,
			GF.TIPO_PARTICIPANTE,
			CASE
				WHEN GF.TIPO_PARTICIPANTE = 1 THEN 'Participante'
				WHEN GF.TIPO_PARTICIPANTE = 2 THEN 'Vendedor'
				WHEN GF.TIPO_PARTICIPANTE = 3 THEN 'Empresa'
			END AS DESCRIPCION_TIPO_PARTICIPANTE
		FROM
			GANANCIAS_FUTURAS GF
			LEFT JOIN USUARIOS US ON GF.ID_USUARIO = US.ID
			LEFT JOIN FACTURA_SUSCRIPCIONES FS ON FS.ID = GF.ID_FACTURA
			LEFT JOIN MONEDAS M ON M.ID = FS.ID_MONEDA
	)
SELECT
	com.id as id_comercio,
	com.razon_social,
	FS.ID,
	FS.CONDICION,
	FS.ESTADO,
	FS.ID_MONEDA,
	FS.TOTAL_FACTURA,
	FS.TOTAL_GRAV_10,
	FS.TOTAL_GRAV_5,
	FS.TOTAL_IVA_10,
	FS.TOTAL_IVA_5,
	FS.ID_MONEDA,
	M.SIGLA_ISO,
	FS.NRO_FACTURA,
	COALESCE(
		JSONB_AGG(
			JSONB_BUILD_OBJECT(
				'id',
				GF.ID,
				'id_usuario',
				GF.ID_USUARIO,
				'monto',
				GF.MONTO,
				'descripcion_tipo_participante',
				GF.DESCRIPCION_TIPO_PARTICIPANTE,
				'tipo_participante',
				GF.TIPO_PARTICIPANTE,
				'nombre_usuario',
				GF.NOMBRE_USUARIO,
				'id_moneda',
				GF.ID_MONEDA,
				'sigla_iso',
				GF.SIGLA_ISO
			)
			ORDER BY
				GF.TIPO_PARTICIPANTE,
				GF.ID
		) FILTER (
			WHERE
				GF.ID IS NOT NULL
		),
		'[]'::JSONB
		) AS DETALLES_GANANCIAS
	FROM
		FACTURA_SUSCRIPCIONES FS
		LEFT JOIN GANANCIAS_FACTURAS GF ON GF.ID_FACTURA = FS.ID
		join suscripciones sus ON sus.id = FS.id_suscripcion
		join comercio com ON com.id = sus.id_comercio
		AND GF.ACTIVO
		LEFT JOIN MONEDAS M ON M.ID = FS.ID_MONEDA
	WHERE
		FS.ESTADO = 2
		AND FS.ACTIVO
	GROUP BY
		FS.ID,
		FS.CONDICION,
		FS.ESTADO,
		FS.ID_MONEDA,
		FS.NRO_FACTURA,
		FS.ID_MONEDA,
		com.razon_social,
		com.id,
		M.SIGLA_ISO;
  `;
      const result = await this.databasePromiseService.result(sql);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}
