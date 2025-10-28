import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { routes,BASE_URL } from './config/routes'
import SemaforoFinancieroPage from './pages/SemaforoFinancieroPage'


export default function SemaforoFinancieroRoutes() {
  return (
    <Route>
      <Route path={routes.index} element={<SemaforoFinancieroPage />} />
    </Route>
  )
}
