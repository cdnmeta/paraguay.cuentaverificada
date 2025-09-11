// components/FormFiltroUsuarios.jsx
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from '@/components/ui/form';
import { getUsersByQuery } from '@/apis/usuarios.api';
import { Search, Trash } from 'lucide-react';


const schema = z.object({
  nombre: z.string().trim().optional(),
  documento: z.string().trim().optional(),
  email: z.string().trim().optional(),
});

export default function FormFiltroUsuarios({
  onResults,
  onLoadingChange,
  defaultValues = { nombre: '', documento: '', email: '' },
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const setIsLoading = (v) => {
    setLoading(v);
    onLoadingChange?.(v);
  };

  const onSubmit = async (values) => {
    // Cancelar búsqueda anterior si sigue en curso
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setIsLoading(true);
      // Limpieza de filtros vacíos para no mandar ruido al backend
      const filters = Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v !== '' && v !== undefined)
      );
      console.log(filters)

      const response = await getUsersByQuery(filters);
      const {data} = response;
      onResults?.(data);
      if (!Array.isArray(data) || data.length === 0) {
        toast.info('Sin resultados con los criterios actuales.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error(err.message || 'Ocurrió un error al buscar.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-4 items-end">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Ana, Juan..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cédula</FormLabel>
              <FormControl>
                <Input placeholder="Ej. 1234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input placeholder="Ej. correo@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-4 flex gap-2 justify-end ">
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4" />
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              form.reset(defaultValues);
              onResults?.([]); // opcional: limpiar resultados al resetear
            }}
          >
            <Trash />
            Limpiar
          </Button>
        </div>
      </form>
    </Form>
  );
}