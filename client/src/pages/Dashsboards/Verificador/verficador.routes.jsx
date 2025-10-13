import React from 'react'
import DashBoardVerificador from './DashBoardVerificador';
import { Route } from 'react-router-dom';
import ListadoSolicitudesCuentasPage from '@/pages/SolicitudesCuentas/ListadoSolicitudesCuentasPage';
import LayoutVerificador from './LayoutVerificador';
import { routes } from './config/route';

export default function VerificadorRoutes() {
  const opcionesHabilitar = {}
  const columnasHabilitar = {}

  const opcionesPage = {
    opcionesHabilitar,
    columnasHabilitar,
  } 
  return (
    <Route
    element={<LayoutVerificador />}
    >
      <Route path={routes.index} element={<DashBoardVerificador />} />
      <Route
        path={routes.solicitudes}
        element={<ListadoSolicitudesCuentasPage opcionesPage={opcionesPage} />}
      />
    </Route>
  );
}
