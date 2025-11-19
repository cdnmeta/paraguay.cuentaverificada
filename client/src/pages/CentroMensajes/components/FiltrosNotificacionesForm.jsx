import React from 'react';
import { useForm } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Componente de formulario para filtros de notificaciones
 * @param {import('../types/notificaciones.types.js').FiltrosNotificacionesFormProps} props
 */
export default function FiltrosNotificacionesForm({ tiposNotificacion, onSubmit }) {
  const form = useForm({
    defaultValues: {
      tipo_notificacion: undefined,
      id_estado: undefined,
      fecha_desde: null,
      fecha_hasta: null,
    },
  });

  const estadosDisponibles = [
    { id: 1, descripcion: 'Pendiente' },
    { id: 2, descripcion: 'Enviada' },
    { id: 3, descripcion: 'Leído' },
    { id: 4, descripcion: 'Error' },
    { id: 5, descripcion: 'No leído' },
  ];

  const handleSubmit = (values) => {
    // Filtrar valores vacíos y convertir fechas a formato ISO
    const filtros = Object.entries(values).reduce((acc, [key, value]) => {
      if (value && value !== '' && value !== undefined) {
        if (key === 'fecha_desde' || key === 'fecha_hasta') {
          // Convertir Date a string formato YYYY-MM-DD
          acc[key] = format(value, 'yyyy-MM-dd');
        } else {
          acc[key] = parseInt(value, 10);
        }
      }
      return acc;
    }, {});
    
    onSubmit(filtros);
  };

  const handleClearFilters = () => {
    form.reset({
      tipo_notificacion: undefined,
      id_estado: undefined,
      fecha_desde: null,
      fecha_hasta: null,
    });
    onSubmit({});
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tipo de Notificación */}
          <FormField
            control={form.control}
            name="tipo_notificacion"
            render={({ field }) => (
              <FormItem className="md:col-span-2 lg:col-span-3">
                <FormLabel>Tipo de notificación</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md bg-background">
                    {/* Botón "Todos" */}
                    <Button
                      type="button"
                      variant={!field.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => field.onChange(undefined)}
                      className={cn(
                        "transition-all duration-200 hover:scale-105",
                        !field.value && "shadow-md"
                      )}
                    >
                      🔍 Todos
                    </Button>
                    
                    {/* Botones de tipos de notificación */}
                    {tiposNotificacion.map((tipo) => (
                      <Button
                        key={tipo.id_tipo_notificacion}
                        type="button"
                        variant={field.value === tipo.id_tipo_notificacion ? "default" : "outline"}
                        size="sm"
                        onClick={() => field.onChange(tipo.id_tipo_notificacion)}
                        className={cn(
                          "transition-all duration-200 hover:scale-105",
                          field.value === tipo.id_tipo_notificacion && "shadow-md"
                        )}
                      >
                        {tipo.descripcion_tipo_notificacion}
                      </Button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estado */}
          <FormField
            control={form.control}
            name="id_estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    // Si es "todos", establecer como undefined para limpiar
                    field.onChange(value === "todos" ? undefined : value);
                  }} 
                  value={field.value || "todos"}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    {estadosDisponibles.map((estado) => (
                      <SelectItem 
                        key={estado.id} 
                        value={estado.id.toString()}
                      >
                        {estado.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha Desde */}
          <FormField
            control={form.control}
            name="fecha_desde"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha desde</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha Hasta */}
          <FormField
            control={form.control}
            name="fecha_hasta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha hasta</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClearFilters}
            className="w-full sm:w-auto"
          >
            Limpiar filtros
          </Button>
          <Button 
            type="submit"
            className="w-full sm:w-auto"
          >
            Aplicar filtros
          </Button>
        </div>
      </form>
    </Form>
  );
}