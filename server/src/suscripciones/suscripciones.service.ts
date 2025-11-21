import { DatabasePromiseService } from '@/database/database-promise.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SuscripcionesService {
    constructor(
        private databaseService: DatabasePromiseService,
    ) {}
  async  obtenerSuscripcionesPorUsuario(id_usuario: number) {
        try {
            const sql = `WITH
	FACTURAS_SUSCRIPCION AS (
		SELECT
			FS.ID AS ID_FACTURA,
			FS.ID_SUSCRIPCION,
			FS.NRO_FACTURA,
			FS.FECHA_EMISION,
			FS.FECHA_CREACION,
			FS.MONTO,
			FS.ESTADO,
			CASE
				WHEN FS.ESTADO = 1 THEN 'pendiente'
				WHEN FS.ESTADO = 2 THEN 'pagada'
				ELSE 'desconocido'
			END AS DESCRIPCION_ESTADO,
			MON.ID AS ID_MONEDA,
			MON.NOMBRE AS MONEDA_DESCRIPCION,
			MON.SIGLA_ISO
		FROM
			FACTURA_SUSCRIPCIONES FS
			LEFT JOIN MONEDAS MON ON MON.ID = FS.ID_MONEDA
		WHERE
			FS.ACTIVO = TRUE
	)
SELECT
	SUS.ID AS ID_SUSCRIPCION,
	SUS.FECHA_CREACION,
	SUS.FECHA_VENCIMIENTO,
	CASE
		WHEN SUS.ESTADO = 1 THEN 'pendiente'
		WHEN SUS.ESTADO = 2 THEN 'activa'
		ELSE 'desconocido'
	END AS DESCRIPCION_ESTADO_SUSCRIPCION,
	SUS.MONTO AS MONTO_SUSCRIPCION,
	-- Comercio
	COM.ID AS ID_COMERCIO,
	COM.RUC,
	COM.RAZON_SOCIAL,
	COM.SLUG,
	COM.TELEFONO,
	COM.DIRECCION,
	COM.DIAL_CODE,
	-- Plan
	PL.NOMBRE AS NOMBRE_PLAN,
	PL.DESCRIPCION AS DESCRIPCION_PLAN,
	PL.PRECIO,
	-- Facturas asociadas a la suscripción (pendientes y pagadas)
	COALESCE(
		JSONB_AGG(
			JSONB_BUILD_OBJECT(
				'id',
				FSUS.ID_FACTURA,
				'nro_factura',
				FSUS.NRO_FACTURA,
				'fecha_emision',
				FSUS.FECHA_EMISION,
				'fecha_creacion',
				FSUS.FECHA_CREACION,
				'monto',
				FSUS.MONTO,
				'estado',
				FSUS.ESTADO,
				'descripcion_estado',
				FSUS.DESCRIPCION_ESTADO,
				'id_moneda',
				FSUS.ID_MONEDA,
				'moneda',
				FSUS.MONEDA_DESCRIPCION,
				'sigla_iso',
				FSUS.SIGLA_ISO
			)
		) FILTER (
			WHERE
				FSUS.ID_FACTURA IS NOT NULL
		),
		'[]'::JSONB
	) AS FACTURAS
FROM
	SUSCRIPCIONES SUS
	JOIN COMERCIO COM ON COM.ID = SUS.ID_COMERCIO
	AND COM.ACTIVO = TRUE
	JOIN USUARIOS U ON U.ID = COM.ID_USUARIO -- dueño del comercio
	JOIN PLANES PL ON PL.ID = SUS.ID_PLAN
	LEFT JOIN FACTURAS_SUSCRIPCION FSUS ON FSUS.ID_SUSCRIPCION = SUS.ID
WHERE
	U.ID = $(id_usuario) -- 👈 acá filtrás por el usuario dueño
	AND SUS.ACTIVO = TRUE
	AND SUS.ESTADO = 2
GROUP BY
	SUS.ID,
	SUS.FECHA_INICIO,
	SUS.FECHA_VENCIMIENTO,
	SUS.ESTADO,
	SUS.MONTO,
	COM.ID,
	COM.RUC,
	COM.RAZON_SOCIAL,
	COM.SLUG,
	COM.TELEFONO,
	COM.DIRECCION,
	COM.DIAL_CODE,
	PL.ID,
	PL.NOMBRE,
	PL.DESCRIPCION,
	PL.PRECIO,
	PL.PRECIO_SIN_IVA,
	PL.TIPO_IVA;`
    const result = await this.databaseService.result(sql, { id_usuario });
    return result.rows;
        } catch (error) {
            throw error;
        }

    }
}
