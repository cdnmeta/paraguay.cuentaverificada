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
  {
    key: "asignarRoles",
    title: "Asignar Roles",
    desc: "Asignar Roles a los a usuarios",
    icon: "/icons/2179332.png",
    path: `${ROUTE_BASE}/roles`,
    allowedGroups: [], // todos los grupos
  },
  {
    key: "registrarUsuarios",
    title: "Administrar Usuarios",
    desc:  "Registrar Nuevos Usuarios",
    icon: "/icons/2179332.png",
    path: `${ROUTE_BASE}/usuarios/nuevo`,
    allowedGroups: [], // todos los grupos
  },
];
