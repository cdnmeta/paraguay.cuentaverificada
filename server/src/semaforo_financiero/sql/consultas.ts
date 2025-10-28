export const sqlConsultaDesglozadaSemaforoFinancieroPorUsuario = `WITH params AS (
  SELECT
     $(id_usuario) AS p_id_usuario,
		coalesce($(anio), EXTRACT(year from CURRENT_DATE)::int) as p_anio, -- año
		coalesce($(mes),EXTRACT(MONTH from CURRENT_DATE)::int) as p_mes, -- mes
		coalesce($(dia),1) as p_dia -- dia
),
limites AS (
  SELECT
    p.*,
    make_date(p.p_anio, p.p_mes, 1)::date                        AS mes_ini,
    (make_date(p.p_anio, p.p_mes, 1) + INTERVAL '1 month')::date AS mes_fin_excl
  FROM params p
),

/* 1) FIJOS SIEMPRE (más actual antes de fin de mes) */
fijos_base AS (
  SELECT m.*
  FROM semaforo_movimientos m
  JOIN limites l ON TRUE
  WHERE m.activo = TRUE
    AND m.visible = TRUE
    AND m.id_usuario = l.p_id_usuario
    AND m.tipo_movimiento IN (1, 3)
    AND m.fecha_creacion < l.mes_fin_excl
),
fijos_dedup AS (
  SELECT DISTINCT ON (m.titulo, m.id_moneda, m.tipo_movimiento)
    m.id, m.titulo, m.tipo_movimiento, m.id_estado, m.monto, m.id_moneda,
    m.observacion, m.fecha_creacion, m.fecha_actualizacion,
    m.activo, m.id_usuario, m.visible, m.acumulado, m.saldo, m.fecha_vencimiento
  FROM fijos_base m
  ORDER BY m.titulo, m.id_moneda, m.tipo_movimiento, m.fecha_creacion DESC, m.id DESC
),
ingresos_fijos AS (
  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.fecha_creacion DESC), '[]'::jsonb) AS arr
  FROM (
    SELECT id, titulo, monto, id_moneda, id_estado, fecha_creacion, fecha_vencimiento,
           observacion, saldo, acumulado
    FROM fijos_dedup
    WHERE tipo_movimiento = 1
  ) x
),
egresos_fijos AS (
  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.fecha_creacion DESC), '[]'::jsonb) AS arr
  FROM (
    SELECT id, titulo, monto, id_moneda, id_estado, fecha_creacion, fecha_vencimiento,
           observacion, saldo, acumulado
    FROM fijos_dedup
    WHERE tipo_movimiento = 3
  ) x
),

/* 2) OCASIONALES DEL MES */
ingresos_ocasionales_base AS (
  SELECT m.*
  FROM semaforo_movimientos m
  JOIN limites l ON TRUE
  WHERE m.activo = TRUE
    AND m.visible = TRUE
    AND m.id_usuario = l.p_id_usuario
    AND m.tipo_movimiento = 2
    AND m.fecha_creacion >= l.mes_ini
    AND m.fecha_creacion <  l.mes_fin_excl
),
egresos_ocasionales_base AS (
  SELECT m.*
  FROM semaforo_movimientos m
  JOIN limites l ON TRUE
  WHERE m.activo = TRUE
    AND m.visible = TRUE
    AND m.id_usuario = l.p_id_usuario
    AND m.tipo_movimiento = 4
    AND m.fecha_creacion >= l.mes_ini
    AND m.fecha_creacion <  l.mes_fin_excl
),
ingresos_ocasionales AS (
  SELECT COALESCE(jsonb_agg(to_jsonb(m) ORDER BY m.fecha_creacion DESC), '[]'::jsonb) AS arr
  FROM ingresos_ocasionales_base m
),
egresos_ocasionales AS (
  SELECT COALESCE(jsonb_agg(to_jsonb(m) ORDER BY m.fecha_creacion DESC), '[]'::jsonb) AS arr
  FROM egresos_ocasionales_base m
),

/* 3) POR COBRAR / POR PAGAR DEL MES + ABONOS DEL MES */
por_cobrar_base AS (
  SELECT m.*
  FROM semaforo_movimientos m
  JOIN limites l ON TRUE
  WHERE m.activo = TRUE
    AND m.visible = TRUE
    AND m.id_usuario = l.p_id_usuario
    AND m.tipo_movimiento = 6
    AND m.fecha_creacion >= l.mes_ini
    AND m.fecha_creacion <  l.mes_fin_excl
),
por_pagar_base AS (
  SELECT m.*
  FROM semaforo_movimientos m
  JOIN limites l ON TRUE
  WHERE m.activo = TRUE
    AND m.visible = TRUE
    AND m.id_usuario = l.p_id_usuario
    AND m.tipo_movimiento = 5
    AND m.fecha_creacion >= l.mes_ini
    AND m.fecha_creacion <  l.mes_fin_excl
),
abonos_mes AS (
  SELECT a.*
  FROM semaforo_abonos a
  JOIN limites l ON TRUE
  WHERE a.activo = TRUE
    AND a.fecha_abono >= l.mes_ini
    AND a.fecha_abono <  l.mes_fin_excl
),
por_cobrar AS (
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', b.id, 'titulo', b.titulo, 'monto', b.monto, 'id_moneda', b.id_moneda,
        'id_estado', b.id_estado, 'fecha_creacion', b.fecha_creacion,
        'fecha_vencimiento', b.fecha_vencimiento, 'observacion', b.observacion,
        'saldo', b.saldo, 'acumulado', b.acumulado,
        'abonos', COALESCE(
          (SELECT jsonb_agg(to_jsonb(a) ORDER BY a.fecha_abono DESC)
           FROM abonos_mes a
           WHERE a.id_semaforo_movimiento = b.id),
          '[]'::jsonb
        )
      )
      ORDER BY b.fecha_creacion DESC
    ),
    '[]'::jsonb
  ) AS arr
  FROM por_cobrar_base b
),
por_pagar AS (
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', b.id, 'titulo', b.titulo, 'monto', b.monto, 'id_moneda', b.id_moneda,
        'id_estado', b.id_estado, 'fecha_creacion', b.fecha_creacion,
        'fecha_vencimiento', b.fecha_vencimiento, 'observacion', b.observacion,
        'saldo', b.saldo, 'acumulado', b.acumulado,
        'abonos', COALESCE(
          (SELECT jsonb_agg(to_jsonb(a) ORDER BY a.fecha_abono DESC)
           FROM abonos_mes a
           WHERE a.id_semaforo_movimiento = b.id),
          '[]'::jsonb
        )
      )
      ORDER BY b.fecha_creacion DESC
    ),
    '[]'::jsonb
  ) AS arr
  FROM por_pagar_base b
),

/* 4) RESUMEN MENSUAL POR MONEDA */
componentes AS (
  /* Ingresos fijos (fijos_dedup tipo 1) */
  SELECT id_moneda, SUM(monto)::numeric AS ingreso, 0::numeric AS egreso
  FROM fijos_dedup
  WHERE tipo_movimiento = 1
  GROUP BY id_moneda

  UNION ALL

  /* Egresos fijos (fijos_dedup tipo 3) */
  SELECT id_moneda, 0::numeric, SUM(monto)::numeric
  FROM fijos_dedup
  WHERE tipo_movimiento = 3
  GROUP BY id_moneda

  UNION ALL

  /* Ingresos ocasionales del mes (2) */
  SELECT id_moneda, SUM(monto)::numeric, 0::numeric
  FROM ingresos_ocasionales_base
  GROUP BY id_moneda

  UNION ALL

  /* Egresos ocasionales del mes (4) */
  SELECT id_moneda, 0::numeric, SUM(monto)::numeric
  FROM egresos_ocasionales_base
  GROUP BY id_moneda

  UNION ALL

  /* Por cobrar (acumulado) del mes (6) -> ingreso */
  SELECT id_moneda, SUM(acumulado)::numeric, 0::numeric
  FROM por_cobrar_base
  GROUP BY id_moneda

  UNION ALL

  /* Por pagar (acumulado) del mes (5) -> egreso */
  SELECT id_moneda, 0::numeric, SUM(acumulado)::numeric
  FROM por_pagar_base
  GROUP BY id_moneda
),
resumen_mensual AS (
  SELECT
    id_moneda,
	mo.nombre,
	mo.sigla_iso,
    COALESCE(SUM(ingreso), 0)::numeric   AS ingresos,
    COALESCE(SUM(egreso),  0)::numeric   AS egresos,
    (COALESCE(SUM(ingreso),0) - COALESCE(SUM(egreso),0))::numeric AS saldo,
    ((COALESCE(SUM(ingreso),0) - COALESCE(SUM(egreso),0)) / 30.0)::numeric AS diario
  FROM componentes
  left join monedas mo on mo.id = id_moneda
  GROUP BY id_moneda,mo.nombre,	mo.sigla_iso
),
saldos AS (
  SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.id_moneda), '[]'::jsonb) AS arr
  FROM resumen_mensual r
)

SELECT
  /* JSON con listas */
  jsonb_build_object(
    'ingresos_fijos',       (SELECT arr FROM ingresos_fijos),
    'egresos_fijos',        (SELECT arr FROM egresos_fijos),
    'ingresos_ocasionales', (SELECT arr FROM ingresos_ocasionales),
    'egresos_ocasionales',  (SELECT arr FROM egresos_ocasionales),
    'por_cobrar',           (SELECT arr FROM por_cobrar),
    'por_pagar',            (SELECT arr FROM por_pagar)
  ) AS movimientos,

  /* JSON con conteos */
  jsonb_build_object(
    'cant_ingreso_fijo',        (SELECT COUNT(*) FROM fijos_dedup WHERE tipo_movimiento = 1),
    'cant_egreso_fijo',         (SELECT COUNT(*) FROM fijos_dedup WHERE tipo_movimiento = 3),
    'cant_ingreso_ocasional',   (SELECT COUNT(*) FROM ingresos_ocasionales_base),
    'cant_egreso_ocasional',    (SELECT COUNT(*) FROM egresos_ocasionales_base),
    'cant_egresos_por_pagar',   (SELECT COUNT(*) FROM por_pagar_base),
    'cant_ingresos_por_cobrar', (SELECT COUNT(*) FROM por_cobrar_base)
  ) AS conteos,

  /* JSON con resumen mensual por moneda */
  (SELECT arr FROM saldos) AS saldos;
`


