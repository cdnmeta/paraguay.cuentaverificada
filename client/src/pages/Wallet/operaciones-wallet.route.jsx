import React from 'react'
import { Route } from 'react-router-dom'
import SolicitudesRecargasPage from './pages/SolicitudesRecargasPage'

export default function OperacionesWalletRoute({user}) {
  return (
    <>
        <Route path="solicitudes-recargas-wallet" element={<SolicitudesRecargasPage />} />
    </>
  )
}
