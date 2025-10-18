export const URL_BASE = 'soporte-ayuda'

export const routes = {
    index: `${URL_BASE}`,
    ticketDetalle : (id) => `${URL_BASE}/ticket/${id}`,
}