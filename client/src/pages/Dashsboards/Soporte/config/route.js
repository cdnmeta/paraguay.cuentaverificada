export const URL_BASE = 'soporte'

export const routes = {
    index: URL_BASE,
    ticketsListado: `${URL_BASE}/tickets/listado`,
    misTickets: `${URL_BASE}/mis-tickets`,
    ticketDetail: (id) => `${URL_BASE}/tickets/${id}`,
    configuracion: `${URL_BASE}/configuracion`
};