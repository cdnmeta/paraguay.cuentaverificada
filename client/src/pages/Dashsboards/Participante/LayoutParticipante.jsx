import { useAuthStore } from '@/hooks/useAuthStorge';
import React from 'react'
import { ROUTE_BASE } from './config/features';
import NavBarCustom1 from '@/components/navbars/NavBarCustom1';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import AlertCambioDeRolEmpresa from '@/components/customs/AlertCambioDeRolEmpresa';

export default function LayoutParticipante({children}) {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] relative">
      {/* Fondo galáctico (fondo absoluto detrás del layout) */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/img/fondo-planeta.jpg')" }}
        aria-hidden="true"
      />

      {/* Header sticky */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <NavBarCustom1 urlPanel={`${ROUTE_BASE}`}/>
      </header>

      {/* Contenido principal */}
      <main className="relative w-full px-4 py-6">
        {children ? children : <Outlet />}
      </main>


      <Toaster position="top-right" />
      <AlertCambioDeRolEmpresa user={user} />
    </div>
  )
}
