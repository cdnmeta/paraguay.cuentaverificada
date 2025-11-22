import React from 'react'
import { Route } from 'react-router-dom'
import { routes } from './config/routes'
import MisSuscripcionesPage from './pages/MisSuscripcionesPage'

export default function SuscripcionesRoutes() {
  return (
    <>
        <Route path={`/${routes.MIS_SUSCRIPCIONES}`} element={<MisSuscripcionesPage />} />
    </>
  )
}
