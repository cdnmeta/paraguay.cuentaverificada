import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getTiposTickets, createTicket } from '@/apis/tickets.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { X, Upload, FileText, Image, FileIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Esquema de validación con Zod
const createTicketSchema = z.object({
  titulo: z.string()
    .min(1, 'El título es requerido')
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  id_tipo_ticket: z.number({
    required_error: 'El tipo de ticket es requerido',
    invalid_type_error: 'Debe seleccionar un tipo de ticket válido'
  }),
  descripcion: z.string()
    .min(1, 'La descripción es requerida')
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),
});

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

export default function FormCreacionTicket({ onSuccess, onCancel }) {
  const [tiposTicket, setTiposTicket] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');

  const form = useForm({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
    }
  });

  useEffect(() => {
    const fetchTiposTicket = async () => {
      try {
        const response = await getTiposTickets();
        setTiposTicket(response.data);
      } catch (error) {
        console.error('Error fetching tipos de ticket:', error);
      }
    };

    fetchTiposTicket();
  }, []);

  const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, PDF, DOCX';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'El archivo excede el tamaño máximo de 5MB';
    }
    return null;
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setFileError('');

    if (archivos.length + files.length > MAX_FILES) {
      setFileError(`Solo se permiten máximo ${MAX_FILES} archivos`);
      return;
    }

    const validFiles = [];
    let hasError = false;

    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        hasError = true;
        break;
      }
      
      // Verificar si el archivo ya existe
      const exists = archivos.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );
      
      if (!exists) {
        validFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
    }

    if (!hasError) {
      setArchivos(prev => [...prev, ...validFiles]);
    }

    // Limpiar el input
    event.target.value = '';
  };

  const removeFile = (fileId) => {
    setArchivos(prev => prev.filter(archivo => archivo.id !== fileId));
    setFileError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('titulo', data.titulo);
      formData.append('id_tipo_ticket', data.id_tipo_ticket.toString());
      formData.append('descripcion', data.descripcion);

      // Agregar archivos al FormData
      archivos.forEach((archivo) => {
        formData.append('archivos', archivo.file);
      });

      await createTicket(formData);
      
      // Limpiar formulario
      form.reset();
      setArchivos([]);
      setFileError('');
      
      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setFileError('Error al crear el ticket. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Título */}
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Ticket *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingrese el título del ticket"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo de Ticket */}
        <FormField
          control={form.control}
          name="id_tipo_ticket"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Ticket *</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ''}>
                <FormControl>
                  <SelectTrigger className={'w-full'}>
                    <SelectValue placeholder="Seleccione el tipo de ticket" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiposTicket.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descripción */}
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe detalladamente tu solicitud o problema..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Upload de Archivos */}
        <div className="space-y-4">
          <div className="space-y-2">
            <FormLabel>Archivos Adjuntos (Opcional)</FormLabel>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Arrastra archivos aquí o 
                </p>
                <Input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={archivos.length >= MAX_FILES}
                />
                <FormLabel
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  haz clic para seleccionar
                </FormLabel>
                <FormDescription className="mt-2">
                  Máximo {MAX_FILES} archivos, 5MB cada uno. Formatos: JPG, PNG, PDF, DOCX
                </FormDescription>
              </div>
            </div>
          </div>

          {/* Lista de archivos subidos */}
          {archivos.length > 0 && (
            <div className="space-y-2">
              <FormLabel>Archivos seleccionados ({archivos.length}/{MAX_FILES})</FormLabel>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {archivos.map((archivo) => (
                  <div key={archivo.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {getFileIcon(archivo.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {archivo.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(archivo.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(archivo.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error de archivos */}
          {fileError && (
            <Alert variant="destructive">
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}
        </div>        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando...' : 'Crear Ticket'}
        </Button>
      </div>
    </form>
    </Form>
  );
}