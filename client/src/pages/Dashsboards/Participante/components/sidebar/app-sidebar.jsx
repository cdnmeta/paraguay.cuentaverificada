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

import { NavMain } from "./nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { NavUserDepartamentoLegal } from "./nav-user";

// Datos específicos para SuperAdmin
const superAdminData = {
  navigation: [
  ],
  quickAccess: [
    {
      name: "Dashboard Principal",
      url: "/admin",
      icon: Activity,
    },
  ],
};



export function AppSidebarParticipantes({ ...props }) {
  const user = useAuthStore((state) => state.user);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUserDepartamentoLegal user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={superAdminData.navigation} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
