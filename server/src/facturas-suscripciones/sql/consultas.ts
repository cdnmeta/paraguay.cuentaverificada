export const consultaSelectFacturaInfoPago = `
WITH pagos_factura AS (
  SELECT
    pag.id_factura,
    pag.id_moneda,
	SUM(pag.monto_base) AS total_base,
    SUM(pag.monto) AS total
  FROM pagos_factura_suscripciones pag
  WHERE pag.activo = TRUE AND pag.estado = 1
  GROUP BY pag.id_factura, pag.id_moneda
),
detalles AS (
  SELECT
    det.id_factura,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id_pago', det.id,
          'monto', det.monto,
          'monto_base', det.monto_base,
          'id_moneda', det.id_moneda,
          'fecha_pago', det.fecha_pago,
		  'moneda',mo.nombre,
		  'moneda_sigla',mo.sigla_iso,
		  'moneda_simbolo',mo.simbolo,
          'metodo_pago_descripcion', mep.descripcion,
          'id_metodo_pago', det.metodo_pago,
          'id_cotizacion', det.id_cotizacion,
		  'numero_comprobante',det.nro_comprobante
        )
        ORDER BY det.fecha_pago
      )
      FILTER (WHERE det.id IS NOT NULL),
      '[]'::jsonb
    ) AS detalles_pagos,
    COUNT(det.id) AS cantidad_pagos
  FROM pagos_factura_suscripciones det
  LEFT JOIN metodo_pagos mep ON mep.id = det.metodo_pago
  LEFT JOIN monedas mo ON mo.id = det.id_moneda 
  
  WHERE det.activo = TRUE AND det.estado = 1
  GROUP BY det.id_factura
)
SELECT
  fac.id,
  fac.id_moneda,
  fac.estado,
  fac.monto AS total_factura,
  mon.nombre AS moneda_factura,

  -- totales por moneda (ajusta 1/2 a tus IDs reales)
  COALESCE(SUM(pf.total_base), 0) AS pagado_base,
  COALESCE(SUM(pf.total) FILTER (WHERE pf.id_moneda = 2), 0) AS pagado_guaranies,
  COALESCE(SUM(pf.total) FILTER (WHERE pf.id_moneda = 1), 0) AS pagado_dolares,

  -- cantidad de pagos y detalles ([] si no hay)
  COALESCE(d.cantidad_pagos, 0) AS cantidad_pagos,
  COALESCE(d.detalles_pagos, '[]'::jsonb) AS detalles_pagos

FROM factura_suscripciones fac
LEFT JOIN monedas mon ON mon.id = fac.id_moneda
LEFT JOIN pagos_factura pf ON pf.id_factura = fac.id
LEFT JOIN detalles d ON d.id_factura = fac.id
WHERE fac.id = $1
  AND fac.estado IN (1, 2)
  AND fac.activo = TRUE
GROUP BY
  fac.id, fac.id_moneda, fac.monto, mon.nombre, d.cantidad_pagos, d.detalles_pagos;
`