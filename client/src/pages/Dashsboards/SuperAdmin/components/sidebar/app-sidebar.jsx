"use client";

import * as React from "react";
import {
  Shield,
  Users,
  Building2,
  FileText,
  Settings,
  BarChart3,
  CreditCard,
  Database,
  UserCheck,
  Activity,
  DollarSign,
} from "lucide-react";

import { NavMainSuperAdmin } from "./nav-main";
import { NavProjectsSuperAdmin } from "./nav-projects";
import { NavUserSuperAdmin } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/hooks/useAuthStorge";

// Datos específicos para SuperAdmin
const superAdminData = {
  navigation: [
    {
      title: "Gestión de Usuarios",
      url: "/admin/usuarios",
      icon: Users,
      items: [
        {
          title: "Todos los Usuarios",
          url: "/admin/usuarios/listado",
        },
        {
          title: "Registrar Usuario",
          url: "/admin/usuarios/registrar",
        },
      ],
    },
    {
      title: "Comercios",
      url: "/admin/comercios",
      icon: Building2,
      items: [
        {
          title: "Listado de Comercios",
          url: "/admin/comercios/listado",
        },
        {
          title: "Solicitudes de Pago",
          url: "/admin/solicitudes-pago",
        },
        {
          title: "Aprobacion de Comercios",
          url: "/admin/aprobacion-comercios",
        },
        
      ],
    },
    {
      title: "Participantes",
      url: "/admin/participantes",
      icon: Users,
      items: [
        {
          title: "Listado de Participantes",
          url: "/admin/participantes/listado",
        },
        {
          title: "Agregar Participante",
          url: "/admin/participantes",
        },
      ],
    },
    {
      title: "Ganancias y Facturas",
      icon: DollarSign,
      items: [
        {
          title: "Ganancias de Facturas",
          url: "/admin/facturas-ganancias",
        },
      ]
    },
    {
      title: "Planes y Suscripciones",
      url: "/admin/planes",
      icon: CreditCard,
    },
    {
      title: "Reportes y Analytics",
      url: "/admin/reportes",
      icon: BarChart3,
    },
  ],
  quickAccess: [
    {
      name: "Dashboard Principal",
      url: "/admin",
      icon: Activity,
    },
  ],
};



export function AppSidebarSuperAdmin({ ...props }) {
  const user = useAuthStore((state) => state.user);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUserSuperAdmin user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMainSuperAdmin items={superAdminData.navigation} />
        <NavProjectsSuperAdmin projects={superAdminData.quickAccess} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
