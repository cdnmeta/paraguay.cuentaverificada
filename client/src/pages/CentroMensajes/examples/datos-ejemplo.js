/**
 * Datos de ejemplo para testing y desarrollo
 * del sistema de notificaciones
 */

// Tipos de notificación de ejemplo
export const tiposNotificacionEjemplo = [
  { id_tipo_notificacion: 1, descripcion_tipo_notificacion: 'Estados de Ánimo' },
  { id_tipo_notificacion: 2, descripcion_tipo_notificacion: 'Chat Tienda' },
  { id_tipo_notificacion: 3, descripcion_tipo_notificacion: 'Sistema' },
  { id_tipo_notificacion: 4, descripcion_tipo_notificacion: 'Pedidos' },
  { id_tipo_notificacion: 5, descripcion_tipo_notificacion: 'Soporte y Ayuda' },
  { id_tipo_notificacion: 6, descripcion_tipo_notificacion: 'Favoritos' },
];

// Notificaciones de ejemplo
export const notificacionesEjemplo = [
  {
    id: 1,
    titulo: 'Bienvenido al sistema',
    cuerpo: 'Tu cuenta ha sido verificada exitosamente. Ya puedes usar todas las funcionalidades.',
    fecha_creacion: '2023-11-18T10:30:00Z',
    id_estado_notificacion: 3,
    descripcion_estado: 'Leído',
    id_tipo_notificacion: 3,
    descripcion_tipo_notificacion: 'Sistema',
  },
  {
    id: 2,
    titulo: 'Nuevo mensaje de soporte',
    cuerpo: 'Tienes una nueva respuesta en tu ticket de soporte #12345.',
    fecha_creacion: '2023-11-18T09:15:00Z',
    id_estado_notificacion: 5,
    descripcion_estado: 'No leído',
    id_tipo_notificacion: 5,
    descripcion_tipo_notificacion: 'Soporte y Ayuda',
  },
  {
    id: 3,
    titulo: 'Actualización de estado de ánimo',
    cuerpo: 'No olvides registrar tu estado de ánimo del día para mantener un seguimiento de tu bienestar.',
    fecha_creacion: '2023-11-17T16:45:00Z',
    id_estado_notificacion: 1,
    descripcion_estado: 'Pendiente',
    id_tipo_notificacion: 1,
    descripcion_tipo_notificacion: 'Estados de Ánimo',
  },
  {
    id: 4,
    titulo: 'Nuevo pedido recibido',
    cuerpo: 'Tienes un nuevo pedido pendiente de confirmación. Revisa los detalles en tu panel.',
    fecha_creacion: '2023-11-17T14:20:00Z',
    id_estado_notificacion: 5,
    descripcion_estado: 'No leído',
    id_tipo_notificacion: 4,
    descripcion_tipo_notificacion: 'Pedidos',
  },
];

// Filtros de ejemplo
export const filtrosEjemplo = [
  {},  // Sin filtros
  { tipo_notificacion: 3 },  // Solo sistema
  { id_estado: 5 },  // Solo no leídas
  { fecha_desde: '2023-11-01', fecha_hasta: '2023-11-30' },  // Noviembre 2023
  { tipo_notificacion: 5, id_estado: 5 },  // Soporte no leído
];

// Estados disponibles
export const estadosDisponibles = [
  { id: 1, descripcion: 'Pendiente' },
  { id: 2, descripcion: 'Enviada' },
  { id: 3, descripcion: 'Leído' },
  { id: 4, descripcion: 'Error' },
  { id: 5, descripcion: 'No leído' },
];

// Configuraciones de ejemplo por rol
export const configuracionesPorRol = {
  admin: {
    limitPorPagina: 25,
    mostrarTodosTipos: true,
    filtrosPermitidos: ['tipo_notificacion', 'id_estado', 'fecha_desde', 'fecha_hasta'],
  },
  moderador: {
    limitPorPagina: 20,
    mostrarTodosTipos: true,
    filtrosPermitidos: ['tipo_notificacion', 'id_estado', 'fecha_desde'],
  },
  usuario: {
    limitPorPagina: 10,
    mostrarTodosTipos: false,
    filtrosPermitidos: ['id_estado', 'fecha_desde'],
  },
};

// Mock de respuesta del servidor
export const respuestaServidorEjemplo = {
  data: {
    notificaciones: notificacionesEjemplo,
    tipos_disponibles: tiposNotificacionEjemplo,
  },
  page: 1,
  limit: 10,
  total: 150,
  totalPages: 15,
  hasNext: true,
  hasPrev: false,
};

export default {
  tiposNotificacionEjemplo,
  notificacionesEjemplo,
  filtrosEjemplo,
  estadosDisponibles,
  configuracionesPorRol,
  respuestaServidorEjemplo,
};