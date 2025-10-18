import React from 'react'
import { Link, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AlertDialogGlobal } from "@/components/customs/AlertDialogGlobal";
import { useAuthStore } from "@/hooks/useAuthStorge";
import AlertCambioDeRolEmpresa from "@/components/customs/AlertCambioDeRolEmpresa";
import { AppSidebarSoporte } from './components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import LogoCuentaVerificada from '@/components/customs/LogoCuentaVerifaca';

export default function LayoutSoporte({children}) {
   const user = useAuthStore((state) => state.user);
   
  return (
    <SidebarProvider>
      <AppSidebarSoporte />
      <SidebarInset>
        {/* Header con breadcrumb */}
        <header className="flex bg-green-500 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-white hover:bg-blue-600" />
            <Link to="/soporte">
              <LogoCuentaVerificada className="text-white" />
            </Link>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children ? children : <Outlet />}
        </main>
        
        <footer className="w-full text-sm text-center py-4">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Cuenta Verificada - Soporte Técnico
          </p>
        </footer>
      </SidebarInset>

      <Toaster position="top-right" />
      <AlertCambioDeRolEmpresa user={user} />
      <AlertDialogGlobal />
    </SidebarProvider>
  )
}