import React from 'react'
import { Link, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AlertDialogGlobal } from "@/components/customs/AlertDialogGlobal";
import { useAuthStore } from "@/hooks/useAuthStorge";
import AlertCambioDeRolEmpresa from "@/components/customs/AlertCambioDeRolEmpresa";
import NavBarCustom1 from '@/components/navbars/NavBarCustom1';
import { AppSidebarVerificador } from './components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import LogoCuentaVerificada from '@/components/customs/LogoCuentaVerifaca';
import Navbar from '@/components/navbars/Navbar';
import {URL_BASE} from '@/pages/Dashsboards/Verificador/config/route'
export default function LayoutVerificador({children}) {

   const user = useAuthStore((state) => state.user);
  return (
    <SidebarProvider>
      <AppSidebarVerificador />
      <SidebarInset>
        {/* Header con breadcrumb */}
        <header className="flex bg-green-500 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
          <Navbar urlBase={`/${URL_BASE}`} />
        </header>

        {/* Contenido principal */}
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children ? children : <Outlet />}
        </main>
        <footer className="w-full text-sm text-center py-4">
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} Cuenta Verificada
            </p>
          </footer>
      </SidebarInset>

      <Toaster position="top-right" />
      <AlertCambioDeRolEmpresa user={user} />
      <AlertDialogGlobal />
    </SidebarProvider>
  )
}
