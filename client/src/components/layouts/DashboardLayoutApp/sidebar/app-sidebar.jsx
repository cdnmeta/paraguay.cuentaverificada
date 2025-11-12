"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  UserCog,
  NotebookTabs, 
  WalletMinimal
} from "lucide-react"

import { NavUserProtegido } from "@/components/layouts/DashboardLayoutApp/sidebar/nav-projects"
import { NavUser } from "@/components/layouts/DashboardLayoutApp/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/hooks/useAuthStorge"

// rutas

import {routes as SemaforoFinancieroPage} from '@/pages/SemaforoFinanciero/config/routes'
import { PROTECTED_ROUTES } from "@/utils/routes.routes"
import {routes as DondeLoGuardeRoutes} from '@/pages/recordatoriosUsuarios/config/routes'
import {routes as WallestRoutes } from '@/pages/Wallet/config/routes'

// This is sample data.
const data = {
  projects: [
    {
      name: "Mi Panel",
      url: `${PROTECTED_ROUTES.dashboard}`,
      icon: Home,
      habilitado:() => true
    },
    {
      name: "Mi Cuenta",
      url: `${PROTECTED_ROUTES.misDatos}`,
      icon: UserCog,
      habilitado:() => true
    },
    {
      name: "Semaforo Financiero",
      url: `/${SemaforoFinancieroPage.index}`,
      icon: PieChart,
      habilitado:() => true
    },
    {
      name: "Donde lo Guardé?",
      url: `${DondeLoGuardeRoutes.index}`,
      icon: NotebookTabs  ,
      habilitado: () => true
    },
    {
      name: "Wallet",
      url: `${WallestRoutes.index}`,
      icon: WalletMinimal,
      habilitado: (data) => data?.user?.vfd === true  || false,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const user = useAuthStore((state) => state.user);
  const dataAnalizar = { user };
  const filteredProjects = data.projects.filter(project => {
    if (project.habilitado && typeof project.habilitado === 'function') {
      return project.habilitado(dataAnalizar);
    }
    return true;
  });
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
         <NavUser user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavUserProtegido projects={filteredProjects} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
