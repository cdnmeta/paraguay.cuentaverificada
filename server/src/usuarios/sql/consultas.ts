export const userInfoSql =  `with grupos_usuarios as (

select g.id, g.descripcion,usg.id_usuario from grupos g
left join usuarios_grupos usg on usg.id_grupo = g.id

)

select us.id, us.nombre, us.apellido , is_super_admin,
coalesce(
    jsonb_agg(
      jsonb_build_object('id', gus.id,'descripcion', gus.descripcion)
      ORDER BY gus.id
    ) FILTER (WHERE gus.id IS NOT NULL),
    '[]'::jsonb
  ) AS grupos 
from usuarios us
left join grupos_usuarios gus on gus.id_usuario = us.id
where us.activo = true and us.id  = $1
group by us.id, us.nombre, us.apellido , is_super_admin

`