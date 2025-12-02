export const consulta_verificador_asignar  = `
WITH
	VERIFICADORES AS (
		SELECT
			U.ID
		FROM
			USUARIOS U
			JOIN USUARIOS_GRUPOS UG ON UG.ID_USUARIO = U.ID
		WHERE
			UG.ID_GRUPO = 2
	),
	CARGAS AS (
		SELECT
			V.ID,
			COUNT(S.ID) FILTER (
				WHERE
					S.ID_ESTADO = 2
					AND S.ACTIVO = TRUE
			) AS CARGA
		FROM
			VERIFICADORES V
			LEFT JOIN USUARIOS_SOLICITUDES_CUENTA S ON S.ID_VERIFICADOR = V.ID
		GROUP BY
			V.ID
	)
SELECT
	U.ID,
	concat_ws(' ',u.nombre,u.apellido) as nombre_verificador,
	u.documento,
	(
		select nro_telefono_verificacion from empresa_config emc limit 1
	) as nro_telefono_verificacion
FROM
	USUARIOS U
	JOIN CARGAS C ON C.ID = U.ID
ORDER BY
	C.CARGA ASC,
	RANDOM()
LIMIT
	1
FOR UPDATE OF
	U SKIP LOCKED;            
`


export const listadoSolicitudes = `select 
so.id,
so.nombre,
so.apellido,
so.correo,
so.id_estado,
so.dial_code,
so.telefono,
so.documento,
(us.nombre || ' ' || us.apellido) as nombre_verificador
from usuarios_solicitudes_cuenta so
left join usuarios us on us.id = so.id_verificador
where so.activo = true`