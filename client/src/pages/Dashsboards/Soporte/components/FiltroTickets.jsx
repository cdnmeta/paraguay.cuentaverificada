import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Search, Filter, X } from "lucide-react";
import { toast } from "sonner";

export default function FiltroTickets({ onFiltrar, onLimpiar, loading = false }) {
  // Configurar React Hook Form sin Zod
  const form = useForm({
    defaultValues: {
      titulo: '',
      id_estado: '',
      prioridad: ''
    }
  });

  const { handleSubmit, reset, watch } = form;

  // Observar cambios en el formulario para detectar filtros activos
  const watchedValues = watch();
  const hayFiltrosActivos = watchedValues.titulo || watchedValues.id_estado || watchedValues.prioridad;
  const filtrosAplicados = Object.values(watchedValues).some(value => value && value.trim() !== '');

  // Opciones de estado
  const estadosOptions = [
    { value: '1', label: 'Nuevo' },
    { value: '2', label: 'Abierto' },
    { value: '3', label: 'Pendiente Cliente' },
    { value: '4', label: 'Pendiente Soporte' },
    { value: '5', label: 'En Espera' },
    { value: '6', label: 'Resuelto' },
    { value: '7', label: 'Cerrado' }
  ];

  // Opciones de prioridad
  const prioridadOptions = [
    { value: '1', label: 'Alta' },
    { value: '2', label: 'Media' },
    { value: '3', label: 'Baja' }
  ];

  // Función para aplicar filtros
  const onSubmit = (data) => {
    // Filtrar campos vacíos, nulos o undefined
    const filtros = Object.entries(data).reduce((acc, [key, value]) => {
      if (value && value.trim() !== "") {
        acc[key] = value.trim();
      }
      return acc;
    }, {});

    // Verificar si hay al menos un filtro aplicado
    const hayFiltros = Object.keys(filtros).length > 0;

    if (hayFiltros) {
      toast.success('Filtros aplicados correctamente');
    } else {
      toast.info('Mostrando todos los tickets');
    }

    // Llamar a la función de filtrado del componente padre
    onFiltrar(filtros);
  };

  // Función para limpiar filtros
  const handleLimpiarFiltros = () => {
    reset({
      titulo: '',
      id_estado: '',
      prioridad: ''
    });
    
    toast.info('Filtros limpiados');
    
    // Llamar a las funciones del componente padre
    onLimpiar();
    onFiltrar({});
  };


  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filtros de Tickets
          {filtrosAplicados && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Filtros activos
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo de título */}
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buscar por título/asunto</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="Escriba el título o asunto del ticket..."
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fila de Estado y Prioridad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo de estado */}
              <FormField
                control={form.control}
                name="id_estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado del Ticket</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {estadosOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de prioridad */}
              <FormField
                control={form.control}
                name="prioridad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prioridadOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                type="submit"
                className="flex items-center gap-2"
                disabled={loading}
              >
                <Search className="h-4 w-4" />
                {loading ? 'Filtrando...' : 'Aplicar Filtros'}
              </Button>

              {hayFiltrosActivos && (
                <Button
                  type="button"
                  onClick={handleLimpiarFiltros}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </form>
        </Form>

        {/* Indicador de filtros aplicados */}
        {filtrosAplicados && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <div className="flex items-start gap-2">
              <Filter className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Filtros aplicados:</p>
                <ul className="mt-1 text-blue-700 space-y-1">
                  {watchedValues.titulo && (
                    <li>• Título: "{watchedValues.titulo}"</li>
                  )}
                  {watchedValues.id_estado && (
                    <li>• Estado: {estadosOptions.find(e => e.value === watchedValues.id_estado)?.label}</li>
                  )}
                  {watchedValues.prioridad && (
                    <li>• Prioridad: {prioridadOptions.find(p => p.value === watchedValues.prioridad)?.label}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}