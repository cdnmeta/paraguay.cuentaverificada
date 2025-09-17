import React from "react"

export const URL_BASE = "usuarios"

export const routes = [

    {
        key: "listadoUsuarios",
        path: `listado`,
        element: React.lazy(() => import("../pages/ListadoUsuariosPages")),
    },
    {
        key: "registrarUsuario",
        path: `registrar`,
        element: React.lazy(() => import("../components/FormUsuarios")),
    },
    {
        key: "editarUsuario",
        path: `:id`,
        element: React.lazy(() => import("../components/FormUsuarios")),
    }

]