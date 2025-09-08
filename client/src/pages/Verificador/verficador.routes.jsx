import React from 'react'
import DashBoardVerificador from './DashBoardVerificador';
import { Route } from 'react-router-dom';
import ListadoSolicitudesCuentasPage from '../SolicitudesCuentas/ListadoSolicitudesCuentasPage';
export const routes = {
    index: "verificador",
   solicitudes:"solicitudes-cuenta"
};
export default function VerificadorRoutes() {
  const opcionesHabilitar = {}
  const columnasHabilitar = {}

  const opcionesPage = {
    opcionesHabilitar,
    columnasHabilitar,
  } 
  return (
    <>
      <Route index element={<DashBoardVerificador />} />
      <Route
        path={routes.solicitudes}
        element={<ListadoSolicitudesCuentasPage opcionesPage={opcionesPage} />}
      />
      
    </>
  );
}
