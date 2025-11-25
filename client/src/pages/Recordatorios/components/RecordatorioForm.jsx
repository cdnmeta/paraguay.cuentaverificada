import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatePicker } from '@/components/date-picker1';
import { Calendar, Clock, Save, Edit, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import recordatoriosAPI from '@/apis/recordatorios.api';
import { recordatorioSchema } from '../schemas/recordatorioSchema';
import { TiposRecordatorios } from '../types/TiposRecordatorios';

const RecordatorioForm = ({ 
  id = null, 
  recordatorio = null, 
  onSuccess = null, 
  onCancel = null,
  compact = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const navigate = useNavigate();
  
  const isEdit = Boolean(id || recordatorio);
  const isCompact = compact || (onSuccess && onCancel);
  
  const form = useForm({
    resolver: zodResolver(recordatorioSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      fecha_recordatorio: null,
    },
  });

  const { handleSubmit } = form;

  const cargarDatosRecordatorio = useCallback(async () => {
    try {
      setLoadingData(true);
      let recordatorioData;
      
      if (recordatorio) {
        // Si se pasó directamente el recordatorio
        recordatorioData = recordatorio;
      } else if (id) {
        // Si solo se pasó el ID, cargar desde API
        const response = await recordatoriosAPI.obtenerRecordatorioPorId(id);
        recordatorioData = response.data;
      }
      
      if (recordatorioData) {
        form.setValue('titulo', recordatorioData.titulo || '');
        form.setValue('descripcion', recordatorioData.descripcion || '');
        
        // Convertir fecha_recordatorio a Date object si existe
        if (recordatorioData.fecha_recordatorio) {
          form.setValue('fecha_recordatorio', new Date(recordatorioData.fecha_recordatorio));
        }
      }
    } catch (error) {
      console.error('Error cargando recordatorio:', error);
      toast.error('Error al cargar los datos del recordatorio');
    } finally {
      setLoadingData(false);
    }
  }, [id, recordatorio, form]);

  // Cargar datos para edición
  useEffect(() => {
    if (isEdit) {
      cargarDatosRecordatorio();
    }
  }, [isEdit, cargarDatosRecordatorio]);



  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Preparar datos para envío
      const recordatorioData = {
        tipo_recordatorio: TiposRecordatorios.RECORDATORIO, // Tipo 2: Recordatorio simple
        titulo: data.titulo,
        descripcion: data.descripcion,
        fecha_recordatorio: data.fecha_recordatorio ? data.fecha_recordatorio.toISOString() : null,
      };

      console.log("Formulario",recordatorioData)

      if (isEdit) {
        const recordatorioId = recordatorio?.id || id;
        await recordatoriosAPI.actualizarRecordatorio(recordatorioId, recordatorioData);
        toast.success('Recordatorio actualizado exitosamente');
      } else {
        await recordatoriosAPI.crearRecordatorio(recordatorioData);
        toast.success('Recordatorio creado exitosamente');
      }
      
      // Si hay callback de éxito, usarlo; sino navegar
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/recordatorios');
      }
    } catch (error) {
      console.error('Error guardando recordatorio:', error);
      toast.error(
        isEdit 
          ? 'Error al actualizar el recordatorio' 
          : 'Error al crear el recordatorio'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'Seleccionar fecha y hora';
    return format(date, "PPP 'a las' HH:mm", { locale: es });
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando recordatorio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isCompact ? "w-full" : "w-full max-w-2xl mx-auto p-6"}>
      {/* Header - Solo mostrar si no es modo compacto */}
      {!isCompact && (
        <div className="flex items-center space-x-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/recordatorios')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            {isEdit ? (
              <Edit className="w-6 h-6 text-primary" />
            ) : (
              <Calendar className="w-6 h-6 text-primary" />
            )}
            <h1 className="text-2xl font-bold">
              {isEdit ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
            </h1>
          </div>
        </div>
      )}

      {isCompact ? (
        // Versión compacta para Sheet
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Título */}
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingresa el título del recordatorio"
                        {...field}
                      />
                    </FormControl>
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
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe tu recordatorio..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha y Hora del Recordatorio */}
              <FormField
                control={form.control}
                name="fecha_recordatorio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha y Hora del Recordatorio *</FormLabel>
                    <div className="space-y-3">
                      <FormControl>
                        <DatePicker
                          label=""
                          value={field.value}
                          onChange={(date) => {
                            if (date) {
                              const currentDate = field.value || new Date();
                              const newDate = new Date(date);
                              newDate.setHours(currentDate.getHours());
                              newDate.setMinutes(currentDate.getMinutes());
                              field.onChange(newDate);
                            } else {
                              field.onChange(null);
                            }
                          }}
                          placeholder="Seleccionar fecha"
                        />
                      </FormControl>
                      
                      {/* Selector de Hora */}
                      {field.value && (
                        <div>
                          <FormLabel>Hora</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              value={
                                field.value 
                                  ? `${field.value.getHours().toString().padStart(2, '0')}:${field.value.getMinutes().toString().padStart(2, '0')}`
                                  : '00:00'
                              }
                              onChange={(e) => {
                                const [horas, minutos] = e.target.value.split(':').map(Number);
                                const newDate = new Date(field.value);
                                newDate.setHours(horas || 0);
                                newDate.setMinutes(minutos || 0);
                                field.onChange(newDate);
                              }}
                              className="w-full"
                            />
                          </FormControl>
                        </div>
                      )}
                      
                      {/* Fecha y hora seleccionada */}
                      {field.value && (
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm text-muted-foreground">
                            Recordatorio programado para: <span className="font-medium text-foreground">
                              {formatDateTime(field.value)}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botones para modo compacto */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEdit ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEdit ? 'Actualizar' : 'Crear'} Recordatorio
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        // Versión completa para página independiente
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Información del Recordatorio</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Título */}
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingresa el título del recordatorio"
                          {...field}
                        />
                      </FormControl>
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
                          placeholder="Describe tu recordatorio..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha y Hora del Recordatorio */}
                <FormField
                  control={form.control}
                  name="fecha_recordatorio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y Hora del Recordatorio *</FormLabel>
                      <div className="space-y-3">
                        <FormControl>
                          <DatePicker
                            label="Fecha"
                            value={field.value}
                            onChange={(date) => {
                              if (date) {
                                const currentDate = field.value || new Date();
                                const newDate = new Date(date);
                                newDate.setHours(currentDate.getHours());
                                newDate.setMinutes(currentDate.getMinutes());
                                field.onChange(newDate);
                              } else {
                                field.onChange(null);
                              }
                            }}
                            placeholder="Seleccionar fecha"
                          />
                        </FormControl>
                        
                        {/* Selector de Hora */}
                        {field.value && (
                          <div>
                            <FormLabel>Hora</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                value={
                                  field.value 
                                    ? `${field.value.getHours().toString().padStart(2, '0')}:${field.value.getMinutes().toString().padStart(2, '0')}`
                                    : '00:00'
                                }
                                onChange={(e) => {
                                  const [horas, minutos] = e.target.value.split(':').map(Number);
                                  const newDate = new Date(field.value);
                                  newDate.setHours(horas || 0);
                                  newDate.setMinutes(minutos || 0);
                                  field.onChange(newDate);
                                }}
                                className="w-full"
                              />
                            </FormControl>
                          </div>
                        )}
                        
                        {/* Fecha y hora seleccionada */}
                        {field.value && (
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">
                              Recordatorio programado para: <span className="font-medium text-foreground">
                                {formatDateTime(field.value)}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Botones para página completa */}
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/recordatorios')}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isEdit ? 'Actualizar' : 'Crear'} Recordatorio</span>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecordatorioForm;