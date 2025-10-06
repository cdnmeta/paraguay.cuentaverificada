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
import { NavSingleDepartamentoLegal } from "./nav-projects";
import { NavUserSuperAdmin } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { BASE_URL, routes } from "@/pages/departamento-legal/config/routes";

// Datos específicos para SuperAdmin 
const items = {
  navigation: [
    {
      title: "Aprovacion Comercios",
      url: `${routes.aprobacionComercio}`,
      icon: Building2,
      items: [
        {
          title: "Aprobacion de Comercios",
          url: `${routes.aprobacionComercio}`,
        },
        {
          title: "Solicitudes de Pago",
          url: `${routes.aprobacionPagoComercio}`,
        },
        {
          title: "Aprobacion de Comercios",
          url: `${routes.aprobacionComercio}`,
        },
        
      ],
    },
  ],
  quiclyAccess: [
    {
      title: "Panel Principal",
      url: `${BASE_URL}`,
      icon: Building2,
    },
  ]
};



export function AppSidebarDepartamentoLegal({ ...props }) {
  const user = useAuthStore((state) => state.user);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUserSuperAdmin user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMainSuperAdmin items={items.navigation} />
        <NavSingleDepartamentoLegal items={items.quiclyAccess} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
