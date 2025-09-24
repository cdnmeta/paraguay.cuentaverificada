import { ROUTE_BASE,routes } from "./routes";



export const seccionesFeatures = [
  {
    title: "Listado de Participantes",
    desc: "Buscar participantes registrados",
    icon: "/icons/2179332.png",
    path: `${ROUTE_BASE}/participantes/listado`,
  },
  {
    title: "Listado de Usuarios",
    desc: "Ver y gestionar todos los usuarios",
    icon: "/icons/2179332.png",
    path: routes.find(r=>r.key == "listadoUsuarios").path,
  },
  {
    title: "Listado Comercios",
    desc:  "Buscar comercios registrados",
    icon: "/icons/2179332.png",
    path: routes.find(r=>r.key == "listadoComercios").path,
  },
  {
    title: "Aprobacion de Pago",
    desc:  "Comercios Pendientes de Solicitudes de Pago",
    icon: "/icons/2179332.png",
    path: `${ROUTE_BASE}/solicitudes-pago`,
  },
  {
    title: "Aprobacion de Comericos",
    desc:  "Aprobar comercio verificado",
    icon: "/icons/2179332.png",
    path: `${ROUTE_BASE}/aprovacion-comercios`,
  },
  {
    title: "Aprobacion de solicitudes de cuentas",
    desc:  "Aprobar solicitudes de cuentas",
    icon: "/icons/2179332.png",
    path: `${ROUTE_BASE}/solicitudes-cuentas`,
  },
  {
    title: "Cotizaciones de Empresa",
    desc:  "Gestionar cotizaciones de empresas",
    icon: "/icons/2179332.png",
    path: `${ROUTE_BASE}/cotizacion-empresa`,
  }
];
