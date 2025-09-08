import React from "react";
import DashboardDptoLegal from "./DashboardDptoLegal";
import { Route } from "react-router-dom";
import AprobacionPagosComercio from "../AprobacionPagosComercio";
import AprobarcionComerciosPage from "../AprobarcionComerciosPage";
import ListadoSolicitudesCuentasPage from "../SolicitudesCuentas/ListadoSolicitudesCuentasPage";

export const dtoLegalRoutes = {
  index: "departamento-legal",
  aprobacionPagoComercio: "aprobacion-pago-comercio",
  aprobacionComercio: "aprobacion-comercio",
  aprobacionCuenta: "aprobacion-cuenta",
};

export default function DptoLegalRoutes() {

  const opcionesHabilitar = {
    aprobarSolicitudes: true,
    rechazarSolicitudes: true,
    generarTokenUsuario: true
  };
  const columnasHabilitar = {
    ver_columna_verificador: true
  }

  const opcionesPage = {
    opcionesHabilitar,
    columnasHabilitar,
    tipoLista: 'todas' // 'mis-solicitudes', 'todas'
  }

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
      <Route
        path={dtoLegalRoutes.aprobacionCuenta}
        element={<ListadoSolicitudesCuentasPage opcionesPage={opcionesPage} />}
      />
    </>
  );
}
