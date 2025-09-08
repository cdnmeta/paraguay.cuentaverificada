export const consulta_verificador_asignar  = `
with verificadores as (
  select u.id
  from usuarios u
  join usuarios_grupos ug on ug.id_usuario = u.id
  -- opcional si tienes bandera de activo:
  -- where ug.id_grupo = :id_grupo_verificadores and u.activo = true
  where ug.id_grupo = 2
  for update of u skip locked
),
cargas as (
  select
    v.id,
    count(s.id) filter (
      where s.id_verificador = v.id
        and s.id_estado = 2
        and s.activo = true
    ) as carga
  from verificadores v
  left join usuarios_solicitudes_cuenta s
    on s.id_verificador = v.id
  group by v.id
)
select id
from cargas
order by carga asc, id asc
limit 1;
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
where id_estado = any($1) and so.activo = true`