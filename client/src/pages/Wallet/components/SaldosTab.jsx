import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, TrendingDown, CheckCircle, Clock, DollarSign } from 'lucide-react';

const SaldosTab = ({ walletData }) => {
  const movimientos = walletData?.movimientos || [];

  const formatMoney = (amount, currency = 'PYG') => {
    return `${amount.toLocaleString('es-PY')} ${currency}`;
  };

  const getEstadisticasMovimientos = () => {
    const totalIngresos = movimientos
      .filter(mov => mov.id_tipo_movimiento === 1)
      .reduce((total, mov) => total + mov.monto, 0);
    
    const totalEgresos = movimientos
      .filter(mov => mov.id_tipo_movimiento !== 1)
      .reduce((total, mov) => total + mov.monto, 0);

    const movimientosVerificados = movimientos.filter(mov => mov.descripcion_estado === 'Verificado');
    const movimientosPendientes = movimientos.filter(mov => mov.descripcion_estado === 'Pendiente');
    const movimientosRechazados = movimientos.filter(mov => mov.descripcion_estado === 'Rechazado');

    return {
      totalIngresos,
      totalEgresos,
      movimientosVerificados: movimientosVerificados.length,
      movimientosPendientes: movimientosPendientes.length,
      movimientosRechazados: movimientosRechazados.length,
      totalMovimientos: movimientos.length
    };
  };

  const estadisticas = getEstadisticasMovimientos();

  return (
    <div className="space-y-6">
      {/* Información del Saldo Principal */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-foreground">
                  Saldo Actual
                </CardTitle>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatMoney(walletData?.saldo || 0, walletData?.sigla_iso)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Moneda: {walletData?.moneda || 'No especificada'}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas de Movimientos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Ingresos</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatMoney(estadisticas.totalIngresos, walletData?.sigla_iso)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-full dark:bg-red-900">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Egresos</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {formatMoney(estadisticas.totalEgresos, walletData?.sigla_iso)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Verificados</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {estadisticas.movimientosVerificados}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-full dark:bg-yellow-900">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                  {estadisticas.movimientosPendientes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Resumen de la Cuenta</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Estado de Movimientos</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total de movimientos:</span>
                  <Badge variant="secondary">{estadisticas.totalMovimientos}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Verificados:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {estadisticas.movimientosVerificados}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Pendientes:</span>
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                    {estadisticas.movimientosPendientes}
                  </Badge>
                </div>
                {estadisticas.movimientosRechazados > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Rechazados:</span>
                    <Badge variant="default" className="bg-red-100 text-red-800">
                      {estadisticas.movimientosRechazados}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Información de la Wallet</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">ID de la Wallet:</span>
                  <span className="font-mono text-sm">{walletData?.id_wallet}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Moneda:</span>
                  <span className="font-medium">{walletData?.moneda} ({walletData?.sigla_iso})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">ID Moneda:</span>
                  <span className="font-mono text-sm">{walletData?.id_moneda}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaldosTab;