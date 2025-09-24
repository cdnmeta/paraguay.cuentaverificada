import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PhotoView, PhotoProvider } from "react-photo-view";
import { X, Upload, Image as ImageIcon, Trash2, Camera, RotateCcw, Square } from "lucide-react";
import { toast } from "sonner";
import Webcam from "react-webcam";
import {
  schemaCreateRecordatorio,
  schemaUpdateRecordatorio,
} from "../schemas/recordatoriosSchema";
import recordatoriosAPI from "../services/recordatoriosAPI";
import { cargarURL } from "@/utils/funciones";
import "react-photo-view/dist/react-photo-view.css";
import LoadingSpinner from "@/components/customs/loaders/LoadingSpinner";
import { set } from "date-fns";

const FormRecordatorio = ({ id_recordatorio = null }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [imagenesPrevias, setImagenesPrevias] = useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
  const [mapeoImagenes, setMapeoImagenes] = useState({}); // Mapeo: URL completa -> ruta original
  
  // Estados para cámara
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // "environment" para trasera, "user" para frontal
  
  const webcamRef = useRef(null);

  // Detectar si es móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const isEdit = Boolean(id_recordatorio);
  const schema = isEdit ? schemaUpdateRecordatorio : schemaCreateRecordatorio;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      id_estado: 1,
      imagenes: [],
    },
  });

  const watchedImagenes = watch("imagenes") || [];

  // Cargar datos para edición
  useEffect(() => {
    if (isEdit) {
      cargarDatosRecordatorio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_recordatorio, isEdit]);

  const cargarDatosRecordatorio = async () => {
    try {
      setLoadingData(true);
      const recordatorio = await recordatoriosAPI.obtenerRecordatorioPorId(
        id_recordatorio
      );

      // Establecer valores del formulario
      setValue("descripcion", recordatorio.descripcion);
      setValue("id_estado", recordatorio.id_estado);
      setValue("titulo", recordatorio.titulo);

      // Cargar URLs completas de Firebase para las imágenes previas
      if (recordatorio.url_imagen && recordatorio.url_imagen.length > 0) {
        const urlsCompletas = [];
        const mapeo = {};

        for (const rutaImagen of recordatorio.url_imagen) {
          try {
            const urlCompleta = await cargarURL(rutaImagen);
            if (urlCompleta) {
              urlsCompletas.push(urlCompleta);
              mapeo[urlCompleta] = rutaImagen; // Mapear URL completa -> ruta original
            }
          } catch (error) {
            console.error(`Error cargando URL para ${rutaImagen}:`, error);
          }
        }

        console.log("url mapeo", mapeo);
        console.log("urlsCompletas", urlsCompletas);

        setImagenesPrevias(urlsCompletas);
        setMapeoImagenes(mapeo);
      }
    } catch (error) {
      console.error("Error cargando recordatorio:", error);
      toast.error("Error al cargar los datos del recordatorio");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (isEdit) {
        // Para edición
        const updateData = {
          titulo: data.titulo,
          descripcion: data.descripcion,
          id_estado: data.id_estado,
          nuevasImagenes: data.imagenes || [],
        };

        // Primero eliminar las imágenes marcadas para eliminar
        if (imagenesAEliminar.length > 0) {
          // Convertir URLs completas a rutas originales para el backend
          const rutasAEliminar = imagenesAEliminar
            .map((url) => mapeoImagenes[url])
            .filter(Boolean);
          if (rutasAEliminar.length > 0) {
            await recordatoriosAPI.eliminarImagenesEspecificas(
              id_recordatorio,
              rutasAEliminar
            );
          }
        }

        // Luego actualizar con nuevos datos
        await recordatoriosAPI.actualizarRecordatorio(
          id_recordatorio,
          updateData
        );
        toast.success("Recordatorio actualizado exitosamente");
      } else {
        // Para creación
        console.log("data es ",data)
        await recordatoriosAPI.crearRecordatorio(data);
        toast.success("Recordatorio creado exitosamente");
        reset();
      }
    } catch (error) {
      console.error("Error al guardar recordatorio:", error);
      toast.error(
        isEdit
          ? "Error al actualizar recordatorio"
          : "Error al crear recordatorio"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setValue("imagenes", files);
  };

  const removeNewImage = (index) => {
    const currentImages = watch("imagenes") || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    setValue("imagenes", newImages);
  };

  const markImageForDeletion = (urlImagen) => {
    setImagenesAEliminar((prev) => [...prev, urlImagen]);
    setImagenesPrevias((prev) => prev.filter((url) => url !== urlImagen));
  };

  const restoreImage = (urlImagen) => {
    setImagenesAEliminar((prev) => prev.filter((url) => url !== urlImagen));
    setImagenesPrevias((prev) => [...prev, urlImagen]);
  };

  // Funciones para cámara
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Convertir base64 a blob y luego a File
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
          const currentImages = watch("imagenes") || [];
          setValue("imagenes", [...currentImages, file]);
          toast.success("Foto capturada exitosamente");
          setShowCamera(false);
        })
        .catch(error => {
          console.error("Error al capturar foto:", error);
          toast.error("Error al capturar la foto");
        });
    }
  }, [webcamRef, setValue, watch]);

  const switchCamera = () => {
    setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
  };

  const openCamera = () => {
    setShowCamera(true);
  };

  const closeCamera = () => {
    setShowCamera(false);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            {isEdit ? "Editar Recordatorio" : "Crear Recordatorio"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <LoadingSpinner message="cargando datos" />
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Titulo *</Label>
                  <Input
                    id="titulo"
                    {...register("titulo")}
                    placeholder="Título del recordatorio"
                  />
                  {errors.titulo && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {errors.titulo.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                {/* Campo Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    {...register("descripcion")}
                    placeholder="Describe tu recordatorio..."
                    className="min-h-[100px]"
                  />
                  {errors.descripcion && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {errors.descripcion.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Campo Estado (opcional, hidden por ahora) */}
                <input type="hidden" {...register("id_estado")} />

                {/* Imágenes Previas (solo en edición) */}
                {isEdit && imagenesPrevias.length > 0 && (
                  <div className="space-y-2">
                    <Label>Imágenes Actuales</Label>
                    <PhotoProvider>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagenesPrevias.map((url, index) => (
                          <div key={index} className="relative group">
                            <PhotoView src={url}>
                              <img
                                src={url}
                                alt={`Imagen ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg cursor-pointer border-2 border-gray-200 hover:border-primary transition-colors"
                              />
                            </PhotoView>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => markImageForDeletion(url)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </PhotoProvider>
                  </div>
                )}

                {/* Imágenes marcadas para eliminar */}
                {imagenesAEliminar.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-red-600">Imágenes a eliminar</Label>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-700 mb-2">
                        Las siguientes imágenes se eliminarán al guardar:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {imagenesAEliminar.map((url, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-red-100 px-2 py-1 rounded text-sm"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                            <span className="text-red-800">
                              Imagen {index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 text-red-600 hover:text-red-800"
                              onClick={() => restoreImage(url)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Nuevas Imágenes */}
                <div className="space-y-2">
                  <Label htmlFor="imagenes">
                    {isEdit ? "Agregar Nuevas Imágenes" : "Imágenes"} (Opcional)
                  </Label>
                  
                  {/* Opciones de carga de imagen */}
                  <div className="flex gap-2 mb-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center flex-1">
                      <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                      <Label htmlFor="imagenes" className="cursor-pointer">
                        <span className="text-primary hover:underline">
                          Seleccionar desde galería
                        </span>
                        <Input
                          id="imagenes"
                          type="file"
                          multiple
                          accept="image/png,image/jpg,image/jpeg"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </Label>
                    </div>
                    
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center flex-1">
                      <Camera className="w-6 h-6 mx-auto text-blue-400 mb-2" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={openCamera}
                        className="text-blue-600 hover:text-blue-800 border-none p-0 h-auto"
                      >
                        Usar cámara
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    PNG, JPG o JPEG (máximo 5MB cada una)
                  </p>

                  {/* Modal de cámara */}
                  {showCamera && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Tomar Foto</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={closeCamera}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="relative">
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width="100%"
                            videoConstraints={{
                              facingMode: facingMode,
                            }}
                            className="rounded-lg"
                          />
                        </div>
                        
                        <div className="flex justify-center gap-4 mt-4">
                          {isMobile && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={switchCamera}
                              className="flex items-center gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Cambiar cámara
                            </Button>
                          )}
                          
                          <Button
                            type="button"
                            onClick={capture}
                            className="flex items-center gap-2"
                          >
                            <Camera className="h-4 w-4" />
                            Capturar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview de nuevas imágenes */}
                  {watchedImagenes.length > 0 && (
                    <div className="space-y-2">
                      <Label>Nuevas imágenes seleccionadas</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {watchedImagenes.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Nueva imagen ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeNewImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.imagenes && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {errors.imagenes.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isEdit ? "Actualizando..." : "Creando..."}
                      </>
                    ) : isEdit ? (
                      "Actualizar Recordatorio"
                    ) : (
                      "Crear Recordatorio"
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormRecordatorio;
