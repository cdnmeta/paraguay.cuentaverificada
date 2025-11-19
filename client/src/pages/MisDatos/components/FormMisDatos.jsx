import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import paisesCode from "@/utils/paises-flag.json";
import { ComboBox } from "@/components/customs/comboBoxShadcn/ComboBox1.jsx";
import { actualizarMisDatos } from "@/apis/usuarios.api";

const schema = z.object({
  direccion: z.string().min(5, "Ingresa una dirección válida"),
  email: z.string().email("Email inválido"),
  dial_code: z.string().min(1, "Selecciona un país"),
  telefono: z.string().min(6, "Ingresa un número de teléfono válido")
});

/**
 * Componente FormMisDatos
 * Props:
 * - user: objeto con datos del usuario para inicializar el form
 * - onSuccess: callback que se ejecuta cuando se actualiza exitosamente
 */
export default function FormMisDatos({ user, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);

  // Encontrar Paraguay por defecto
  const paraguayCode = paisesCode.find(pais => pais.code === 'PY')?.countryCode;
  const defaultDialCode = paraguayCode ? `+${paraguayCode}` : "+595";

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      direccion: user?.direccion || "",
      email: user?.email || "",
      dial_code: user?.dial_code || defaultDialCode,
      telefono: user?.telefono || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    console.log("Mis datos:", user);
    if (user) {
      form.reset({
        direccion: user.direccion || "",
        email: user.email || "",
        dial_code: user.dial_code || defaultDialCode,
        telefono: user.telefono || "",
      });
    }
  }, [user]);

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      // Preparar datos para el backend con dial_code y telefono separados
      const formattedData = {
        direccion: values.direccion,
        correo: values.email,
        dial_code: values.dial_code,
        telefono: values.telefono
      };
      
      // Enviar datos al backend
      await actualizarMisDatos(formattedData);
      
      toast.success("Datos actualizados exitosamente");
      
      // Llamar callback de éxito si existe
      if (onSuccess) {
        onSuccess(formattedData);
      }
      
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      toast.error("Error al actualizar los datos: " + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  }

  return (
   <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem asChild>
                  <div className="space-y-1">
                    <FormLabel>Dirección (donde vive)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Calle, número, referencia..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem asChild>
                  <div className="space-y-1">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="correo@dominio.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="space-y-1 md:col-span-2">
              <FormLabel>Teléfono</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="dial_code"
                  render={({ field }) => (
                    <FormItem className="w-40">
                      <FormControl>
                        <ComboBox
                          items={paisesCode.map(pais => ({
                            value: `${pais.countryCode}`,
                            label: `${pais.country} (+${pais.countryCode})`,
                            country: pais.country
                          }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Código"
                          searchPlaceholder="Buscar país..."
                          emptyMessage="No se encontraron países"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          placeholder="972 711 111" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {form.formState.errors.dial_code && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.dial_code.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </Form>
  );
}
