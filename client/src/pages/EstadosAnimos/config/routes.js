export const URL_BASE = "estados-animos"

export const routes =  {
    listadoEstadosAnimos: `${URL_BASE}/listado`,
    registrarEstadoAnimo: `${URL_BASE}/registrar`,
    editarEstadoAnimo: (id) => `${URL_BASE}/${id}`,
}