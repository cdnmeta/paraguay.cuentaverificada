import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-tables/data-table";
import { PhotoView, PhotoProvider } from "react-photo-view";
import {
  Plus,
  Edit,
  Image as ImageIcon,
  Calendar,
  User,
  Trash,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import recordatoriosAPI from "../services/recordatoriosAPI";
import ImagenesRecordatorioModal from "../components/ImagenesRecordatorioModal";
import "react-photo-view/dist/react-photo-view.css";
import { cargarURL, executeWithErrorHandler } from "@/utils/funciones";
import routes from "../config/routes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
const RecordatoriosPage = () => {
  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ejecutadoAccion, setEjecutadoAccion] = useState(false);
  const [imagenesUrls, setImagenesUrls] = useState({});
  const [recordatorioAEliminar, setRecordatorioAEliminar] = useState(null);
  const [recodatorioSeleccionado, setRecordatorioSeleccionado] = useState(null);
  const [accionSeleccionada, setAccionSeleccionada] = useState(null); // 'eliminar' | 'inactivar' | null
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    cargarRecordatorios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarRecordatorios = async () => {
    try {
      setLoading(true);
      const data = await recordatoriosAPI.obtenerMisRecordatorios();
      setRecordatorios(data || []);

      // Cargar URLs de Firebase para todas las imágenes
      await cargarTodasLasImagenes(data || []);
    } catch (error) {
      console.error("Error cargando recordatorios:", error);
      toast.error("Error al cargar los recordatorios");
    } finally {
      setLoading(false);
    }
  };

  const cargarTodasLasImagenes = async (recordatoriosList) => {
    const urlsMap = {};

    for (const recordatorio of recordatoriosList) {
      if (recordatorio.url_imagen && recordatorio.url_imagen.length > 0) {
        const urlsCargadas = [];

        for (const rutaImagen of recordatorio.url_imagen) {
          try {
            const urlCompleta = await cargarURL(rutaImagen);
            if (urlCompleta) {
              urlsCargadas.push(urlCompleta);
            }
          } catch (error) {
            console.error(`Error cargando URL para ${rutaImagen}:`, error);
          }
        }

        urlsMap[recordatorio.id] = urlsCargadas;
      }
    }

    setImagenesUrls(urlsMap);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEliminarRecordatorio = async (id) => {
    setEjecutadoAccion(true);

    const resultado = await executeWithErrorHandler(
      () => recordatoriosAPI.eliminarRecordatorio(id),
      {
        mensajeExito: "Recordatorio eliminado correctamente",
        mostrarToastExito: true,
        mensajeError: "No se pudo eliminar el recordatorio"
      }
    );

    if (resultado.success) {
      cargarRecordatorios();
      setOpenDialog(false);
      setRecordatorioAEliminar(null);
      setAccionSeleccionada(null);
    }

    setEjecutadoAccion(false);
  };

  const handleAbriModal = (recordatorio) => {
    setOpenDialog(true);
    setRecordatorioAEliminar(recordatorio);
    setRecordatorioSeleccionado(recordatorio);
    setAccionSeleccionada(null); // Reset selección
  }

  // Manejar selección de acciones (comportamiento radio button)
  const handleSeleccionAccion = (accion) => {
    setAccionSeleccionada(accionSeleccionada === accion ? null : accion);
  };

  // Función para inactivar recordatorio
  const handleCambiarEstadoRecordatorio = async (id,estado= 2) => {
    setEjecutadoAccion(true);

    const resultado = await executeWithErrorHandler(
      () => recordatoriosAPI.actualizarEstadoRecordatorio(id, estado),
    );

    if (resultado.success) {
      cargarRecordatorios();
      setOpenDialog(false);
      setRecordatorioAEliminar(null);
      setRecordatorioSeleccionado(null);
      setAccionSeleccionada(null);
    }

    setEjecutadoAccion(false);
  };

  // Función para ejecutar acción seleccionada
  const handleEjecutarAccion = () => {
    if (!accionSeleccionada || !recordatorioAEliminar) return;

    if (accionSeleccionada === 'eliminar') {
      handleEliminarRecordatorio(recordatorioAEliminar.id);
    } else if (accionSeleccionada === 'inactivar') {
      handleCambiarEstadoRecordatorio(recordatorioAEliminar.id, 2);
    } else if (accionSeleccionada === 'activar') {
      handleCambiarEstadoRecordatorio(recordatorioAEliminar.id, 1);
    }
  };


  const getAccionLabel = (accion) => {
    if (accion === 'eliminar') {
      return 'Eliminando...';
    } else if (accion === 'inactivar') {
      return 'Inactivando...';
    } else if (accion === 'activar') {
      return 'Activando...';
    }
    return 'Selecciona una acción';
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id_estado",
        header: "Opciones",
        cell: ({ row }) => {
          const estado = row.getValue("id_estado");
          const recordatorio = row.original;
          const getEstadoInfo = (estadoId) => {
            switch (estadoId) {
              case 1:
                return { label: "Activo", variant: "success" };
              case 2:
                return { label: "Inactivo", variant: "destructive" };
              default:
                return { label: "Desconocido", variant: "warning" };
            }
          };

          const estadoInfo = getEstadoInfo(estado);
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="flex items-center gap-1 h-8 px-2 bg-amber-400 "
                onClick={() => navigate(`${routes.editar(recordatorio.id)}`)} // Path relativo simple
              >
                <Edit className="h-3 w-3 " />
              </Button>
              <Badge onClick={() => handleAbriModal(recordatorio)} variant={estadoInfo.variant}>{estadoInfo.label}</Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "titulo",
        header: "Titulo",
        cell: ({ row }) => {
          const titulo = row.getValue("titulo");
          return (
            <div className="max-w-[300px]">
              <p className="truncate" title={titulo}>
                {titulo ? titulo : "Sin título"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "descripcion",
        header: "Donde lo Guarde",
        cell: ({ row }) => {
          const descripcion = row.getValue("descripcion");
          return (
            <div className="max-w-[300px]">
              <p className="truncate" title={descripcion}>
                {descripcion}
              </p>
            </div>
          );
        },
      },

      {
        accessorKey: "url_imagen",
        header: "Imágenes",
        cell: ({ row }) => {
          const recordatorio = row.original;
          const imagenes = row.getValue("url_imagen") || [];
          const urlsCompletas = imagenesUrls[recordatorio.id] || [];

          if (imagenes.length === 0) {
            return (
              <div className="flex items-center text-gray-400">
                <ImageIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">Sin imágenes</span>
              </div>
            );
          }

          return (
            <PhotoProvider>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  {imagenes.length}
                </Badge>
                <div className="flex -space-x-2">
                  {urlsCompletas.slice(0, 3).map((url, index) => (
                    <PhotoView key={index} src={url}>
                      <img
                        src={url}
                        alt={`Imagen ${index + 1}`}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover cursor-pointer hover:scale-110 transition-transform shadow-sm"
                      />
                    </PhotoView>
                  ))}
                  {imagenes.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                      +{imagenes.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </PhotoProvider>
          );
        },
      },
      {
        accessorKey: "fecha_creacion",
        header: "Creado",
        cell: ({ row }) => {
          const fecha = row.getValue("fecha_creacion");
          return (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              {formatearFecha(fecha)}
            </div>
          );
        },
      },
      {
        accessorKey: "fecha_actualizacion",
        header: "Actualizado",
        cell: ({ row }) => {
          const fecha = row.getValue("fecha_actualizacion");
          return (
            <div className="text-sm text-gray-500">
              {fecha ? formatearFecha(fecha) : "N/A"}
            </div>
          );
        },
      },
    ],
    [navigate, imagenesUrls]
  );

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row lg:flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-6 h-6" />
              <CardTitle>Mis Recordatorios</CardTitle>
            </div>
            <Button
              onClick={() => navigate(`${routes.crear}`)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Recordatorio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recordatorios.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No tienes recordatorios
              </h3>
              <p className="text-gray-500 mb-4">
                Crea tu primer recordatorio para comenzar
              </p>
              <Button
                onClick={() => navigate("crear")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear Recordatorio
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1">
              <DataTable
                data={recordatorios}
                columns={columns}
                placeholder="Buscar recordatorios..."
                pageSize={10}
              />
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Que deseas hacer con este recordatorio?</DialogTitle>
            <DialogDescription>
              <div className="flex-col">
                <div className="flex flex-col gap-3 mb-4">
                  <p className="text-sm font-medium">Selecciona una acción:</p>
                  <div className="flex gap-4">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox 
                        checked={accionSeleccionada === 'eliminar'}
                        onCheckedChange={() => handleSeleccionAccion('eliminar')}
                      />
                      <span className="text-red-600 font-medium">Eliminar</span>
                    </Label>
                    

                    {recodatorioSeleccionado && recodatorioSeleccionado.id_estado === 1 && (
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={accionSeleccionada === 'inactivar'}
                          onCheckedChange={() => handleSeleccionAccion('inactivar')}
                        />
                        <span className="text-orange-600 font-medium">Inactivar</span>
                      </Label>
                    )}
                    {recodatorioSeleccionado && recodatorioSeleccionado.id_estado === 2 && (
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={accionSeleccionada === 'activar'}
                          onCheckedChange={() => handleSeleccionAccion('activar')}
                        />
                        <span className="text-green-600 font-medium">Activar</span>
                      </Label>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant={accionSeleccionada === 'eliminar' ? 'destructive' : 'default'}
                    disabled={ejecutadoAccion || !accionSeleccionada}
                    onClick={handleEjecutarAccion}
                  >
                    

                    { ejecutadoAccion ? getAccionLabel(accionSeleccionada) : 'Guardar Cambios' }
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setOpenDialog(false);
                      setAccionSeleccionada(null);
                    }}
                    disabled={ejecutadoAccion}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecordatoriosPage;
