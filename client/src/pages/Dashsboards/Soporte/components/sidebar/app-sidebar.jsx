"use client";

import * as React from "react";
import {
  Headphones,
  Ticket,
  Settings,
  BarChart3,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
} from "lucide-react";

import { NavMainSoporte } from "./nav-main";
import { NavSimple } from "./nav-projects";
import { NavSoporte } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { NavUser } from "@/components/customs/navs/nav-user";
import {routes as SoporteRoutes,URL_BASE} from '@/pages/Dashsboards/Soporte/config/route'

// Datos específicos para Soporte
const soporteData = {
  navigation: [
    {
      title: "Gestión de Tickets",
      icon: Ticket,
      items: [
        {
          title: "Mis Tickets Asignados",
          url: SoporteRoutes.ticketsListado,
          icon: MessageSquare,
        }
      ],
    },
  ],
  quickAccess: [
    {
      name: "Dashboard Principal",
      url: `/${URL_BASE}`,
      icon: BarChart3,
    },
  ],
};

export function AppSidebarSoporte({ ...props }) {
  const user = useAuthStore((state) => state.user);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMainSoporte items={soporteData.navigation} />
        <NavSimple items={soporteData.quickAccess} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}