/**
 * SQL Queries para Mensajes de Tickets con Paginación Optimizada
 * Basado en el esquema real de Prisma: ticket, ticket_mensaje, usuarios
 * Utilizando Named Parameters de pg-promise con sintaxis $()
 */

/**
 * Obtener mensajes paginados de un ticket específico
 * Utiliza CTE (Common Table Expression) para optimizar la consulta
 * Soporta paginación bidireccional usando cursor-based pagination
 */
export const GET_MENSAJES_PAGINADOS = `
WITH ticket_mensajes_filtered AS (
    SELECT 
        tm.id,
        tm.mensaje,
        tm.url_archivo,
        tm.rol_autor,
        tm.es_interno,
        tm.fecha_creacion,
        tm.id_autor,
        u.nombre as autor_nombre,
        u.apellido as autor_apellido,
        u.email as autor_email
    FROM ticket_mensaje tm
    LEFT JOIN usuarios u ON tm.id_autor = u.id
    WHERE tm.id_ticket = $(ticketId)
      AND tm.activo = true
      AND ($(lastMessageId) IS NULL OR tm.id < $(lastMessageId))
      AND ($(firstMessageId) IS NULL OR tm.id > $(firstMessageId))
)
SELECT *
FROM ticket_mensajes_filtered
ORDER BY fecha_creacion ASC, id ASC
LIMIT $(limit);
`;

/**
 * Verificar si existen más mensajes anteriores al último mensaje actual
 * Utilizado para determinar el flag hasMore en la paginación
 */
export const CHECK_HAS_MORE_MENSAJES = `
SELECT EXISTS(
    SELECT 1 
    FROM ticket_mensaje tm
    WHERE tm.id_ticket = $(ticketId)
      AND tm.activo = true
      AND tm.id < $(lastMessageId)
) as has_more;
`;

/**
 * Verificar si existen mensajes posteriores al primer mensaje actual
 * Utilizado para paginación hacia adelante (menos común)
 */
export const CHECK_HAS_PREVIOUS_MENSAJES = `
SELECT EXISTS(
    SELECT 1 
    FROM ticket_mensaje tm
    WHERE tm.id_ticket = $(ticketId)
      AND tm.activo = true
      AND tm.id > $(firstMessageId)
) as has_previous;
`;

/**
 * Contar el total de mensajes en un ticket (opcional)
 * Solo usar cuando sea absolutamente necesario por performance
 */
export const COUNT_MENSAJES_TICKET = `
SELECT COUNT(*) as total
FROM ticket_mensaje tm
WHERE tm.id_ticket = $(ticketId)
  AND tm.activo = true;
`;

/**
 * Query optimizada que combina resultados y verificación en una sola consulta
 * Más eficiente pero ligeramente más compleja
 */
export const GET_MENSAJES_PAGINADOS_OPTIMIZED = `
WITH ticket_mensajes_filtered AS (
    SELECT 
        tm.id,
        tm.mensaje,
        tm.url_archivo,
        tm.rol_autor,
        tm.es_interno,
        tm.fecha_creacion,
        tm.id_autor,
        u.nombre as autor_nombre,
        u.apellido as autor_apellido,
        u.email as autor_email,
        ROW_NUMBER() OVER (ORDER BY tm.fecha_creacion DESC, tm.id DESC) as rn
    FROM ticket_mensaje tm
    LEFT JOIN usuarios u ON tm.id_autor = u.id
    WHERE tm.id_ticket = $(ticketId)
      AND tm.activo = true
      AND ($(lastMessageId) IS NULL OR tm.id < $(lastMessageId))
      AND ($(firstMessageId) IS NULL OR tm.id > $(firstMessageId))
),
mensajes_with_extra AS (
    SELECT *
    FROM ticket_mensajes_filtered
    WHERE rn <= $(limit) + 1
),
has_more_check AS (
    SELECT 
        COUNT(*) > $(limit) as has_more_records
    FROM mensajes_with_extra
)
SELECT 
    mwe.*,
    hmc.has_more_records
FROM mensajes_with_extra mwe
CROSS JOIN has_more_check hmc
WHERE mwe.rn <= $(limit)
ORDER BY mwe.fecha_creacion DESC, mwe.id DESC;
`;

/**
 * Obtener información completa del ticket junto con el último mensaje
 * Útil para mostrar preview en listados de tickets
 */
