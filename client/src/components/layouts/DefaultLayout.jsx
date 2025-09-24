import React from 'react'
import { Outlet } from 'react-router-dom';
import { Toaster } from "@components/ui/sonner";
import { AlertDialogGlobal } from '@/components/customs/AlertDialogGlobal';


export default function DefaultLayout({children}) {
  
  return (
    <div className="relative min-h-screen px-4 overflow-hidden">
      {/* Fondo galáctico */}
      <div
        className="absolute inset-0 bg-cover bg-center "
        style={{ backgroundImage: "url('/img/fondo-planeta.jpg')" }}
        aria-hidden="true"
      />


      {/* Capa oscura encima del fondo */}
      {/* <div className="absolute inset-0 bg-black bg-opacity-90 -z-20" /> */}

      {/* Contenido */}
      <main className="relative min-h-screen z-0">
        {children ? children : <Outlet />}
      </main>
      <Toaster position="top-right" />
      <AlertDialogGlobal />
    </div>
  );
}
