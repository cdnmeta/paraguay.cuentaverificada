// src/pages/SuperAdmin/config/features.js
export const ROUTE_BASE = "/admin";

export const routes = [
  {
    key: "registrarParticipante",
    path: `${ROUTE_BASE}/participantes`,
  },
  {
    key: "listadoParticipantes",
    path: `${ROUTE_BASE}/participantes/listado`,
  },
  {
    key: "listadoUsuarios",
    path: `${ROUTE_BASE}/usuarios/listado`,
  },
  {
    key: "registrarUsuarios",

    path: `${ROUTE_BASE}/usuarios`,
  },
  {
    key: "editarUsuario",

    path: (id = ":id") => `${ROUTE_BASE}/usuarios/${id}`,
  },
  {
    key: "listadoComercios",

    path: `${ROUTE_BASE}/comercios/listado`,
  },
  {
    key: "aprobacionPagosComercio",

    path: `${ROUTE_BASE}/solicitudes-pago`,
  },
  {
    key: "aprobacionComercios",

    path: `${ROUTE_BASE}/aprobacion-comercios`,
  },
  {
    key: "listadoSolicitudesCuentas",

    path: `${ROUTE_BASE}/solicitudes-cuentas`,
  },
  {
    key: "facturarPlanes",
    path: `${ROUTE_BASE}/facturas-planes/facturar`,
  },
  {
    key: "gananciasFacturas",
    path: `${ROUTE_BASE}/facturas-planes/ganancias`,
  },
];
