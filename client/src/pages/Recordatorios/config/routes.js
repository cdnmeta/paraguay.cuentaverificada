export const URL_BASE = 'recordatorios';

export const routes = {
    index: URL_BASE,
    crear: `${URL_BASE}/crear`,
    editar: (id) => `${URL_BASE}/editar/${id}`,
}