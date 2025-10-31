import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DollarSign,
  Calendar,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  obtenerSemaforoFinanciero,
  eliminarMovimientoSemaforo,
} from "@/apis/semaforoFinanciero.api";
import TablaSemaforoMovimientos from "../components/TablaSemaforoMovimientos";
import ConteoMovimientos from "../components/ConteoMovimientos";
import { getCotizacionesEmpresa } from "@/apis/cotizacion-empresa.api";

// Constantes
const ID_MONEDA_GUARANIES = 2; // ID para guaraníes (PYG) - cambiar aquí si es necesario

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

  // Obtener cotizaciones donde el destino sea guaraníes
  const getCotizacionesAGuaranies = () => {
    return cotizaciones.filter(cot => cot.id_moneda_destino === ID_MONEDA_GUARANIES);
  };

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
            Controla tus finanzas como un profesional
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
          {/* Sección de Cotizaciones - Listado simple */}
          
          
          <h1 className="text-3xl font-bold tracking-tight">
            Semáforo Financiero
          </h1>
          <p className="text-muted-foreground">
            Controla tus finanzas como un profesional
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Cotizacion</h3>
            </div>
            
            {getCotizacionesAGuaranies().length > 0 ? (
              <div className="flex flex-wrap gap-4 text-sm">
                {getCotizacionesAGuaranies().map((cotizacion) => (
                  <div key={cotizacion.id} className="flex items-center gap-2 text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {cotizacion.moneda_origen_iso}
                    </Badge>
                    <span>₲{cotizacion.monto_venta?.toLocaleString() || 'N/A'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No hay cotizaciones disponibles</p>
            )}
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
    </div>
  );
}
