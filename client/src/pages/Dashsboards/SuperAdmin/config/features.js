// src/pages/SuperAdmin/config/features.js
export const ROUTE_BASE = "/admin";

export const seccionesFeatures = [
  {
    key: "registrarParticipante",
    title: "Registrar Inversionista",
    desc: "Registrar Nuevos Inversionistas",
    icon: "/icons/2179332.png",
    path: `${ROUTE_BASE}/inversionistas`,
    allowedGroups: [], // todos los grupos
  },
];
