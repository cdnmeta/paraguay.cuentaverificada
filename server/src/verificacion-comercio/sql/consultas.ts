export const sqlLisatdoComerciosAprobar = `
select 
com.id,
com.razon_social ,
com.ruc,
com.direccion,
com.telefono,
com.dial_code,
com.foto_exterior,
com.foto_interior,
com.imagen_factura_servicio,
com.correo_empresa,
com.estado as estado_actual,
est.descripcion as descripcion_estado_actual,
com.cedula_reverso as cedula_reverso_propietario,
com.cedula_frontal as cedula_frontal_propietario,
us.cedula_frente as cedula_frontal_usuario,
us.cedula_reverso as cedula_reverso_usuario,
us.documento as cedula_usuario,
us.codigo_vendedor,
(us.nombre || ' ' || us.apellido) as nombre_propietario
from comercio com
left join usuarios us on us.id = com.id_usuario
left join estados_comercios est on com.estado = est.id
`