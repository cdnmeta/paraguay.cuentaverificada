import { dtoLegalRoutes } from "@/pages/departamento-legal/dpto-legal.routes";
import { routes as verficadorRoutes } from "@/pages/Verificador/verficador.routes";
import { ROUTE_BASE as DashBoardParticipante } from "@/pages/Dashsboards/Participante/config/features";

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
  misDatos: "/cuenta",
  verificacionComercio: "/verificacion-comercio",
};

export const getUrlDashboardGrupos = (idGrupo) => {
  console.log("Grupo ID:", idGrupo);
  switch (idGrupo) {
    case 1:
      return `/${dtoLegalRoutes.index}`;
    case 2:
      return `/${verficadorRoutes.index}`;
    case 3:
    case 4:
      return DashBoardParticipante;
    case "admin":
      return `${PROTECTED_ROUTES.admin}`;
    case "protegido":
      return `${PROTECTED_ROUTES.dashboard}`;
    default:
      return PROTECTED_ROUTES.dashboard;
  }
};
