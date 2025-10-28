import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  obtenerSemaforoFinanciero,
  eliminarMovimientoSemaforo,
} from "@/apis/semaforoFinanciero.api";
import TablaSemaforoMovimientos from "../components/TablaSemaforoMovimientos";
import ConteoMovimientos from "../components/ConteoMovimientos";
import FormSemaforoFinancieroMovimiento from "../components/FormSemaforoFinancieroMovimiento";
import { TIPOS_MOVIMIENTOS } from "../utils/constanst";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCotizacionesEmpresa } from "@/apis/cotizacion-empresa.api";

// Datos simulados basados en el JSON proporcionado

export default function SemaforoFinancieroPage() {
  const [data, setData] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    movimientoId: null,
    titulo: "",
  });
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date().getMonth() + 1
  ); // mes actual
  const [formDialog, setFormDialog] = useState({
    open: false,
    tipoMovimiento: null,
    titulo: "",
  });

  useEffect(() => {
    cargarDatosSemaforo({ mes: mesSeleccionado });
  }, [mesSeleccionado]);

  const cargarDatosSemaforo = async (params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await obtenerSemaforoFinanciero(params);
      const responseCotizacion = await getCotizacionesEmpresa();
      
      setData(response.data);
      setCotizaciones(responseCotizacion.data || []);
      setUltimaActualizacion(new Date());
      toast.success("Datos actualizados correctamente");
    } catch (err) {
      console.error("Error al cargar semáforo financiero:", err);
      setError(
        err.response?.data?.message ||
          "Error al cargar los datos del semáforo financiero"
      );
      toast.error("Error al cargar los datos del semáforo financiero");

      // En caso de error, usar datos simulados como fallback (opcional)
      setUltimaActualizacion(new Date());
    } finally {
      setLoading(false);
    }
  };

  const meses = [...Array(12).keys()].map((key) =>
    new Date(0, key).toLocaleString("es", { month: "long" })
  );

  const confirmarEliminarMovimiento = async () => {
    if (!deleteDialog.movimientoId) return;

    try {
      await eliminarMovimientoSemaforo(deleteDialog.movimientoId);
      toast.success("Movimiento eliminado exitosamente");
      // Recargar datos después de eliminar
      cargarDatosSemaforo();
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
      toast.error("Error al eliminar el movimiento");
    } finally {
      setDeleteDialog({ open: false, movimientoId: null, titulo: "" });
    }
  };

  const cancelarEliminarMovimiento = () => {
    setDeleteDialog({ open: false, movimientoId: null, titulo: "" });
  };

  const abrirFormularioMovimiento = (tipoMovimiento, titulo) => {
    setFormDialog({ open: true, tipoMovimiento, titulo });
  };

  const cerrarFormularioMovimiento = () => {
    setFormDialog({ open: false, tipoMovimiento: null, titulo: "" });
  };

  const onFormularioSuccess = () => {
    cerrarFormularioMovimiento();
    cargarDatosSemaforo({ mes: mesSeleccionado });
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
            <p className="text-muted-foreground mb-4">{error}</p>
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
          <h1 className="text-3xl font-bold tracking-tight">
            Semáforo Financiero
          </h1>
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
              Comienza agregando tus ingresos y gastos para ver un resumen
              completo.
            </p>
            <div className="flex gap-3">
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
    <div className="">
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Semáforo Financiero
          </h1>
          <p className="text-muted-foreground">
            Visualiza el estado de tus finanzas por moneda y tipo de movimiento
          </p>
        </div>
      </div>

      {/* Grilla de acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Registrar Ingresos */}
        <div className="border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-4">Registrar Ingresos</h2>
            <div className="space-y-3">
              <Button
                onClick={() =>
                  abrirFormularioMovimiento(
                    TIPOS_MOVIMIENTOS.INGRESO_FIJO,
                    "Registrar Ingreso Fijo"
                  )
                }
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                Ingresos Fijos
              </Button>
              <Button
                onClick={() =>
                  abrirFormularioMovimiento(
                    TIPOS_MOVIMIENTOS.INGRESO_EXTRA,
                    "Registrar Ingreso Extra"
                  )
                }
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                Ingresos Extras
              </Button>
              <Button
                onClick={() =>
                  abrirFormularioMovimiento(
                    TIPOS_MOVIMIENTOS.CUENTAS_POR_COBRAR,
                    "Registrar Cuenta por Cobrar"
                  )
                }
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                Cuentas por Cobrar
              </Button>
            </div>
          </div>
        </div>

        {/* Registrar Gastos */}
        <div className="text-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold  mb-4">Registrar Gastos</h2>
            <div className="space-y-3">
              <Button
                onClick={() =>
                  abrirFormularioMovimiento(
                    TIPOS_MOVIMIENTOS.GASTO_FIJO,
                    "Registrar Gasto Fijo"
                  )
                }
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Gastos Fijos
              </Button>
              <Button
                onClick={() =>
                  abrirFormularioMovimiento(
                    TIPOS_MOVIMIENTOS.GASTO_EXTRA,
                    "Registrar Gasto Extra"
                  )
                }
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Gastos Extras
              </Button>
              <Button
                onClick={() =>
                  abrirFormularioMovimiento(
                    TIPOS_MOVIMIENTOS.CUENTAS_POR_PAGAR,
                    "Registrar Cuenta por Pagar"
                  )
                }
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Cuentas por Pagar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción adicionales */}
      <div className="flex items-center gap-3 mb-6">
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
        {ultimaActualizacion && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Última actualización: {ultimaActualizacion.toLocaleDateString()} a
              las {ultimaActualizacion.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {meses.length > 0 && (
        <div className="mb-4">
          <Select
            value={mesSeleccionado.toString()}
            onValueChange={(value) => setMesSeleccionado(Number(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes, index) => (
                <SelectItem key={index} value={(index + 1).toString()}>
                  {mes.charAt(0).toUpperCase() + mes.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sección de Conteos de Movimientos */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Resumen de Movimientos</h2>
          <p className="text-sm text-muted-foreground">
            Conteos por tipo de movimiento con abonos detallados
          </p>
        </div>
        <ConteoMovimientos
          data={data}
          cotizaciones={cotizaciones}
          afterDelete={() => {
            cargarDatosSemaforo();
          }}
        />
      </div>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && cancelarEliminarMovimiento()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              movimiento{" "}
              <span className="font-semibold">"{deleteDialog.titulo}"</span> del
              semáforo financiero.
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

      {/* Dialog del formulario de movimientos */}
      <Dialog
        open={formDialog.open}
        onOpenChange={(open) => !open && cerrarFormularioMovimiento()}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formDialog.titulo}</DialogTitle>
            <DialogDescription>
              Complete los datos del movimiento financiero
            </DialogDescription>
          </DialogHeader>
          <FormSemaforoFinancieroMovimiento
            tipoMovimiento={formDialog.tipoMovimiento}
            onSuccess={onFormularioSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
