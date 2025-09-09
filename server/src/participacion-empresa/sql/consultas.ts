export const consultaParticipacionByUsuario:string = `
WITH info_meta AS (
  SELECT  
    pem.precio_meta,
    pem.nombre_meta
  FROM participacion_empresa pem
  LIMIT 1
),
info_usuario_ganancias AS (
  SELECT 
    u.id AS id_usuario,
    SUM(CASE WHEN gf.activo = TRUE THEN gf.monto END)                          AS ganancias_totales,
    SUM(CASE WHEN gf.activo = TRUE AND gf.id_estado = 1 THEN gf.monto END)     AS ganancias_por_cobrar,
    SUM(CASE WHEN gf.activo = TRUE AND gf.id_estado = 2 THEN gf.monto END)     AS ganancias_cobradas
  FROM usuarios u
  LEFT JOIN ganancias_futuras gf 
    ON gf.id_usuario = u.id
  GROUP BY u.id
),
suscripciones_plataforma_conteo as (
select  
sum(case when su.estado = 1 and activo = true then 1 end) as cantidad_suscripciones_pendientes,
sum(case when su.estado = 2 and activo = true then 1 end) as cantidad_suscripciones_activas,
sum(case when su.estado = 3 and activo = true then 1 end) as cantidad_suscripciones_suspendidas

from suscripciones su 
group by su.id
)
SELECT 
  com.id,
  com.id_usuario,
  com.total_meta,
  com.porcentaje_participacion,
  coalesce((select sc.cantidad_suscripciones_pendientes from suscripciones_plataforma_conteo sc ),0) as cantidad_suscripciones_pendientes,
  coalesce((select sc.cantidad_suscripciones_activas from suscripciones_plataforma_conteo sc ),0) as cantidad_suscripciones_activas,
  coalesce((select sc.cantidad_suscripciones_suspendidas from suscripciones_plataforma_conteo sc ),0) as cantidad_suscripciones_suspendidas,
  
  (SELECT precio_meta FROM info_meta) AS precio_actual,
  SUM(
    CASE 
      WHEN det.activo = TRUE AND det.estado = 1 
      THEN det.total_venta 
      ELSE 0 
    END
  ) AS total_invertido,
  COALESCE(guf.ganancias_totales, 0)     AS ganancias_totales,
  COALESCE(guf.ganancias_por_cobrar, 0)  AS ganancias_por_cobrar,
  COALESCE(guf.ganancias_cobradas, 0)    AS ganancias_cobradas,
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', det.id,
        'monto_meta', det.monto_meta,
        'id_moneda', det.id_moneda,
        'total_venta', det.total_venta
      )
    ) FILTER (WHERE det.activo = TRUE AND det.estado = 1),
    '[]'::json
  ) AS detalles_compras
FROM compras_participantes com
LEFT JOIN compras_detalles_participantes det 
  ON det.id_compras_participantes = com.id 
LEFT JOIN info_usuario_ganancias guf 
  ON guf.id_usuario = com.id_usuario
WHERE com.id_usuario = $1
GROUP BY 
  com.id, 
  guf.ganancias_totales, 
  guf.ganancias_por_cobrar, 
  guf.ganancias_cobradas;

`