import React, { use } from "react";
import { Link, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AlertDialogGlobal } from "@/components/customs/AlertDialogGlobal";
import { useAuthStore } from "@/hooks/useAuthStorge";
import AlertCambioDeRolEmpresa from "@/components/customs/AlertCambioDeRolEmpresa";
import { BASE_URL } from "./config/routes";
import { AppSidebarDepartamentoLegal } from "./components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import LogoCuentaVerificada from "@/components/customs/LogoCuentaVerifaca";
export default function LayoutDepartamentoLegal({ children }) {
  const user = useAuthStore((state) => state.user);
   return (
    <SidebarProvider>
      <AppSidebarDepartamentoLegal />
      <SidebarInset>
        {/* Header con breadcrumb */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Link to={BASE_URL}>
              <LogoCuentaVerificada />
            </Link>
          </div>
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
