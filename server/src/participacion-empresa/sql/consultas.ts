export const consultaParticipacionByUsuario:string = `
with info_meta as (

select  
pem.precio_meta,
pem.nombre_meta
from participacion_empresa pem
limit 1
)


select 
com.id,
com.id_usuario,
com.total_meta,
com.porcentaje_participacion,
(select precio_meta from info_meta) precio_actual ,
sum(case when det.activo = true and det.estado = 1 then det.total_venta else 0 end) as total_invertido,
coalesce(
json_agg(
json_build_object(
'id',det.id,
'monto_meta',det.monto_meta,
'id_moneda',det.id_moneda,
'total_venta',det.total_venta
)

) filter  (where det.activo = true and det.estado = 1)
,'[]'::json) as detalles_compras
from compras_participantes com
left join compras_detalles_participantes det on det.id_compras_participantes = com.id 
where com.id_usuario = $1
group by com.id

`