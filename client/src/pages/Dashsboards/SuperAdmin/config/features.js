import { ROUTE_BASE,routes } from "./routes";
import {routes as PlanesRoutes} from '@/pages/Planes/config/routes'
import { 
  Users, 
  Building2, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  UserCheck,
  Store,
  BadgeCheck,
  WalletMinimal
} from "lucide-react";

export const seccionesFeatures = [
  {
    title: "Listado de Participantes",
    desc: "Buscar participantes registrados en el sistema",
    icon: Users,
    path: routes.listadoParticipantes,
    variant: "default"
  },
  {
    title: "Listado de Usuarios",
    desc: "Ver y gestionar todos los usuarios del sistema",
    icon: UserCheck,
    path: routes.listadoUsuarios,
    variant: "default"
  },
  {
    title: "Listado Comercios",
    desc: "Buscar y gestionar comercios registrados",
    icon: Store,
    path: routes.listadoComercios,
    variant: "success"
  },
  {
    title: "Aprobación de Pago",
    desc: "Comercios pendientes de solicitudes de pago",
    icon: CreditCard,
    path: routes.aprobacionPagosComercio,
    variant: "warning"
  },
  {
    title: "Aprobación de Comercios",
    desc: "Aprobar comercios para verificación",
    icon: Building2,
    path: routes.aprobacionComercios,
    variant: "warning"
  },
  {
    title: "Solicitudes de Verificación de Cuentas",
    desc: "Revisar Solicitudes de Verificación de Cuentas",
    icon: BadgeCheck,
    path: routes.listadoSolicitudesCuentas,
    variant: "success"
  },
  {
    title: "Cotizaciones de Empresa",
    desc: "Gestionar cotizaciones y tipos de cambio",
    icon: TrendingUp,
    path: routes.cotizacionEmpresa,
    variant: "default"
  },
  {
    title:"Estados de Ánimo",
    desc:"Gestionar mensajes de estados de ánimo del sistema",
    icon: CheckCircle,
    path: routes.estadosAnimos,
    variant: "default"
  },
  {
    title:"Solicitudes Recargar Wallet",
    desc:"Gestionar solicitudes de recarga de wallets",
    icon: WalletMinimal,
    path: routes.solicitudesRecargasWallet,
    variant: "default"
  },
  {
    title:"Gestion de Planes",
    desc:"Gestionar planes y suscripciones",
    icon: WalletMinimal,
    path: `${routes.listadoPlanes}`,
    variant: "default"
  }
  
];
