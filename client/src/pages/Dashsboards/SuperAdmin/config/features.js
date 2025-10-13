import { ROUTE_BASE,routes } from "./routes";
import { 
  Users, 
  Building2, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  UserCheck,
  Store,
  BadgeCheck
} from "lucide-react";

export const seccionesFeatures = [
  {
    title: "Listado de Participantes",
    desc: "Buscar participantes registrados en el sistema",
    icon: Users,
    path: `${ROUTE_BASE}/participantes/listado`,
    variant: "default"
  },
  {
    title: "Listado de Usuarios",
    desc: "Ver y gestionar todos los usuarios del sistema",
    icon: UserCheck,
    path: routes.find(r=>r.key == "listadoUsuarios").path,
    variant: "default"
  },
  {
    title: "Listado Comercios",
    desc: "Buscar y gestionar comercios registrados",
    icon: Store,
    path: routes.find(r=>r.key == "listadoComercios").path,
    variant: "success"
  },
  {
    title: "Aprobación de Pago",
    desc: "Comercios pendientes de solicitudes de pago",
    icon: CreditCard,
    path: `${ROUTE_BASE}/solicitudes-pago`,
    variant: "warning"
  },
  {
    title: "Aprobación de Comercios",
    desc: "Aprobar comercios para verificación",
    icon: Building2,
    path: `${ROUTE_BASE}/aprobacion-comercios`,
    variant: "warning"
  },
  {
    title: "Solicitudes de Verificación de Cuentas",
    desc: "Revisar Solicitudes de Verificación de Cuentas",
    icon: BadgeCheck,
    path: `${ROUTE_BASE}/solicitudes-cuentas`,
    variant: "success"
  },
  {
    title: "Cotizaciones de Empresa",
    desc: "Gestionar cotizaciones y tipos de cambio",
    icon: TrendingUp,
    path: `${ROUTE_BASE}/cotizacion-empresa`,
    variant: "default"
  }
];
