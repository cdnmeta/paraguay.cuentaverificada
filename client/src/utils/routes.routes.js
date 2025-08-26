import { dtoLegalRoutes } from "@/pages/departamento-legal/dpto-legal.routes";
import { Navigate } from "react-router-dom";

export const PUBLIC_ROUTES = {
    inicio: '/',
    login: '/login',
    register: '/register',
    solicitarCuentaVerificada: '/solicitar-cuenta-verificada',
    subirCedula:'/subir-cedula',
    panel:"/panel",
}


export const PROTECTED_ROUTES = {
  admin: '/admin',
  dashboard: "/panel",
  misDatos: "/cuenta",
  verificacionComercio: "/verificacion-comercio",
};

export const getUrlDashboardGrupos = (idGrupo) => {
    
   switch(idGrupo){
     case 1:
       return `/${dtoLegalRoutes.index}`;
     case 2:
       return null;
     case 3:
       return null;
      case 'admin':
       return `${PROTECTED_ROUTES.admin}`;
     default:
       return Navigate(PROTECTED_ROUTES.dashboard);
   }
};


