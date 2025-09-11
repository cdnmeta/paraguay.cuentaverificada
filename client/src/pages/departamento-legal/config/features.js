export const ROUTE_BASE = "/departamento-legal";

export const seccionesFeatures = [
  {
    icon: "/icons/2179332.png",
    title: "Solictudes de Pago",
    desc: "Solictudes de pagos hechos por comercios",
    path: `${ROUTE_BASE}/aprobacion-pago-comercio`,
    allowedGroups: [], // todos los grupos
  },
  {
    icon: "/icons/2179332.png",
    title: "Verificacion de Comercio",
    desc: "Verificacion de datos del Comercio",
    path: `${ROUTE_BASE}/aprobacion-comercio`,
    allowedGroups: [], // todos los grupos
  },
  {
    icon: "/icons/2179332.png",
    title: "Aprobación de Cuenta",
    desc: "Aprobación de solicitudes de cuentas",
    path: `${ROUTE_BASE}/aprobacion-cuenta`,
    allowedGroups: [], // todos los grupos
  },
];
