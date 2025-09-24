export const sqlListadoVendedoresGanancias = `

SELECT
	VEN.ID,
	(VEN.NOMBRE || ' ' || VEN.APELLIDO) as nombre_vendedor,
	VEN.DOCUMENTO,
	VEN.EMAIL,
	VEN.CODIGO_VENDEDOR,
	VEN.DIAL_CODE,
	VEN.DIRECCION,
	VEN.TELEFONO,
	coalesce(sum(case when gan.tipo_participante = 2 and gan.activo = true  then gan.monto  else null end ),0 ) ganancias_total_vendedor,
	coalesce(sum(case when gan.tipo_participante = 2 and id_estado = 1 and gan.activo = true   then gan.monto  else null end ),0 ) ganancias_cobrar_vendedor,
	coalesce(sum(case when gan.tipo_participante = 2 and id_estado = 2 and gan.activo = true   then gan.monto  else null end ),0 ) ganancias_cobradas_vendedor	
FROM
	USUARIOS VEN
	JOIN USUARIOS_GRUPOS USG ON USG.ID_USUARIO = VEN.ID
	AND USG.ID_GRUPO = 3
	left JOIN GANANCIAS_FUTURAS GAN ON GAN.ID_USUARIO = VEN.ID
group by 
VEN.EMAIL,
	VEN.CODIGO_VENDEDOR,
	VEN.DIAL_CODE,
	VEN.DIRECCION,
	VEN.TELEFONO,
	VEN.id`