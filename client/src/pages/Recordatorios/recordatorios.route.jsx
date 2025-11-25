import React from 'react'
import { Route } from 'react-router-dom'
import { routes } from './config/routes'
import RecordatorioFormPage from './pages/RecordatorioFormPage'
import RecordatoriosPage from './pages/RecordatoriosPage'
export default function RecordatoriosRoutes() {
  return (
   <>
    <Route path={`${routes.index}`} element={<RecordatoriosPage />} />
    <Route path={`${routes.crear}`} element={<RecordatorioFormPage />} />
    <Route path={`${routes.editar(":id")}`} element={<RecordatorioFormPage />} />
   </>
  )
}
