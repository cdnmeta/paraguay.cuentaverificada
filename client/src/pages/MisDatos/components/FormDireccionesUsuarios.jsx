import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { crearDireccion, actualizarDireccion, obtenerDireccionPorId } from "@/apis/usuarios.api";

const schema = z.object({
  titulo: z.string().min(1, "El título es requerido").max(100, "El título es muy largo"),
  direccion: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  url_maps: z.string().url("Debe ser una URL válida").min(1, "La URL de Maps es requerida"),
  referencia: z.string().min(5, "La referencia debe tener al menos 5 caracteres")
});

/**
 * Componente FormDireccionesUsuarios
 * Props:
 * - id_direccion: ID de la dirección a editar (null para crear nueva)
 * - onSuccess: callback que se ejecuta cuando se crea/actualiza exitosamente
 * - onCancel: callback para cancelar la operación
 */
export default function FormDireccionesUsuarios({ 
  id_direccion = null, 
  onSuccess, 
  onCancel 
}) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const isEdit = Boolean(id_direccion);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: "",
      direccion: "",
      url_maps: "",
      referencia: ""
    },
    mode: "onChange",
  });

  // Cargar datos para edición
  useEffect(() => {
    const cargarDatosDireccion = async () => {
      try {
        setLoadingData(true);
        const res = await obtenerDireccionPorId(id_direccion);
        const direccion = res.data;
        
        form.reset({
          titulo: direccion.titulo || "",
          direccion: direccion.direccion || "",
          url_maps: direccion.url_maps || "",
          referencia: direccion.referencia || ""
        });
        
      } catch (error) {
        console.error("Error al cargar dirección:", error);
        toast.error("Error al cargar los datos de la dirección");
      } finally {
        setLoadingData(false);
      }
    };

    if (isEdit && id_direccion) {
      cargarDatosDireccion();
    }
  }, [id_direccion, isEdit, form]);

  async function onSubmit(values) {
    setLoading(true);
    try {
      let result;
      
      if (isEdit) {
        result = await actualizarDireccion(id_direccion, values);
        toast.success("Dirección actualizada exitosamente");
      } else {
        result = await crearDireccion(values);
        toast.success("Dirección creada exitosamente");
        form.reset(); // Limpiar form solo al crear
      }
      
      // Llamar callback de éxito si existe
      if (onSuccess) {
        onSuccess(result.data);
      }
      
    } catch (error) {
      console.error("Error al guardar dirección:", error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(
        isEdit 
          ? `Error al actualizar dirección: ${errorMessage}`
          : `Error al crear dirección: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Cargando datos...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? "Editar Dirección" : "Agregar Nueva Dirección"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Campo Título */}
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Casa, Oficina, Casa de mis padres..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Dirección */}
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingresa la dirección completa..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo URL Maps */}
            <FormField
              control={form.control}
              name="url_maps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Google Maps *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://maps.google.com/..."
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Referencia */}
            <FormField
              control={form.control}
              name="referencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Puntos de referencia, indicaciones adicionales..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones de acción */}
            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEdit ? "Actualizando..." : "Guardando..."}
                  </>
                ) : (
                  isEdit ? "Actualizar Dirección" : "Guardar Dirección"
                )}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              )}
              
              {!isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={loading}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}