export const sqlConteoMovimientosSemaforoFinancieroPorUsuario = `WITH params AS (
  SELECT
     $(id_usuario) AS p_id_usuario,
    make_date(
		coalesce($(anio), EXTRACT(year from CURRENT_DATE)::int), -- año
		coalesce($(mes),EXTRACT(MONTH from CURRENT_DATE)::int), -- mes
		coalesce($(dia),1) -- dia
	)::date AS p_ini
),
limites AS (
  SELECT
    p.*,
    (p.p_ini + INTERVAL '1 month')::date AS p_fin
  FROM params p
),
base AS (
  SELECT m.*
  FROM public.semaforo_movimientos m
  JOIN limites l ON TRUE
  WHERE m.activo = TRUE
    AND m.id_usuario = l.p_id_usuario
),
base_periodo AS (
  SELECT b.*,
         date_trunc('month', b.fecha_creacion)::date AS periodo
  FROM base b
),
-- Fijos vigentes al mes: último por (usuario, moneda, tipo in (1,3), título) con periodo <= p_ini
fijos_vigentes AS (
  SELECT DISTINCT ON (id_usuario, id_moneda, tipo_movimiento, titulo)
         id, id_usuario, id_moneda, tipo_movimiento, titulo, monto,
         fecha_creacion, id_estado, periodo
  FROM base_periodo b
  JOIN limites l ON TRUE
  WHERE b.tipo_movimiento IN (1,3)
    AND b.periodo <= l.p_ini
  ORDER BY id_usuario, id_moneda, tipo_movimiento, titulo,
           periodo DESC, fecha_creacion DESC, id DESC
),
-- Ocasionales del mes [p_ini, p_fin)
ocasionales_mes AS (
  SELECT id
  FROM base_periodo b
  JOIN limites l ON TRUE
  WHERE b.tipo_movimiento IN (2,4)
    AND b.fecha_creacion >= l.p_ini
    AND b.fecha_creacion <  l.p_fin
),
-- Abonos hasta fin de mes (para saldo pendiente de 5/6)
abonos_hasta_cierre AS (
  SELECT sa.id_semaforo_movimiento,
         SUM(sa.monto_abono) AS total_abonado
  FROM public.semaforo_abonos sa
  JOIN limites l ON TRUE
  WHERE sa.activo = TRUE
    AND sa.fecha_abono < l.p_fin
  GROUP BY sa.id_semaforo_movimiento
),
cxp_cxc_cierre AS (
  SELECT m.id, m.tipo_movimiento,
         (m.monto - COALESCE(a.total_abonado, 0)) AS saldo_pendiente_cierre
  FROM base_periodo m
  LEFT JOIN abonos_hasta_cierre a ON a.id_semaforo_movimiento = m.id
  WHERE m.tipo_movimiento IN (5,6)
)
SELECT
  -- fijos: cuenta de conceptos vigentes (1 y 3)
  (SELECT COUNT(*) FROM fijos_vigentes WHERE tipo_movimiento = 1) AS cant_ingreso_fijo,
  (SELECT COUNT(*) FROM fijos_vigentes WHERE tipo_movimiento = 3) AS cant_egreso_fijo,

  -- ocasionales del mes (2 y 4)
  (SELECT COUNT(*) FROM ocasionales_mes  om JOIN base b ON b.id = om.id WHERE b.tipo_movimiento = 2) AS cant_ingreso_ocasional,
  (SELECT COUNT(*) FROM ocasionales_mes  om JOIN base b ON b.id = om.id WHERE b.tipo_movimiento = 4) AS cant_egreso_ocasional,

  -- pendientes a cierre (5 y 6)
  (SELECT COUNT(*) FROM cxp_cxc_cierre WHERE tipo_movimiento = 5 AND saldo_pendiente_cierre > 0) AS cant_egresos_por_pagar,
  (SELECT COUNT(*) FROM cxp_cxc_cierre WHERE tipo_movimiento = 6 AND saldo_pendiente_cierre > 0) AS cant_ingresos_por_cobrar;
`

/*
Consulta SQL para semaforo anterior, se quito fecha a  20-10-2025
WITH agg AS (
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
ORDER BY u.id, a.id_moneda

*/