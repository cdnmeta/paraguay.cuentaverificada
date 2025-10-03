
export const URL_BASE = "usuarios"

export const routes =  {
    listadoUsuarios: `${URL_BASE}/listado`,
    registrarUsuario: `${URL_BASE}/registrar`,
    editarUsuario: (id) => `${URL_BASE}/${id}`,
}
