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
  NotebookTabs 
} from "lucide-react"

import { NavMain } from "@/components/layouts/DashboardLayoutApp/sidebar/nav-main"
import { NavUserProtegido } from "@/components/layouts/DashboardLayoutApp/sidebar/nav-projects"
import { NavUser } from "@/components/layouts/DashboardLayoutApp/sidebar/nav-user"
import { TeamSwitcher } from "@/components/layouts/DashboardLayoutApp/sidebar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/hooks/useAuthStorge"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  projects: [
    {
      name: "Mi Panel",
      url: "/panel",
      icon: Home,
    },
    {
      name: "Mi Cuenta",
      url: "/mi-cuenta",
      icon: UserCog,
    },
    {
      name: "Semaforo Financiero",
      url: "/semaforo-financiero",
      icon: PieChart,
    },
    {
      name: "Donde lo Guardé?",
      url: "/donde-lo-guarde",
      icon: NotebookTabs  ,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const user = useAuthStore((state) => state.user);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
         <NavUser user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavUserProtegido projects={data.projects} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
