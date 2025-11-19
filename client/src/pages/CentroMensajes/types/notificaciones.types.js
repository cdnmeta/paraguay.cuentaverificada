// Tipos basados en los DTOs del servidor

/**
 * @typedef {Object} QueryMisNotificacionesDto
 * @property {number} [page] - Número de página (iniciando en 1)
 * @property {number} [limit] - Límite de elementos por página
 * @property {number} [tipo_notificacion] - ID del tipo de notificación
 * @property {number} [id_estado] - ID del estado de notificación
 * @property {string} [fecha_desde] - Fecha desde (formato: YYYY-MM-DD)
 * @property {string} [fecha_hasta] - Fecha hasta (formato: YYYY-MM-DD)
 */

/**
 * @typedef {Object} TipoNotificacionDisponible
 * @property {number} id_tipo_notificacion - ID del tipo de notificación
 * @property {string} descripcion_tipo_notificacion - Descripción del tipo
 */

/**
 * @typedef {Object} Notificacion
 * @property {number} id - ID de la notificación
 * @property {string} titulo - Título de la notificación
 * @property {string} cuerpo - Contenido de la notificación
 * @property {string} fecha_creacion - Fecha de creación (ISO string)
 * @property {number} id_estado_notificacion - ID del estado
 * @property {string} descripcion_estado - Descripción del estado
 * @property {number} id_tipo_notificacion - ID del tipo
 * @property {string} descripcion_tipo_notificacion - Descripción del tipo
 */

/**
 * @typedef {Object} MisNotificacionesResponse
 * @property {Object} data - Datos de la respuesta
 * @property {Notificacion[]} data.notificaciones - Lista de notificaciones
 * @property {TipoNotificacionDisponible[]} data.tipos_disponibles - Tipos disponibles
 * @property {number} page - Página actual
 * @property {number} limit - Límite por página
 * @property {number} total - Total de elementos
 * @property {number} totalPages - Total de páginas
 * @property {boolean} hasNext - Si hay siguiente página
 * @property {boolean} hasPrev - Si hay página anterior
 */

/**
 * @typedef {Omit<QueryMisNotificacionesDto, "page" | "limit">} FiltrosNotificaciones
 */

/**
 * @typedef {Object} FiltrosNotificacionesFormProps
 * @property {TipoNotificacionDisponible[]} tiposNotificacion - Lista de tipos disponibles
 * @property {function(FiltrosNotificaciones): void} onSubmit - Callback para enviar filtros
 */

/**
 * @typedef {Object} ListaNotificacionesInfinitaProps
 * @property {FiltrosNotificaciones} filtros - Filtros actuales
 * @property {number} [limitPorPagina] - Límite por página (default: 10)
 */

export {};