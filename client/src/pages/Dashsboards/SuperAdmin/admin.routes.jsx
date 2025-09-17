// src/pages/SuperAdmin/admin.routes.jsx
import React, { lazy, Suspense } from "react";
import { Form, Route, useParams } from "react-router-dom";
import AdminLayout from "./LayoutSuperAdmin";
import { ROUTE_BASE } from "./config/routes";
import Spinner from "@/components/customs/loaders/LoadingSpinner"; // cualquier loader visual
import ProtectedRoute from "@/utils/ProtectedRoute";
import AgregarParticipantePage from "./pages/AgregarParticipantePage";
import ListadoComercioPages from "./pages/ListadoComerciosPages";
import AprobacionPagosComercio from "@/pages/AprobacionPagosComercio";
import AprobarcionComerciosPage from "@/pages/AprobarcionComerciosPage";
import ListadoSolicitudesCuentasPage from "@/pages/SolicitudesCuentas/ListadoSolicitudesCuentasPage";
import ListadoParticipantesPage from "@/pages/Participantes/ListadoParticipantesPage";
import { UsuariosRoutes } from "@/pages/Usuarios/usuarios.routes";
import FormCotizacion from '@/pages/cotizacionesEmpresa/components/FormCotizacion';
import CotizacionEmpresaPage from "@/pages/cotizacionesEmpresa/page/CotizacionEmpresaPage";
const DashBoardSuperAdmin = lazy(() => import("./DashBoardSuperAdmin"));


export function SuperAdminRoutes({ user }) {
  const isAuthorized = (u) => u?.is_super_admin === true;


  const opcionesPageListaSolicitudes =  {
    tipoLista: 'todas',
  }
    

  return (
    <Route
      path={ROUTE_BASE}
      element={
        <ProtectedRoute isAuthorized={isAuthorized(user)} redirectPath="/" >
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      {/* index/dashboard */}
      <Route
        index
        element={
          <Suspense fallback={<Spinner />}>
            <DashBoardSuperAdmin />
          </Suspense>
        }
      />

      {/* Rutas específicas transformadas desde la configuración */}
    
     
      {/* Gestión de Participantes */}
      <Route
        path="participantes/listado"
        element={
          <Suspense fallback={<Spinner />}>
            <ListadoParticipantesPage />
          </Suspense>
        }
      />
      <Route
        path="participantes"
        element={<AgregarParticipantePage />}
      />
      <Route
        path="comercios/listado"
        element={<ListadoComercioPages />}
      />
      <Route
        path="solicitudes-pago"
        element={<AprobacionPagosComercio />}
      />
      <Route
        path="aprovacion-comercios"
        element={<AprobarcionComerciosPage/>}
      />
      <Route
        path="solicitudes-cuentas"
        element={<ListadoSolicitudesCuentasPage opcionesPage={opcionesPageListaSolicitudes} />}
      />
      <Route 
      path="cotizacion-empresa"
      element={(<CotizacionEmpresaPage />)}
      />
      
      {/*usuarios rutas*/}
      {UsuariosRoutes({user})}

    </Route>
  );
}
