import React from 'react'
import { Route } from 'react-router-dom'
import MisFavoritosPage from './MisFavoritosPage'
import { routes } from './config/routes'

export default function FavoritosRoutes() {
  return (
    <>
      <Route path={routes.index} element={<MisFavoritosPage />} />
    </>
  )
}
