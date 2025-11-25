import React from 'react';
import { Route, useParams } from 'react-router-dom';
import WalletDashboard from './pages/WalletDasboard';
import SolicitudRecargasWalletPage from './pages/SolicitudRecargasWalletPage';
import WalletSelectionPage from './pages/WalletSelectionPage';
import ForwardOnlyBoundary from '@/utils/ForwardOnlyBoundary';
import { routes } from './config/routes';


const WalletDashBoardWrapper = () => {
  const {id} = useParams();
  return <WalletDashboard id={id} />;
}

const WalletRoutes = () => {
  return (
    <>
      <Route path={`/${routes.index}`} element={<WalletSelectionPage />} />
      <Route 
        path={`/${routes.walletDashboard(':id')}`} 
        element={
          <WalletDashBoardWrapper />
        } 
      />
      <Route
        path={`/${routes.solicitarRecarga(':id')}`}
        element={<SolicitudRecargasWalletPage />}
      />
    </>
  );
};

export default WalletRoutes;