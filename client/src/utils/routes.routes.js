import { routes as dtoLegalRoutes } from "@/pages/departamento-legal/config/routes";
import { routes as verficadorRoutes } from "@/pages/Verificador/verficador.routes";
import { routes as DashBoardParticipante } from "@/pages/Dashsboards/Participante/config/routes";
import { routes as SorporteRoutes } from "@/pages/Dashsboards/Soporte/config/route";
export const PUBLIC_ROUTES = {
  inicio: "/",
  login: "/login",
  register: "/register",
  solicitarCuentaVerificada: "/solicitar-cuenta-verificada",
  subirCedula: "/subir-cedula",
  panel: "/panel",
  resetPassword: "/reset-password",
  recoveryPin: "/recovery-pin",
};

export const PROTECTED_ROUTES = {
  admin: "/admin",
  dashboard: "/panel",
  misDatos: "/mi-cuenta",
  verificacionComercio: "/verificacion-comercio",
};

export const ROUTES_DASHBOARD = {
  'admin': PROTECTED_ROUTES.admin,
  1: dtoLegalRoutes.index,
  2: verficadorRoutes.index,
  3: DashBoardParticipante.index,
  4: DashBoardParticipante.index,
  5: SorporteRoutes.index,
};

let ROUTES_DASHBOARD_ALL = {
  ...ROUTES_DASHBOARD,
  'protegido': PROTECTED_ROUTES.dashboard,
}

console.log("rutas", ROUTES_DASHBOARD);

// Función para obtener la URL del dashboard según el idGrupo o rol
export const getUrlDashboardGrupos = (idGrupo) => {
  console.log("ID GRUPO",idGrupo)
  console.log("Ruta seleccioando", ROUTES_DASHBOARD_ALL[idGrupo]);

  /* switch (idGrupo) {
    case 1:
      return `/${dtoLegalRoutes.index}`;
    case 2:
      return `/${verficadorRoutes.index}`;
    case 3:
    case 4: 
      return DashBoardParticipante;
    case 5:
      return `/${SorporteRoutes.index}`;
    case "admin":
      return `${PROTECTED_ROUTES.admin}`;
    case "protegido":
      return `${PROTECTED_ROUTES.dashboard}`;
    default:
      return PROTECTED_ROUTES.dashboard;
  } */

  return ROUTES_DASHBOARD_ALL[idGrupo] || PROTECTED_ROUTES.dashboard;
};
