import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PhotoView, PhotoProvider } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Eye, FileImage } from 'lucide-react';
import { IMAGE_SCHEMA_REQUERIDO } from '@/utils/constants';
import { toast } from 'sonner';
import { rehabilitarSolicitudRecarga } from '@/apis/wallets.api';

// Schema de validación con Zod
const formSchema = z.object({
  imagen: IMAGE_SCHEMA_REQUERIDO,
  observacion: z
    .string()
    .max(500, { message: "La observación no puede exceder 500 caracteres" })
    .optional()
});

const FormRehabilitacionRecarga = ({ movimiento, onCancel, onSuccess = () => {} }) => {
  const [previewImage, setPreviewImage] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      observacion: movimiento?.observacion || ''
    }
  });

  const resetForm = () => {
    reset();
    setPreviewImage(null);
  }

  const handleImageChange = (file) => {
    if (file) {
      setValue('imagen', file, { shouldValidate: true });
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setValue('imagen', null);
  };

  const handleCancel = () => {
    reset();
    setPreviewImage(null);
    if (onCancel) {
      onCancel();
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      // Crear FormData para envío
      const formData = new FormData();
      formData.append('comprobanteRecarga', data.imagen);
      if (data.observacion) {
        formData.append('observacion', data.observacion);
      }
      
      await rehabilitarSolicitudRecarga(movimiento.id, formData);
      
      toast.success('Solicitud rehabilitada exitosamente. Se ha enviado para nueva revisión.');
      resetForm();
      onSuccess?.();
      
    } catch (error) {
      console.error('Error al rehabilitar la solicitud:', error);
      toast.error(error?.response?.data?.message || 'Error al rehabilitar la solicitud');
    }
  };

  return (
    <div className="space-y-4">
      {/* Información del movimiento */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-red-800 mb-2">
          Solicitud Rechazada
        </h4>
        <p className="text-xs text-red-700">
          Su solicitud anterior fue rechazada. Puede subir un nuevo comprobante de pago para que sea revisada nuevamente.
        </p>
        {movimiento?.motivo_rechazo && (
          <div className="mt-2">
            <p className="text-xs font-medium text-red-800">Motivo del rechazo:</p>
            <p className="text-xs text-red-700">{movimiento.motivo_rechazo}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Upload de imagen */}
        <div className="space-y-2">
          <Label htmlFor="imagen" className="text-sm font-medium">
            Nuevo Comprobante de Pago *
          </Label>
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-all border-gray-300 dark:border-gray-600 hover:border-green-400
              ${errors.imagen ? 'border-red-400' : ''}
            `}
          >
            {!previewImage ? (
              <div className="text-center">
                <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <label className="text-green-600 hover:text-green-700 cursor-pointer underline">
                      Selecciona un archivo
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                        onChange={(e) => handleImageChange(e.target.files[0])}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Formatos: JPG, PNG, JPEG (máx. 2MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <PhotoProvider>
                  <PhotoView src={previewImage}>
                    <div className="relative group cursor-pointer">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="mx-auto max-h-48 rounded-lg shadow-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </PhotoView>
                </PhotoProvider>
                
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {errors.imagen && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.imagen.message}
            </p>
          )}
        </div>

        {/* Campo de observación */}
        <div className="space-y-2">
          <Label htmlFor="observacion" className="text-sm font-medium">
            Observaciones adicionales
          </Label>
          <Textarea
            id="observacion"
            placeholder="Agregue cualquier información adicional sobre el nuevo comprobante..."
            className={`min-h-[120px] resize-none ${
              errors.observacion ? 'border-red-400' : ''
            }`}
            {...register('observacion')}
          />
          <div className="flex justify-end text-xs text-gray-500 dark:text-gray-400">
            <span>
              {watch('observacion')?.length || 0} / 500
            </span>
          </div>
          {errors.observacion && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.observacion.message}
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Rehabilitando...
              </div>
            ) : (
              'Rehabilitar Solicitud'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormRehabilitacionRecarga;