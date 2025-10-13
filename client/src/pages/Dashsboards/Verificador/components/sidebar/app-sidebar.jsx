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
import {  NavSimple } from "./nav-projects";
import { NavVerificador } from "./nav-user";
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
      title: "Gestión de Solicitudes",
      icon: Users,
      items: [
        {
          title: "Solicitudes Asignadas",
          url: "/verificador/solicitudes-cuenta",
        },
      ],
    },
  ],
  quickAccess: [
    {
      name: "Dashboard Principal",
      url: "/verificador",
      icon: Activity,
    },
  ],
};



export function AppSidebarVerificador({ ...props }) {
  const user = useAuthStore((state) => state.user);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavVerificador user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMainSuperAdmin items={superAdminData.navigation} />
        <NavSimple items={superAdminData.quickAccess} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
