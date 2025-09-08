// src/pages/SuperAdmin/admin.routes.jsx
import React, { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import { seccionesFeatures,ROUTE_BASE } from "./config/features";
import Spinner from "@/components/customs/loaders/LoadingSpinner"; // cualquier loader visual
import ProtectedRoute from "@/utils/ProtectedRoute";
import DashBoardParticipante from "./DashBoardParticipante";


const Layout = lazy(() => import("./LayoutParticipante"));

function matchByFeatureKey(key) {
  switch (key) {
    default:
      return null;
  }
}

export function ParticipantesRoutes({ user }) {
  const allowedGroupIds = [4]; // o calcula desde user
  const isAuthorized = (u) =>
    u && u.grupos?.some((g) => allowedGroupIds.includes(g.id));

  return (
    <Route
      path={ROUTE_BASE}
      element={
        <ProtectedRoute isAuthorized={isAuthorized(user)} redirectPath="/" >
          <Layout />
        </ProtectedRoute>
      }
    >
      {/* index/dashboard */}
      <Route
        index
        element={
          <Suspense fallback={<Spinner />}>
            <DashBoardParticipante />
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
