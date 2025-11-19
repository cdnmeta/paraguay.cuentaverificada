import { useAuthStore } from '@/hooks/useAuthStorge';
import React from 'react'
import { BASE_URL } from './config/routes';
import NavBarCustom1 from '@/components/navbars/NavBarCustom1';
import { Link, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import AlertCambioDeRolEmpresa from '@/components/customs/AlertCambioDeRolEmpresa';
import LogoCuentaVerificada from '@/components/customs/LogoCuentaVerifaca';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebarParticipantes } from './components/sidebar/app-sidebar';
import { AlertDialogGlobal } from '@/components/customs/AlertDialogGlobal';
import Navbar from '@/components/navbars/Navbar';

export default function LayoutParticipante({children}) {
  const user = useAuthStore((state) => state.user);
   return (
    <SidebarProvider>
      <AppSidebarParticipantes />
      <SidebarInset>
        {/* Header con breadcrumb */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
            <Navbar urlBase={`/${BASE_URL}`} />
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
