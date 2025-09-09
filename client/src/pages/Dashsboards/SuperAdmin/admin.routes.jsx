// src/pages/SuperAdmin/admin.routes.jsx
import React, { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import AdminLayout from "./LayoutSuperAdmin";
import { seccionesFeatures,ROUTE_BASE } from "./config/features";
import Spinner from "@/components/customs/loaders/LoadingSpinner"; // cualquier loader visual
import ProtectedRoute from "@/utils/ProtectedRoute";
import CrearUsuariosPage from "./pages/CrearUsuariosPage";
import AgregarParticipantePage from "./pages/AgregarParticipantePage";

const DashBoardSuperAdmin = lazy(() => import("./DashBoardSuperAdmin"));

function matchByFeatureKey(key) {
  switch (key) {
    case "crearUsuario":
      return <CrearUsuariosPage />;
    case "registrarParticipante":
      return <AgregarParticipantePage />;
    default:
      return null;
  }
}

export function SuperAdminRoutes({ user }) {
  const isAuthorized = (u) => u.is_super_admin === true;

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

      {/* genera child routes desde la misma config */}
      {seccionesFeatures.map((f) => (
        <Route
          key={f.key}
          path={f.path.replace(`${ROUTE_BASE}/`, "")}
          element={
            <Suspense fallback={<Spinner />}>
              {matchByFeatureKey(f.key)}
            </Suspense>
          }
        />
      ))}
    </Route>
  );
}
