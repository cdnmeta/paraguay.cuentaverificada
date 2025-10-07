export const consulta_verificador_asignar  = `
with verificadores as (
  select u.id
  from usuarios u
  join usuarios_grupos ug on ug.id_usuario = u.id
  where ug.id_grupo = 2
),
cargas as (
  select
    v.id,
    count(s.id) filter (where s.id_estado = 2 and s.activo = true) as carga
  from verificadores v
  left join usuarios_solicitudes_cuenta s
    on s.id_verificador = v.id
  group by v.id
)
select u.id
from usuarios u
join cargas c on c.id = u.id
order by c.carga asc, random()           
limit 1
for update of u skip locked;              
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