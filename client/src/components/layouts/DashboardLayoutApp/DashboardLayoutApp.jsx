import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@components/ui/sonner";
import Navbar1 from "../../navbars/Navbar1";
import { Book, Menu, Sunset, Trees, Zap } from "lucide-react";
import { PROTECTED_ROUTES } from "@/utils/routes.routes";
import Navbar from "../../navbars/Navbar";
import { useAuthStore } from "@/hooks/useAuthStorge";
import AlertCambioDeRolEmpresa from "../../customs/AlertCambioDeRolEmpresa";
//import './dashboard-background.css';

const navbar = {
  logo: {
    url: PROTECTED_ROUTES.dashboard,
    alt: "logo-cuenta-verificada",
  },
  menu: [
    {
      title: "Products",
      url: "#",
      items: [
        {
          title: "Blog",
          description: "The latest industry news, updates, and info",
          icon: <Book className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Company",
          description: "Our mission is to innovate and empower the world",
          icon: <Trees className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Careers",
          description: "Browse job listing and discover our workspace",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Support",
          description:
            "Get in touch with our support team or visit our community forums",
          icon: <Zap className="size-5 shrink-0" />,
          url: "#",
        },
      ],
    },
    {
      title: "MarketPlace",
      url: "#",
    },
  ],
  auth: {
    login: { title: "Login", url: "#" },
    signup: { title: "Sign up", url: "#" },
  },
};

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layouts/DashboardLayoutApp/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

export default function DashboardApp({ children }) {
  const user = useAuthStore((state) => state.user);
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="relative z-10">
          <header className="bg-green-500 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
            <Navbar />
          </header>

          {/* Contenido principal */}
          <main className="flex-1 p-4">
            <div className="border shadow-2xl rounded-xl min-h-full p-6">
              {children ? children : <Outlet />}
            </div>
          </main>

          {/* Footer */}
          <footer className="dashboard-footer w-full text-sm text-center py-4">
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} Cuenta Verificada
            </p>
          </footer>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="top-right" />
      <AlertCambioDeRolEmpresa user={user} />
    </>
  );
}
