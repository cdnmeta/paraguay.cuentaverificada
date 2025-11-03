import React from 'react'
import { Route } from 'react-router-dom'
import EstadosAnimosPage from './pages/EstadosAnimosPage'

export default function EstadosAnimosRoutes() {
  return (
    <>
      <Route path="estados-animos" element={<EstadosAnimosPage />} />
    </>
  )
}