export const GET_TICKET_WITH_LAST_MESSAGE = `
SELECT 
    t.id,
    t.asunto,
    t.id_reportante,
    t.id_asignado,
    t.id_tipo_ticket,
    t.prioridad,
    t.id_estado,
    t.fecha_creacion,
    t.fecha_actualizacion,
    t.ultimo_mensaje_at,
    tt.descripcion as tipo_descripcion,
    tm.mensaje as ultimo_mensaje,
    tm.fecha_creacion as ultimo_mensaje_fecha,
    tm.rol_autor as ultimo_mensaje_rol_autor,
    u.nombre as ultimo_usuario_nombre,
    u.apellido as ultimo_usuario_apellido
FROM ticket t
LEFT JOIN tipo_ticket tt ON t.id_tipo_ticket = tt.id
LEFT JOIN LATERAL (
    SELECT mensaje, fecha_creacion, rol_autor, id_autor
    FROM ticket_mensaje 
    WHERE id_ticket = t.id 
      AND activo = true
    ORDER BY fecha_creacion DESC, id DESC
    LIMIT 1
) tm ON true
LEFT JOIN usuarios u ON tm.id_autor = u.id
WHERE t.id = $(ticketId)
  AND t.activo = true;
`;

/**
 * Obtener mensajes filtrados por rol (solo públicos o incluir internos)
 * Útil cuando un cliente no debe ver mensajes internos
 */
export const GET_MENSAJES_BY_ROLE = `
WITH ticket_mensajes_filtered AS (
    SELECT 
        tm.id,
        tm.mensaje,
        tm.url_archivo,
        tm.rol_autor,
        tm.es_interno,
        tm.fecha_creacion,
        tm.id_autor,
        u.nombre as autor_nombre,
        u.apellido as autor_apellido,
        u.email as autor_email
    FROM ticket_mensaje tm
    LEFT JOIN usuarios u ON tm.id_autor = u.id
    WHERE tm.id_ticket = $(ticketId)
      AND tm.activo = true
      AND ($(includeInternal)::boolean = true OR tm.es_interno = false)
      AND ($(lastMessageId) IS NULL OR tm.id < $(lastMessageId))
      AND ($(firstMessageId) IS NULL OR tm.id > $(firstMessageId))
)
SELECT *
FROM ticket_mensajes_filtered
ORDER BY fecha_creacion ASC , id ASC 
LIMIT $(limit);
`;

/**
 * Obtener estadísticas del ticket
 * Contadores útiles para dashboard o métricas
 */
export const GET_TICKET_STATS = `
SELECT 
    COUNT(*) as total_mensajes,
    COUNT(*) FILTER (WHERE es_interno = true) as mensajes_internos,
    COUNT(*) FILTER (WHERE es_interno = false) as mensajes_publicos,
    COUNT(*) FILTER (WHERE rol_autor = 1) as mensajes_cliente,
    COUNT(*) FILTER (WHERE rol_autor = 2) as mensajes_soporte,
    COUNT(*) FILTER (WHERE rol_autor = 3) as mensajes_sistema,
    MIN(fecha_creacion) as primer_mensaje,
    MAX(fecha_creacion) as ultimo_mensaje
FROM ticket_mensaje tm
WHERE tm.id_ticket = $(ticketId)
  AND tm.activo = true;
`;

/**
 * Buscar mensajes por contenido
 * Búsqueda full-text en mensajes del ticket
 */
export const SEARCH_MENSAJES_IN_TICKET = `
WITH ticket_mensajes_filtered AS (
    SELECT 
        tm.id,
        tm.mensaje,
        tm.url_archivo,
        tm.rol_autor,
        tm.es_interno,
        tm.fecha_creacion,
        tm.id_autor,
        u.nombre as autor_nombre,
        u.apellido as autor_apellido,
        ts_rank(to_tsvector('spanish', tm.mensaje), plainto_tsquery('spanish', $(searchText))) as rank
    FROM ticket_mensaje tm
    LEFT JOIN usuarios u ON tm.id_autor = u.id
    WHERE tm.id_ticket = $(ticketId)
      AND tm.activo = true
      AND to_tsvector('spanish', tm.mensaje) @@ plainto_tsquery('spanish', $(searchText))
      AND ($(includeInternal)::boolean = true OR tm.es_interno = false)
)
SELECT *
FROM ticket_mensajes_filtered
ORDER BY rank DESC, fecha_creacion DESC
LIMIT $(limit);
`;

/*
Sql base para listado de tickets
*/

export const SQL_LISTADO_TICKETS_GENERALES = `select 
tk.id ,
tk.asunto,
tk.id_estado,
tk.id_reportante,
tk.id_asignado,
tk.prioridad,
tk.fecha_creacion,
tk.fecha_actualizacion,
tk.id_usuario_completado,
tk.motivo_cierre,
(rep.nombre || ' ' || coalesce(rep.apellido,'')) as nombre_usuario_reportante,
(asg.nombre || ' ' || coalesce(asg.apellido,'')) as nombre_usuario_asignado,
(com.nombre || ' ' || coalesce(com.apellido,'')) as nombre_usuario_completado,
rep.dial_code,
rep.telefono,
tk.id_tipo_ticket,
ttk.descripcion as descripcion_tipo
from ticket tk
left join usuarios rep on rep.id = tk.id_reportante
left join usuarios asg on asg.id = tk.id_asignado
left join usuarios com on com.id = tk.id_usuario_completado
left join tipo_ticket ttk ON ttk.id = tk.id_tipo_ticket`