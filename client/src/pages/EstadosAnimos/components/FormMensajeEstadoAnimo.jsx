import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  Loader2,
  MessageSquare
} from 'lucide-react';
import {
  getTiposEstadosAnimo,
  getEstadosAnimosById,
  crearMensajeEstadoAnimo,
  actualizarMensajeEstadoAnimo
} from '@/apis/estados-animos.api';

// Schema de validación usando Zod
const formSchema = z.object({
  mensaje: z
    .string()
    .min(1, { message: 'El mensaje no debe estar vacío' })
    .min(3, { message: 'El mensaje debe tener al menos 3 caracteres' })
    .max(500, { message: 'El mensaje no puede exceder 500 caracteres' }),
  id_estado_animo: z
    .number({ message: 'Debe seleccionar un tipo de estado de ánimo' })
    .min(1, { message: 'Debe seleccionar un tipo de estado de ánimo válido' }),
});

const FormMensajeEstadoAnimo = ({ 
  id = null, 
  onSuccess = () => {}, 
  onCancel = () => {} 
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [tiposEstados, setTiposEstados] = useState([]);
  const isEditing = Boolean(id);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mensaje: '',
      id_estado_animo: undefined,
    },
  });

  // Cargar tipos de estados de ánimo
  const cargarTiposEstados = async () => {
    try {
      const response = await getTiposEstadosAnimo();
      if (response.data && Array.isArray(response.data)) {
        setTiposEstados(response.data);
      }
    } catch (error) {
      console.error('Error al cargar tipos de estados:', error);
      toast.error('Error al cargar los tipos de estados de ánimo');
    }
  };

  // Cargar datos del estado de ánimo para edición
  const cargarDatosEstado = React.useCallback(async (estadoId) => {
    try {
      setLoadingData(true);
      const response = await getEstadosAnimosById(estadoId);
      
      if (response.data) {
        const { mensaje, id_tipo_animo } = response.data;
        form.reset({
          mensaje,
          id_estado_animo: id_tipo_animo,
        });
      }
    } catch (error) {
      console.error('Error al cargar datos del estado:', error);
      toast.error('Error al cargar los datos del estado de ánimo');
    } finally {
      setLoadingData(false);
    }
  }, [form]);

  // Enviar formulario
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      if (isEditing) {
        await actualizarMensajeEstadoAnimo(id, data);
        toast.success('Estado de ánimo actualizado exitosamente');
      } else {
        await crearMensajeEstadoAnimo(data);
        toast.success('Estado de ánimo creado exitosamente');
      }
      
      onSuccess();
      form.reset();
    } catch (error) {
      console.error('Error al guardar estado de ánimo:', error);
      const errorMessage = error.response?.data?.message || 
        `Error al ${isEditing ? 'actualizar' : 'crear'} el estado de ánimo`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    cargarTiposEstados();
  }, []);

  // Efecto para cargar datos en modo edición
  useEffect(() => {
    if (isEditing && id) {
      cargarDatosEstado(id);
    } else {
      // Reset form when switching to create mode
      form.reset({
        mensaje: '',
        id_estado_animo: undefined,
      });
    }
  }, [id, isEditing, form, cargarDatosEstado]);

  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">
          {isEditing ? 'Editar Estado de Ánimo' : 'Nuevo Estado de Ánimo'}
        </h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Mensaje */}
          <FormField
            control={form.control}
            name="mensaje"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensaje *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Escribe un mensaje inspirador..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Tipo de Estado de Ánimo */}
          <FormField
            control={form.control}
            name="id_estado_animo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Estado de Ánimo *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo de estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposEstados.map((tipo) => (
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

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Actualizar' : 'Crear'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormMensajeEstadoAnimo;
