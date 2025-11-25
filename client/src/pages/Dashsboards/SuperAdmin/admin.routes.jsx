// src/pages/SuperAdmin/admin.routes.jsx
import React, { lazy, Suspense } from "react";
import { Form, Route } from "react-router-dom";
import AdminLayout from "./LayoutSuperAdmin";
import { ROUTE_BASE, routes } from "./config/routes";
import Spinner from "@/components/customs/loaders/LoadingSpinner"; // cualquier loader visual
import ProtectedRoute from "@/utils/ProtectedRoute";
import AgregarParticipantePage from "./pages/AgregarParticipantePage";
import ListadoComercioPages from "./pages/ListadoComerciosPages";
import AprobacionPagosComercio from "@/pages/AprobacionPagosComercio";
import AprobarcionComerciosPage from "@/pages/AprobarcionComerciosPage";
import ListadoSolicitudesCuentasPage from "@/pages/SolicitudesCuentas/ListadoSolicitudesCuentasPage";
import ListadoParticipantesPage from "@/pages/Participantes/ListadoParticipantesPage";
// Usuarios components
import FormUsuario from "@/pages/Usuarios/components/FormUsuarios";
import ListadoUsuariosPages from "@/pages/Usuarios/pages/ListadoUsuariosPages";
// FacturaPlanes components
import FacturaPlanesPage from "@/pages/FacturaPlanes/pages/FacturaPlanesPage";
import GananciasFacturaPage from "@/pages/FacturaPlanes/pages/GananciasFacturaPage";
// EstadosAnimos components
import EstadosAnimosPage from "@/pages/EstadosAnimos/pages/EstadosAnimosPage";
// Wallet components
import SolicitudesRecargasPage from "@/pages/Wallet/pages/SolicitudesRecargasPage";
// Cotización empresa
import FormCotizacion from "@/pages/cotizacionesEmpresa/components/FormCotizacion";
import CotizacionEmpresaPage from "@/pages/cotizacionesEmpresa/page/CotizacionEmpresaPage";
import { Wallet } from "lucide-react";
// Para usuarios - wrapper component
import { useParams } from "react-router-dom";
import PlanesListadoPage from "./pages/PlanesListadoPage";
import PlanesFormPage from "./pages/PlanesFormPage";
const DashBoardSuperAdmin = lazy(() => import("./DashBoardSuperAdmin"));

// Componente wrapper para capturar el ID de la ruta de usuarios
function EditarUsuarioWrapper() {
  const { id } = useParams();
  return (
    <Suspense fallback={<Spinner />}>
      <FormUsuario idUsuario={id} />
    </Suspense>
  );
}

export function SuperAdminRoutes({ user }) {
  const isAuthorized = (u) => u?.isa === true;

  const opcionesPageListaSolicitudes = {
    opcionesHabilitar: {
      aprobarSolicitudes: true,
      rechazarSolicitudes: true,
      generarTokenUsuario: true,
    },
    columnasHabilitar: {
      ver_columna_verificador: true,
    },
    tipoLista: "todas", // 'mis-solicitudes', 'todas'
  };

  return (
    <Route
      element={
        <ProtectedRoute isAuthorized={isAuthorized(user)} redirectPath="/">
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      {/* index/dashboard */}
      <Route
        path={ROUTE_BASE}
        element={
          <Suspense fallback={<Spinner />}>
            <DashBoardSuperAdmin />
          </Suspense>
        }
      />

      {/* Rutas específicas transformadas desde la configuración */}

      {/* Gestión de Participantes */}
      <Route
        path={routes.listadoParticipantes}
        element={
          <Suspense fallback={<Spinner />}>
            <ListadoParticipantesPage />
          </Suspense>
        }
      />
      <Route
        path={routes.registrarParticipante}
        element={<AgregarParticipantePage />}
      />
      <Route
        path={routes.listadoComercios}
        element={<ListadoComercioPages />}
      />
      <Route
        path={routes.aprobacionPagosComercio}
        element={<AprobacionPagosComercio />}
      />
      <Route
        path={routes.aprobacionComercios}
        element={<AprobarcionComerciosPage />}
      />
      <Route
        path={routes.listadoSolicitudesCuentas}
        element={
          <ListadoSolicitudesCuentasPage
            opcionesPage={opcionesPageListaSolicitudes}
          />
        }
      />
      <Route
        path={routes.cotizacionEmpresa}
        element={<CotizacionEmpresaPage />}
      />

      {/*
      Planes Routes */}

      <Route path={routes.listadoPlanes} element={<PlanesListadoPage />} />

      <Route path={routes.crearPlan} element={<PlanesFormPage />} />

      <Route path={routes.editarPlan(":id")} element={<PlanesFormPage />} />

      {/* Rutas de Facturas Planes */}
      <Route path={routes.facturarPlanes} element={<FacturaPlanesPage />} />

      <Route
        path={routes.gananciasFacturas}
        element={<GananciasFacturaPage />}
      />

      {/* Rutas de Usuarios */}
      <Route path={routes.registrarUsuarios} element={<FormUsuario />} />
      
      <Route path={routes.listadoUsuarios} element={<ListadoUsuariosPages />} />

      <Route
        path={routes.editarUsuario(":id")}
        element={<EditarUsuarioWrapper />}
      />

      {/* Estados de Ánimo */}
      <Route path={routes.estadosAnimos} element={<EstadosAnimosPage />} />

      {/* Wallet - Solicitudes Recargas */}
      <Route
        path={routes.solicitudesRecargasWallet}
        element={<SolicitudesRecargasPage />}
      />
    </Route>
  );
}
