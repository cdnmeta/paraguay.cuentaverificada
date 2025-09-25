import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  MapPin, 
  ExternalLink, 
  Plus,
  AlertTriangle 
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { obtenerMisDirecciones, eliminarDireccion } from "@/apis/usuarios.api";
import FormDireccionesUsuarios from "./FormDireccionesUsuarios";

/**
 * Componente ListadoDireccionesUsuarios
 * Muestra el listado de direcciones del usuario con opciones de editar y eliminar
 */
export default function ListadoDireccionesUsuarios() {
  const [direcciones, setDirecciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editandoDireccion, setEditandoDireccion] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    cargarDirecciones();
  }, []);

  const cargarDirecciones = async () => {
    try {
      setLoading(true);
      const res = await obtenerMisDirecciones();
      setDirecciones(res.data);
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
      toast.error("Error al cargar las direcciones");
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaDireccion = () => {
    setEditandoDireccion(null);
    setShowForm(true);
  };

  const handleEditarDireccion = (direccion) => {
    setEditandoDireccion(direccion.id);
    setShowForm(true);
  };

  const handleEliminarDireccion = async (id) => {
    try {
      setEliminandoId(id);
      await eliminarDireccion(id);
      toast.success("Dirección eliminada exitosamente");
      
      // Actualizar lista
      setDirecciones(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error("Error al eliminar dirección:", error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error al eliminar dirección: ${errorMessage}`);
    } finally {
      setEliminandoId(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditandoDireccion(null);
    cargarDirecciones(); // Recargar lista
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditandoDireccion(null);
  };

  const abrirEnMaps = (url) => {
    window.open(url, '_blank');
  };

  if (showForm) {
    return (
      <FormDireccionesUsuarios
        id_direccion={editandoDireccion}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Mis Direcciones</CardTitle>
        <Button onClick={handleNuevaDireccion} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Dirección
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Cargando direcciones...</p>
            </div>
          </div>
        ) : direcciones.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No tienes direcciones guardadas
            </h3>
            <p className="text-muted-foreground mb-4">
              Agrega tu primera dirección para facilitar tus entregas
            </p>
            <Button onClick={handleNuevaDireccion} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primera Dirección
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
            {direcciones.map((direccion) => (
              <div
                key={direccion.id}
                className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Título y estado */}
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">
                        {direccion.titulo}
                      </h4>
                      {direccion.activo ? (
                        <Badge variant="default" className="text-xs">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Inactiva
                        </Badge>
                      )}
                    </div>

                    {/* Dirección */}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          {direccion.direccion}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>Referencia:</strong> {direccion.referencia}
                        </p>
                      </div>
                    </div>

                    {/* URL Maps */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                        onClick={() => abrirEnMaps(direccion.url_maps)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver en Google Maps
                      </Button>
                    </div>

                    {/* Fechas */}
                    <div className="text-xs text-muted-foreground">
                      Creada: {new Date(direccion.fecha_creacion).toLocaleDateString()}
                      {direccion.fecha_actualizacion && (
                        <span className="ml-3">
                          Actualizada: {new Date(direccion.fecha_actualizacion).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditarDireccion(direccion)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={eliminandoId === direccion.id}
                        >
                          {eliminandoId === direccion.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            Eliminar Dirección
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que deseas eliminar la dirección "{direccion.titulo}"?
                            <br />
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleEliminarDireccion(direccion.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}