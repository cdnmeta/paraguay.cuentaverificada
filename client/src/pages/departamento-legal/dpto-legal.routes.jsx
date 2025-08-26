import React from "react";
import DashboardDptoLegal from "./DashboardDptoLegal";
import { Route } from "react-router-dom";
import AprobacionPagosComercio from "../AprobacionPagosComercio";
import AprobarcionComerciosPage from "../AprobarcionComerciosPage";

export const dtoLegalRoutes = {
    index: "departamento-legal",
    aprobacionPagoComercio: "aprobacion-pago-comercio",
    aprobacionComercio: "aprobacion-comercio",
};


export default function DptoLegalRoutes() {
  return (
    <>
      <Route index element={<DashboardDptoLegal />} />
      <Route
        path={dtoLegalRoutes.aprobacionPagoComercio}
        element={<AprobacionPagosComercio />}
      />
      <Route
        path={dtoLegalRoutes.aprobacionComercio}
        element={<AprobarcionComerciosPage />}
      />
    </>
  );
}
