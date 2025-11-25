export const URL_BASE = 'planes';

// URLs completas para navegación
export const routes = {
  index: `${URL_BASE}/`,
  crear: `${URL_BASE}/crear`,
  editar: (id = ":id") => `${URL_BASE}/editar/${id}`,

}