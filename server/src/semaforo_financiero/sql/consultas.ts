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
abonos_mes AS (
  SELECT a.*
  FROM semaforo_abonos a, limites l
  WHERE a.activo = TRUE
    AND a.fecha_abono >= l.mes_ini
    AND a.fecha_abono <  l.mes_fin_excl
)

SELECT
  /* ================= MOVIMIENTOS ================= */
  jsonb_build_object(
    -- Fijos del mes
    'ingresos_fijos',
    COALESCE((
      SELECT jsonb_agg(to_jsonb(m) ORDER BY m.fecha_creacion DESC)
      FROM semaforo_movimientos m, limites l
      WHERE m.activo = TRUE AND m.visible = TRUE
        AND m.id_usuario = l.p_id_usuario
        AND m.tipo_movimiento = 1
        AND m.fecha_creacion >= l.mes_ini
        AND m.fecha_creacion <  l.mes_fin_excl
    ), '[]'::jsonb),

    'egresos_fijos',
    COALESCE((
      SELECT jsonb_agg(to_jsonb(m) ORDER BY m.fecha_creacion DESC)
      FROM semaforo_movimientos m, limites l
      WHERE m.activo = TRUE AND m.visible = TRUE
        AND m.id_usuario = l.p_id_usuario
        AND m.tipo_movimiento = 3
        AND m.fecha_creacion >= l.mes_ini
        AND m.fecha_creacion <  l.mes_fin_excl
    ), '[]'::jsonb),

    -- Ocasionales del mes
    'ingresos_ocasionales',
    COALESCE((
      SELECT jsonb_agg(to_jsonb(m) ORDER BY m.fecha_creacion DESC)
      FROM semaforo_movimientos m, limites l
      WHERE m.activo = TRUE AND m.visible = TRUE
        AND m.id_usuario = l.p_id_usuario
        AND m.tipo_movimiento = 2
        AND m.fecha_creacion >= l.mes_ini
        AND m.fecha_creacion <  l.mes_fin_excl
    ), '[]'::jsonb),

    'egresos_ocasionales',
    COALESCE((
      SELECT jsonb_agg(to_jsonb(m) ORDER BY m.fecha_creacion DESC)
      FROM semaforo_movimientos m, limites l
      WHERE m.activo = TRUE AND m.visible = TRUE
        AND m.id_usuario = l.p_id_usuario
        AND m.tipo_movimiento = 4
        AND m.fecha_creacion >= l.mes_ini
        AND m.fecha_creacion <  l.mes_fin_excl
    ), '[]'::jsonb),

    -- Por cobrar: pendientes siempre + cancelados del mes
    'por_cobrar',
    COALESCE((
      SELECT jsonb_agg(
               jsonb_build_object(
                 'id', m.id, 'titulo', m.titulo, 'monto', m.monto, 'id_moneda', m.id_moneda,
                 'id_estado', m.id_estado, 'fecha_creacion', m.fecha_creacion,
                 'fecha_vencimiento', m.fecha_vencimiento, 'observacion', m.observacion,
                 'saldo', m.saldo, 'acumulado', m.acumulado,
                 'abonos', COALESCE((
                   SELECT jsonb_agg(to_jsonb(a) ORDER BY a.fecha_abono DESC)
                   FROM abonos_mes a WHERE a.id_semaforo_movimiento = m.id
                 ), '[]'::jsonb)
               )
               ORDER BY m.fecha_creacion DESC
             )
      FROM semaforo_movimientos m, limites l
      WHERE m.activo = TRUE AND m.visible = TRUE
        AND m.id_usuario = l.p_id_usuario
        AND m.tipo_movimiento = 6
        AND (
          m.id_estado = 1 -- pendientes SIEMPRE
          OR (
            m.id_estado = 3 -- cancelados SOLO del mes consultado
            AND m.fecha_creacion >= l.mes_ini
            AND m.fecha_creacion <  l.mes_fin_excl
          )
        )
    ), '[]'::jsonb),

    -- Por pagar: pendientes siempre + cancelados del mes
    'por_pagar',
    COALESCE((
      SELECT jsonb_agg(
               jsonb_build_object(
                 'id', m.id, 'titulo', m.titulo, 'monto', m.monto, 'id_moneda', m.id_moneda,
                 'id_estado', m.id_estado, 'fecha_creacion', m.fecha_creacion,
                 'fecha_vencimiento', m.fecha_vencimiento, 'observacion', m.observacion,
                 'saldo', m.saldo, 'acumulado', m.acumulado,
                 'abonos', COALESCE((
                   SELECT jsonb_agg(to_jsonb(a) ORDER BY a.fecha_abono DESC)
                   FROM abonos_mes a WHERE a.id_semaforo_movimiento = m.id
                 ), '[]'::jsonb)
               )
               ORDER BY m.fecha_creacion DESC
             )
      FROM semaforo_movimientos m, limites l
      WHERE m.activo = TRUE AND m.visible = TRUE
        AND m.id_usuario = l.p_id_usuario
        AND m.tipo_movimiento = 5
        AND (
          m.id_estado = 1 -- pendientes SIEMPRE
          OR (
            m.id_estado = 2 -- cancelados SOLO del mes consultado
            AND m.fecha_creacion >= l.mes_ini
            AND m.fecha_creacion <  l.mes_fin_excl
          )
        )
    ), '[]'::jsonb)
  ) AS movimientos,

  /* ================= CONTEOS ================= */
  jsonb_build_object(
    'cant_ingreso_fijo',
    (SELECT COUNT(*) FROM semaforo_movimientos m, limites l
     WHERE m.activo = TRUE AND m.visible = TRUE
       AND m.id_usuario = l.p_id_usuario
       AND m.tipo_movimiento = 1
       AND m.fecha_creacion >= l.mes_ini
       AND m.fecha_creacion <  l.mes_fin_excl),

    'cant_egreso_fijo',
    (SELECT COUNT(*) FROM semaforo_movimientos m, limites l
     WHERE m.activo = TRUE AND m.visible = TRUE
       AND m.id_usuario = l.p_id_usuario
       AND m.tipo_movimiento = 3
       AND m.fecha_creacion >= l.mes_ini
       AND m.fecha_creacion <  l.mes_fin_excl),

    'cant_ingreso_ocasional',
    (SELECT COUNT(*) FROM semaforo_movimientos m, limites l
     WHERE m.activo = TRUE AND m.visible = TRUE
       AND m.id_usuario = l.p_id_usuario
       AND m.tipo_movimiento = 2
       AND m.fecha_creacion >= l.mes_ini
       AND m.fecha_creacion <  l.mes_fin_excl),

    'cant_egreso_ocasional',
    (SELECT COUNT(*) FROM semaforo_movimientos m, limites l
     WHERE m.activo = TRUE AND m.visible = TRUE
       AND m.id_usuario = l.p_id_usuario
       AND m.tipo_movimiento = 4
       AND m.fecha_creacion >= l.mes_ini
       AND m.fecha_creacion <  l.mes_fin_excl),

    'cant_egresos_por_pagar',
    (SELECT COUNT(*) FROM semaforo_movimientos m, limites l
     WHERE m.activo = TRUE AND m.visible = TRUE
       AND m.id_usuario = l.p_id_usuario
       AND m.tipo_movimiento = 5
       AND (
         m.id_estado = 1
         OR (m.id_estado = 2 AND m.fecha_creacion >= l.mes_ini AND m.fecha_creacion < l.mes_fin_excl)
       )),

    'cant_ingresos_por_cobrar',
    (SELECT COUNT(*) FROM semaforo_movimientos m, limites l
     WHERE m.activo = TRUE AND m.visible = TRUE
       AND m.id_usuario = l.p_id_usuario
       AND m.tipo_movimiento = 6
       AND (
         m.id_estado = 1
         OR (m.id_estado = 3 AND m.fecha_creacion >= l.mes_ini AND m.fecha_creacion < l.mes_fin_excl)
       ))
  ) AS conteos,

  /* ================= SALDOS (resumen mensual SOLO del mes) ================= */
  (
    WITH componentes AS (
      /* fijos del mes */
      SELECT m.id_moneda,
             SUM(CASE WHEN m.tipo_movimiento = 1 THEN m.monto ELSE 0 END)::numeric AS ingreso,
             SUM(CASE WHEN m.tipo_movimiento = 3 THEN m.monto ELSE 0 END)::numeric AS egreso
      FROM semaforo_movimientos m, limites l
      WHERE m.activo = TRUE AND m.visible = TRUE
        AND m.id_usuario = l.p_id_usuario
        AND m.tipo_movimiento IN (1,3)
        AND m.fecha_creacion >= l.mes_ini
        AND m.fecha_creacion <  l.mes_fin_excl
      GROUP BY m.id_moneda

      UNION ALL
      /* ocasionales del mes */
      SELECT m.id_moneda,
             SUM(CASE WHEN m.tipo_movimiento = 2 THEN m.monto ELSE 0 END)::numeric,
             SUM(CASE WHEN m.tipo_movimiento = 4 THEN m.monto ELSE 0 END)::numeric
      FROM semaforo_movimientos m, limites l
      WHERE m.activo = TRUE AND m.visible = TRUE
        AND m.id_usuario = l.p_id_usuario
        AND m.tipo_movimiento IN (2,4)
        AND m.fecha_creacion >= l.mes_ini
        AND m.fecha_creacion <  l.mes_fin_excl
      GROUP BY m.id_moneda

      UNION ALL
      /* por cobrar del mes (solo los creados en el mes) */
      SELECT m.id_moneda,
             SUM(m.acumulado)::numeric, 0::numeric
      FROM semaforo_movimientos m, limites l
      WHERE m.activo  = TRUE AND m.visible = TRUE
        AND m.id_usuario = l.p_id_usuario
        AND m.tipo_movimiento = 6
        AND m.fecha_creacion >= l.mes_ini
        AND m.fecha_creacion <  l.mes_fin_excl
      GROUP BY m.id_moneda

      UNION ALL
      /* por pagar del mes (solo los creados en el mes) */
      SELECT m.id_moneda,
             0::numeric, SUM(m.acumulado)::numeric
      FROM semaforo_movimientos m, limites l
      WHERE m.activo  = TRUE AND m.visible = TRUE
        AND m.id_usuario = l.p_id_usuario
        AND m.tipo_movimiento = 5
        AND m.fecha_creacion >= l.mes_ini
        AND m.fecha_creacion <  l.mes_fin_excl
      GROUP BY m.id_moneda
    )
    SELECT COALESCE(jsonb_agg(
             jsonb_build_object(
               'id_moneda', r.id_moneda,
               'nombre', mo.nombre,
               'sigla_iso', mo.sigla_iso,
               'ingresos', r.ingresos,
               'egresos',  r.egresos,
               'saldo',    r.saldo,
               'diario',   r.diario
             )
             ORDER BY r.id_moneda
           ), '[]'::jsonb)
    FROM (
      SELECT id_moneda,
             COALESCE(SUM(ingreso), 0)::numeric AS ingresos,
             COALESCE(SUM(egreso),  0)::numeric AS egresos,
             (COALESCE(SUM(ingreso),0) - COALESCE(SUM(egreso),0))::numeric AS saldo,
             ((COALESCE(SUM(ingreso),0) - COALESCE(SUM(egreso),0)) / 30.0)::numeric AS diario
      FROM componentes
      GROUP BY id_moneda
    ) r
    LEFT JOIN monedas mo ON mo.id = r.id_moneda
  ) AS saldos;
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