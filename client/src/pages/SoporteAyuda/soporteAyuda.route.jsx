import React from 'react'
import { routes, URL_BASE } from './config/routes'
import { Route, useParams } from 'react-router-dom'
import MisTicketsPage from './pages/MisTicketsPage'
import TicketDetalle from './pages/TicketDetalle'

const WrapperTicketDetalle = () => {
   const { id } = useParams(); // ✅ Aquí SÍ captura el :id correctamente
  return <TicketDetalle id_ticket={id} />;

}

export default function SoporteAyudaRoute() {
  return (
    <Route>
        <Route path={`/${routes.index}`} element={<MisTicketsPage />}/>
        <Route path={`/${routes.ticketDetalle(':id')}`} element={<WrapperTicketDetalle />}/>
    </Route>
  )
}
