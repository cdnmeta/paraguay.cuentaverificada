import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  CreditCard,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { obtenerSemaforoFinanciero, eliminarMovimientoSemaforo } from '@/apis/semaforoFinanciero.api';
import TablaSemaforoMovimientos from '../components/TablaSemaforoMovimientos';

// Datos simulados basados en el JSON proporcionado


export default function SemaforoFinancieroPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, movimientoId: null, titulo: '' });

  useEffect(() => {
    cargarDatosSemaforo();
  }, []);

  const cargarDatosSemaforo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await obtenerSemaforoFinanciero();
      setData(response.data);
      setUltimaActualizacion(new Date());
      toast.success('Datos actualizados correctamente');
    } catch (err) {
      console.error('Error al cargar semáforo financiero:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos del semáforo financiero');
      toast.error('Error al cargar los datos del semáforo financiero');
      
      // En caso de error, usar datos simulados como fallback (opcional)
      setUltimaActualizacion(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar movimientos
  const handleEditMovimiento = (id) => {
    navigate(`/semaforo-financiero/editar/${id}`);
  };

  const handleDeleteMovimiento = (id, titulo = '') => {
    setDeleteDialog({ open: true, movimientoId: id, titulo });
  };

  const confirmarEliminarMovimiento = async () => {
    if (!deleteDialog.movimientoId) return;

    try {
      await eliminarMovimientoSemaforo(deleteDialog.movimientoId);
      toast.success('Movimiento eliminado exitosamente');
      // Recargar datos después de eliminar
      cargarDatosSemaforo();
    } catch (error) {
      console.error('Error al eliminar movimiento:', error);
      toast.error('Error al eliminar el movimiento');
    } finally {
      setDeleteDialog({ open: false, movimientoId: null, titulo: '' });
    }
  };

  const cancelarEliminarMovimiento = () => {
    setDeleteDialog({ open: false, movimientoId: null, titulo: '' });
  };

  // Funciones helper
  const formatMoney = (amount, moneda) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '0';
    
    const formatter = new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: moneda?.toLowerCase().includes('guaraní') || moneda?.toLowerCase().includes('guarani') ? 'PYG' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  };

  const getTipoMovimientoLabel = (tipo) => {
    switch (tipo) {
      case 1: return 'Ingreso Fijo';
      case 2: return 'Ingreso Ocasional';
      case 3: return 'Egreso Fijo';
      case 4: return 'Egreso Ocasional';
      case 5: return 'Por Pagar';
      case 6: return 'Por Cobrar';
      default: return 'Desconocido';
    }
  };

  const getTipoMovimientoIcon = (tipo) => {
    switch (tipo) {
      case 1: return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 2: return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 3: return <ArrowDownLeft className="w-4 h-4 text-red-600" />;
      case 4: return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 5: return <CreditCard className="w-4 h-4 text-orange-600" />;
      case 6: return <Banknote className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getMovimientosPorTipo = (movimientos, tipo) => {
    return movimientos.filter(mov => mov.tipo_movimiento === tipo);
  };

  const getSaldoColor = (saldo) => {
    if (saldo > 0) return 'text-green-600';
    if (saldo < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Cargando semáforo financiero...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Error al cargar datos
            </h3>
            <p className="text-muted-foreground mb-4">
              {error}
            </p>
            <button
              onClick={cargarDatosSemaforo}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Semáforo Financiero</h1>
          <p className="text-muted-foreground">
            Visualiza el estado de tus finanzas por moneda y tipo de movimiento
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No hay datos financieros
            </h3>
            <p className="text-muted-foreground mb-4">
              Aún no tienes movimientos registrados en tu semáforo financiero.
              Comienza agregando tus ingresos y gastos para ver un resumen completo.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/semaforo-financiero/nuevo')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Movimiento
              </Button>
              <Button
                onClick={cargarDatosSemaforo}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Actualizar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-white shadow border rounded-2xl p-6 max-w-7xl mx-auto">
      <div className="  mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Semáforo Financiero</h1>
          <p className="text-muted-foreground">
            Visualiza el estado de tus finanzas por moneda y tipo de movimiento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate('/semaforo-financiero/nuevo')}
            className="flex items-center gap-2"
            variant="default"
          >
            <Plus className="h-4 w-4" />
            Nuevo Movimiento
          </Button>
          <Button
            onClick={cargarDatosSemaforo}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Cargando...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Actualizar
              </>
            )}
          </Button>
        </div>
      </div>

      {ultimaActualizacion && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Última actualización: {ultimaActualizacion.toLocaleDateString()} a las {ultimaActualizacion.toLocaleTimeString()}
          </p>
        </div>
      )}

            {data.map((monedaData) => (
        <div key={monedaData.id_moneda} className="mb-8">
          {/* Header por Moneda */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              {monedaData.moneda}
            </h2>

            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Ingresos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingreso Fijo</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatMoney(monedaData.ingreso_fijo, monedaData.moneda)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingreso Ocasional</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {formatMoney(monedaData.ingreso_ocasional, monedaData.moneda)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Egreso Fijo</CardTitle>
                  <ArrowDownLeft className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatMoney(monedaData.egreso_fijo, monedaData.moneda)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Egreso Ocasional</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {formatMoney(monedaData.egreso_ocasional, monedaData.moneda)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Por Cobrar (Cobrados)</CardTitle>
                  <Banknote className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatMoney(monedaData.ingresos_por_cobrar_cobrados, monedaData.moneda)}
                  </div>
                </CardContent>
              </Card>

              

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Por Pagar (Pagados)</CardTitle>
                  <CreditCard className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatMoney(monedaData.egresos_por_pagar_pagados, monedaData.moneda)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo Mensual</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getSaldoColor(monedaData.saldo_mensual)}`}>
                    {formatMoney(monedaData.saldo_mensual, monedaData.moneda)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo Diario</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getSaldoColor(monedaData.saldo_diario)}`}>
                    {formatMoney(monedaData.saldo_diario, monedaData.moneda)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerta de Estado Financiero */}
            <Alert className={`mb-6 ${
              monedaData.saldo_mensual > 0 
                ? 'border-green-200 bg-green-50 text-green-800' 
                : monedaData.saldo_mensual < 0 
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-yellow-200 bg-yellow-50 text-yellow-800'
            }`}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {monedaData.saldo_mensual > 0 
                  ? `✅ Estado financiero saludable en ${monedaData.moneda}. Saldo positivo de ${formatMoney(monedaData.saldo_mensual, monedaData.moneda)}.`
                  : monedaData.saldo_mensual < 0
                    ? `⚠️ Déficit financiero en ${monedaData.moneda}. Necesitas cubrir ${formatMoney(Math.abs(monedaData.saldo_mensual), monedaData.moneda)}.`
                    : `⚖️ Balance neutro en ${monedaData.moneda}. Ingresos y egresos están equilibrados.`
                }
              </AlertDescription>
            </Alert>

            {/* Tabs de Movimientos */}
            <Tabs defaultValue="1" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-5">
                <TabsTrigger value="1" className="text-xs lg:text-sm">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  I. Fijo
                </TabsTrigger>
                <TabsTrigger value="2" className="text-xs lg:text-sm">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  I. Ocasional
                </TabsTrigger>
                <TabsTrigger value="3" className="text-xs lg:text-sm">
                  <ArrowDownLeft className="w-3 h-3 mr-1" />
                  E. Fijo
                </TabsTrigger>
                <TabsTrigger value="4" className="text-xs lg:text-sm">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  E. Ocasional
                </TabsTrigger>
                <TabsTrigger value="5" className="text-xs lg:text-sm">
                  <CreditCard className="w-3 h-3 mr-1" />
                  Por Pagar
                </TabsTrigger>
                <TabsTrigger value="6" className="text-xs lg:text-sm">
                  <Banknote className="w-3 h-3 mr-1" />
                  Por Cobrar
                </TabsTrigger>
              </TabsList>

              {[1, 2, 3, 4, 5, 6].map((tipoMovimiento) => (
                <TabsContent key={tipoMovimiento} value={tipoMovimiento.toString()}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getTipoMovimientoIcon(tipoMovimiento)}
                        {getTipoMovimientoLabel(tipoMovimiento)} - {monedaData.moneda}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getMovimientosPorTipo(monedaData.movimientos, tipoMovimiento).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No hay movimientos de tipo "{getTipoMovimientoLabel(tipoMovimiento)}" en {monedaData.moneda}</p>
                        </div>
                      ) : (
                        <TablaSemaforoMovimientos
                          movimientos={getMovimientosPorTipo(monedaData.movimientos, tipoMovimiento)}
                          moneda={monedaData.moneda}
                          onEdit={handleEditMovimiento}
                          onDelete={handleDeleteMovimiento}
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      ))}

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && cancelarEliminarMovimiento()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el movimiento{' '}
              <span className="font-semibold">"{deleteDialog.titulo}"</span> del semáforo financiero.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelarEliminarMovimiento}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmarEliminarMovimiento}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
