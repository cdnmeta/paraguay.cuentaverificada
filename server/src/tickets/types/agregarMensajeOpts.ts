export interface AgregarMensajeOpts {
    validateAsignado?: boolean; // Si es true, valida que el usuario sea el asignado al ticket
    validateReportante?: boolean; // Si es true, valida que el usuario sea el reportante del ticket
    validateEstadoResolucion?: boolean; // Si es true, valida que el ticket no esté cerrado o resuelto
    validateEstadosTickets?: boolean; // Si es true, valida que el ticket esté en un estado válido para agregar mensajes
}