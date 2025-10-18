import React from 'react'
import DashBoardSoportePage from './DashBoardSoportePage';
import { Route, useParams } from 'react-router-dom';
import LayoutSoporte from './LayoutSoporte';
import { routes } from './config/route';
import MisTicketsPage from '@/pages/SoporteAyuda/pages/MisTicketsPage';
import ProtectedRoute from '@/utils/ProtectedRoute';
import TicketDetalle from '@/pages/SoporteAyuda/pages/TicketDetalle';
import ListadoMisTicketsPage from './page/ListadoMisTicketsPage';

const WrapperTicketDetalle = () => {
  const { id } = useParams(); // ✅ Aquí SÍ captura el :id correctamente
  return <TicketDetalle id_ticket={id} />;
}

export default function SoporteRoutes({user}) {
    const allowedGroupIds = [5]; // o calcula desde user
    const isAuthorized = (u) =>
    u && u.grupos?.some((g) => allowedGroupIds.includes(g.id));
  return (
    <Route element={
        <ProtectedRoute isAuthorized={isAuthorized(user)} redirectPath="/panel" >
            <LayoutSoporte />
        </ProtectedRoute>
    }>
      <Route path={routes.index} element={<DashBoardSoportePage />} />
      <Route path={routes.ticketsListado} element={<ListadoMisTicketsPage />} />
      <Route path={routes.ticketDetail(':id')} element={<WrapperTicketDetalle />} />
      <Route path={routes.configuracion} element={<div>Configuración - En desarrollo</div>} />
    </Route>
  );
}