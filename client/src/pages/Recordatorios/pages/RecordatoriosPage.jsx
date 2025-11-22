import recordatoriosAPI from "@/apis/recordatorios.api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TiposRecordatorios } from "../types/TiposRecordatorios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Bell,
  AlertCircle,
  Loader2,
} from "lucide-react";
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
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function RecordatoriosPage() {
  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const [eliminandoId, setEliminandoId] = useState(null);
  const [recordatorioAEliminar, setRecordatorioAEliminar] = useState(null);
  const navigate = useNavigate();

  const cargarRecordatorios = async () => {
    try {
      setLoading(true);
      const response = await recordatoriosAPI.obtenerMisRecordatorios({
        tipo_recordatorio: TiposRecordatorios.RECORDATORIO,
      });
      setRecordatorios(response.data || []);
    } catch (error) {
      console.error("Error al cargar recordatorios:", error);
      toast.error("Error al cargar los recordatorios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRecordatorios();
  }, []);

  const formatearFecha = (fecha) => {
    try {
      return format(parseISO(fecha), "dd MMM yyyy HH:mm", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  const obtenerEstadoRecordatorio = (recordatorio) => {
    const { id_estado, descripcion_estado, fecha_recordatorio } = recordatorio;
    const ahora = new Date();
    const fechaRec = new Date(fecha_recordatorio);
    const esVencido = fechaRec < ahora;
    
    // Mapeo de estados según el backend
    switch (id_estado) {
      case 1: // Pendiente
        if (esVencido) {
          return {
            texto: "Vencido",
            color: "bg-red-100 text-red-800 border-red-200",
            icono: <AlertCircle className="h-3 w-3" />,
          };
        } else {
          const diff = fechaRec - ahora;
          const horas = Math.floor(diff / (1000 * 60 * 60));
          
          if (horas <= 24) {
            return {
              texto: "Próximo",
              color: "bg-orange-100 text-orange-800 border-orange-200",
              icono: <Clock className="h-3 w-3" />,
            };
          } else {
            return {
              texto: descripcion_estado || "Pendiente",
              color: "bg-blue-100 text-blue-800 border-blue-200",
              icono: <Bell className="h-3 w-3" />,
            };
          }
        }
      case 2: // Completado
        return {
          texto: descripcion_estado || "Completado",
          color: "bg-green-100 text-green-800 border-green-200",
          icono: <Bell className="h-3 w-3" />,
        };
      case 3: // Archivado
        return {
          texto: descripcion_estado || "Archivado",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icono: <Bell className="h-3 w-3" />,
        };
      default:
        return {
          texto: descripcion_estado || "Desconocido",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icono: <Bell className="h-3 w-3" />,
        };
    }
  };

  const handleEliminar = async () => {
    if (!recordatorioAEliminar) return;

    try {
      setEliminandoId(recordatorioAEliminar.id);
      await recordatoriosAPI.eliminarRecordatorio(recordatorioAEliminar.id);

      setRecordatorios((prev) =>
        prev.filter((rec) => rec.id !== recordatorioAEliminar.id)
      );

      toast.success("Recordatorio eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar recordatorio:", error);
      toast.error("Error al eliminar el recordatorio");
    } finally {
      setEliminandoId(null);
      setRecordatorioAEliminar(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando recordatorios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className={cn(
        "flex  items-center justify-between mb-6",
        isMobile ? "flex-col gap-4" : ""
      )}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mis Recordatorios</h1>
            <p className="text-muted-foreground">
              Gestiona tus recordatorios importantes
            </p>
          </div>
        </div>

        <Button onClick={() => navigate("/recordatorios/crear")}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Recordatorio
        </Button>
      </div>

      {/* Grid de recordatorios */}
      <div className="">

      {recordatorios.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No tienes recordatorios
          </h3>
          <p className="text-muted-foreground mb-4">
            Crea tu primer recordatorio para mantenerte organizado
          </p>
          <Button onClick={() => navigate("/recordatorios/crear")}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Recordatorio
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recordatorios.map((recordatorio) => {
            const estado = obtenerEstadoRecordatorio(recordatorio);

            return (
              <Card
                key={recordatorio.id}
                className="hover:shadow-lg transition-shadow flex flex-col h-full"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">
                      {recordatorio.titulo}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`ml-2 flex items-center gap-1 ${estado.color}`}
                    >
                      {estado.icono}
                      {estado.texto}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-1">
                  <div className="space-y-4 flex-1">
                    {/* Descripción */}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {recordatorio.descripcion || "Sin descripción"}
                    </p>

                    {/* Observación */}
                    {recordatorio.observacion && (
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Observación:</span> {recordatorio.observacion}
                        </p>
                      </div>
                    )}

                    {/* Fecha del recordatorio */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatearFecha(recordatorio.fecha_recordatorio)}
                      </span>
                    </div>

                    {/* Fecha de creación */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Creado: {formatearFecha(recordatorio.fecha_creacion)}
                      </span>
                    </div>
                  </div>

                  {/* Acciones - siempre al final */}
                  <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-muted/20">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/recordatorios/editar/${recordatorio.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRecordatorioAEliminar(recordatorio)}
                      disabled={eliminandoId === recordatorio.id}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      {eliminandoId === recordatorio.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </div>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog
        open={!!recordatorioAEliminar}
        onOpenChange={() => setRecordatorioAEliminar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar recordatorio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El recordatorio será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
