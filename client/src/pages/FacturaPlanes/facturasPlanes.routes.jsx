import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import FacturaPlanesPage from './pages/FacturaPlanesPage';
import GananciasFacturaPage from './pages/GananciasFacturaPage';
import Spinner from '@/components/customs/loaders/LoadingSpinner';
import { FACTURAS_PLANES_ROUTES } from './config/routes';

export function FacturasPlanesRoutes() {
  return (
    <>
      <Route 
        path={FACTURAS_PLANES_ROUTES.facturar} 
        element={
          <Suspense fallback={<Spinner />}>
            <FacturaPlanesPage />
          </Suspense>
        } 
      />
      <Route 
        path={FACTURAS_PLANES_ROUTES.ganancias} 
        element={
          <Suspense fallback={<Spinner />}>
            <GananciasFacturaPage />
          </Suspense>
        } 
      />
    </>
  );
}