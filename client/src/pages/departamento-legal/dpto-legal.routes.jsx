import React from "react";
import DashboardDptoLegal from "./DashboardDptoLegal";
import { Route } from "react-router-dom";
import AprobacionPagosComercio from "../AprobacionPagosComercio";
import AprobarcionComerciosPage from "../AprobarcionComerciosPage";
import ListadoSolicitudesCuentasPage from "../SolicitudesCuentas/ListadoSolicitudesCuentasPage";
import LayoutDepartamentoLegal from "@/pages/departamento-legal/LayoutDepartamentoLegal";
import ProtectedRoute from "@/utils/ProtectedRoute";
import { verificarSesionYgrupoAdmitido } from "@/utils/auth";
import { BASE_URL, routes } from "./config/routes";


export default function DptoLegalRoutes({ user }) {
  const opcionesHabilitar = {
    aprobarSolicitudes: true,
    rechazarSolicitudes: true,
    generarTokenUsuario: true,
  };
  const columnasHabilitar = {
    ver_columna_verificador: true,
  };

  const opcionesPage = {
    opcionesHabilitar,
    columnasHabilitar,
    tipoLista: "todas", // 'mis-solicitudes', 'todas'
  };

  return (
    <Route
      element={
        <ProtectedRoute isAuthorized={verificarSesionYgrupoAdmitido(user, [1])}>
          {" "}
          <LayoutDepartamentoLegal />
        </ProtectedRoute>
      }
    >
      <Route path={BASE_URL} element={<DashboardDptoLegal />} />
      <Route
        path={routes.aprobacionPagoComercio}
        element={<AprobacionPagosComercio />}
      />
      <Route
        path={routes.aprobacionComercio}
        element={<AprobarcionComerciosPage />}
      />
      <Route
        path={routes.aprobacionCuenta}
        element={<ListadoSolicitudesCuentasPage opcionesPage={opcionesPage} />}
      />
    </Route>
  );
}
