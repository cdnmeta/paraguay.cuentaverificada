import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, ArrowRight, RefreshCw } from 'lucide-react';
import { obtenerWalletsDelUsuario } from '@/apis/wallets.api';
import { toast } from 'sonner';
import { routes } from '../config/routes';
import LoadingSpinner from '@/components/customs/loaders/LoadingSpinner';

const WalletSelectionPage = () => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatMoney = (amount, currency = 'PYG') => {
    return `${amount.toLocaleString('es-PY')} ${currency}`;
  };

  const loadWallets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await obtenerWalletsDelUsuario();
      const walletsData = response.data;
      
      // Si no hay wallets, quedarse en la página para mostrar opción de recarga
      if (!walletsData || walletsData.length === 0) {
        setWallets([]);
        return;
      }

      /* // Si solo hay una wallet, ir directamente a ella
      if (walletsData.length === 1) {
        navigate(`/${routes.walletDashboard(walletsData[0].id)}`);
        return;
      } */

      // Si hay múltiples wallets, mostrarlas para selección
      setWallets(walletsData);
    } catch (error) {
      console.error('Error al cargar wallets:', error);
      toast.error('Error al cargar las billeteras');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleSelectWallet = (walletId) => {
    navigate(`/${routes.walletDashboard(walletId)}`);
  };

  const handleRecargarWallet = () => {
    navigate(`/${routes.solicitarRecarga}`);
  };

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-foreground text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full">
              <Wallet className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Mis Billeteras
          </h1>
          <p>
            Selecciona una billetera para ver su dashboard
          </p>
        </div>

        {/* Wallets List */}
        {wallets.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wallets.map((wallet) => (
              <Card
                key={wallet.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-green-300"
                onClick={() => handleSelectWallet(wallet.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      {wallet.nombre || wallet.sigla_iso}
                    </CardTitle>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Saldo Disponible</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatMoney(wallet.saldo, wallet.sigla_iso)}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-yellow-50 rounded">
                        <p className="text-xs text-yellow-600">Pendientes</p>
                        <p className="font-semibold text-yellow-800">
                          {wallet.cantidad_mov_pend_verificacion || 0}
                        </p>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <p className="text-xs text-green-600">Verificados</p>
                        <p className="font-semibold text-green-800">
                          {wallet.cantidad_mov_verificados || 0}
                        </p>
                      </div>
                      <div className="p-2 bg-red-50 rounded">
                        <p className="text-xs text-red-600">Rechazados</p>
                        <p className="font-semibold text-red-800">
                          {wallet.cantidad_mov_rechazados || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // No wallets available - show recharge option
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="max-w-md w-full text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-6 bg-gray-100 rounded-full">
                    <Wallet className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                <CardTitle className="text-xl text-gray-700">
                  No tienes billeteras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  No tienes billeteras asociadas a tu cuenta.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default WalletSelectionPage;