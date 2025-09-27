export const sqlConsultaDesglozadaSemaforoFinancieroPorUsuario = `WITH agg AS (
  SELECT
    sf.id_usuario,
    sf.id_moneda,
    SUM(sf.monto) FILTER (WHERE  sf.tipo_movimiento = 1)                             AS ingreso_fijo,
    SUM(sf.monto) FILTER (WHERE  sf.tipo_movimiento = 2)                             AS ingreso_ocasional,
    SUM(sf.monto) FILTER (WHERE  sf.tipo_movimiento = 6 AND sf.id_estado = 3)        AS ingresos_pc_cobrados,
    SUM(sf.monto) FILTER (WHERE  sf.tipo_movimiento = 3)                             AS egreso_fijo,
    SUM(sf.monto) FILTER (WHERE  sf.tipo_movimiento = 4)                             AS egreso_ocasional,
    SUM(sf.monto) FILTER (WHERE  sf.tipo_movimiento = 5 AND sf.id_estado = 2)        AS egresos_pp_pagados
  FROM public.semaforo_movimientos sf
  where sf.activo = true
  GROUP BY sf.id_usuario, sf.id_moneda
)
SELECT
  u.id                                   AS id_usuario,
  a.id_moneda,
  m.nombre                               AS moneda,
  COALESCE(a.ingreso_fijo, 0)            AS ingreso_fijo,
  COALESCE(a.ingreso_ocasional, 0)       AS ingreso_ocasional,
  COALESCE(a.ingresos_pc_cobrados, 0)    AS ingresos_por_cobrar_cobrados,
  COALESCE(a.egreso_fijo, 0)             AS egreso_fijo,
  COALESCE(a.egreso_ocasional, 0)        AS egreso_ocasional,
  COALESCE(a.egresos_pp_pagados, 0)      AS egresos_por_pagar_pagados,
  (
    COALESCE(a.ingreso_fijo, 0)
    + COALESCE(a.ingreso_ocasional, 0)
    + COALESCE(a.ingresos_pc_cobrados, 0)
    - COALESCE(a.egreso_fijo, 0)
    - COALESCE(a.egreso_ocasional, 0)
    - COALESCE(a.egresos_pp_pagados, 0)
  )                                       AS saldo_mensual,
  (
    COALESCE(a.ingreso_fijo, 0)
    + COALESCE(a.ingreso_ocasional, 0)
    + COALESCE(a.ingresos_pc_cobrados, 0)
    - COALESCE(a.egreso_fijo, 0)
    - COALESCE(a.egreso_ocasional, 0)
    - COALESCE(a.egresos_pp_pagados, 0)
  ) / 30.0                                AS saldo_diario,
  COALESCE(movs.movimientos, '[]'::jsonb) AS movimientos
FROM public.usuarios u
LEFT JOIN agg a
  ON a.id_usuario = u.id
JOIN public.monedas m
  ON m.id = a.id_moneda
-- Construimos el JSON por usuario+moneda para evitar duplicados
LEFT JOIN LATERAL (
  SELECT jsonb_agg(
           jsonb_build_object(
             'id', sf.id,
             'titulo',sf.titulo,
             'monto', sf.monto,
             'tipo_movimiento', sf.tipo_movimiento,
             'id_estado', sf.id_estado,
             'fecha', sf.fecha_creacion
           )
           ORDER BY sf.fecha_creacion DESC
         ) AS movimientos
  FROM public.semaforo_movimientos sf
  WHERE sf.activo
    AND sf.id_usuario = u.id
    AND sf.id_moneda  = a.id_moneda
) movs ON TRUE
WHERE u.id = $1
ORDER BY u.id, a.id_moneda;
`