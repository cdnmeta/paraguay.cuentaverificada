import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { routes,BASE_URL } from './config/routes'
import SemaforoFinancieroPage from './pages/SemaforoFinancieroPage'
import SemaforoFinancieroMovimientosPage from './pages/SemaforoFinancieroMovimientosPage'

export default function SemaforoFinancieroRoutes() {
  return (
    <Route>
      <Route path={routes.index} element={<SemaforoFinancieroPage />} />
      <Route path={routes.crear} element={<SemaforoFinancieroMovimientosPage />} />
      <Route path={routes.editar()} element={<SemaforoFinancieroMovimientosPage />} />
    </Route>
  )
}
