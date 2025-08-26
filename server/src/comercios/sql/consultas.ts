export const sqlListadoComerciosPendientes = `
  select 
s.id as id_suscripcion,
s.id_comercio,
s.estado,
com.url_comprobante_pago,
escom.id as id_estado_comercio_actual,
escom.descripcion as estado_comercio_actual,
s.monto as monto_suscripcion,
(uven.nombre || ' '|| uven.apellido) as nombre_completo_vendedor,
com.razon_social,
com.ruc,
com.fecha_creacion as fecha_solicitud_verificacion,
(usu.nombre || ' '|| usu.apellido) as nombre_propietario,
fs.id as id_factura,
fs.nro_factura,
fs.monto as monto_factura,
fs.total_factura,
fs.total_factura,
fs.total_grav_5,
fs.total_grav_10,
fs.total_iva_5,
fs.total_iva_10
from suscripciones s 
left join factura_suscripciones fs on fs.id_suscripcion = s.id and fs.estado = 1
left join comercio com on com.id = s.id_comercio 
left join usuarios uven on s.id_vendedor = uven.id
left join usuarios usu on com.id_usuario = usu.id
left join estados_comercios escom ON escom.id = com.estado
where s.estado = 1
order by s.fecha_creacion desc

`;
