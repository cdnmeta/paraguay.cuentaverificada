// FormVerificacionComercio.jsx
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  comercioVerificacionInformacion,
  updateComercioVerificacionInformacion,
} from "../schemas/comercio";
import { useAuthStore } from "@/hooks/useAuthStorge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  verificarInformacionComercio,
  actualizarVerificacionComercio,
} from "@/apis/verificacioComercios";
import { emit, EVENTS } from "@/utils/events";

const defaultFormData = {
  correo_empresa: "",
  url_maps: "",
  foto_interior: undefined,
  foto_exterior: undefined,
  factura_servicio: undefined,
  direccion: "",
};

export default function FormVerificacionComercio({
  isEditar = false,
  comercioData = null,
  onSuccess = () => {},
}) {
  const { user } = useAuthStore();

  const form = useForm({
    resolver: zodResolver(
      isEditar
        ? updateComercioVerificacionInformacion
        : comercioVerificacionInformacion
    ),
    defaultValues: defaultFormData,
  });

  // Cargar datos cuando se recibe comercioData
  useEffect(() => {
    if (comercioData && isEditar) {
      form.reset({
        correo_empresa: comercioData.correo_empresa ?? "",
        url_maps: comercioData.urlmaps ?? "",
        direccion: comercioData.direccion ?? "",
        foto_interior: undefined,
        foto_exterior: undefined,
        factura_servicio: undefined,
      });
    } else {
      form.reset(defaultFormData);
    }
  }, [comercioData, isEditar, form]);

  const onSubmit = async (data) => {
    try {
      const fd = new FormData();
      fd.append("correo_empresa", data.correo_empresa);
      fd.append("url_maps", data.url_maps);
      fd.append("foto_interior", data.foto_interior);
      fd.append("foto_exterior", data.foto_exterior);
      fd.append("imagen_factura_servicio", data.factura_servicio);
      fd.append("direccion", data.direccion);
      fd.append("id_comercio", comercioData.id);

      // Si ya existe recurso de verificación en backend, usa actualizar; si no, crea
      if (comercioData?.id && comercioData?.estado === 5) {
        await actualizarVerificacionComercio(comercioData.id, fd);
      } else {
        await verificarInformacionComercio(fd);
      }

      toast.success("Información enviada correctamente");
      
      // 🔔 EMIT EVENTO
      emit(EVENTS.VERIFICACION_COMERCIO_ACTUALIZADA, {
        idComercio: comercioData?.id,
        userId: user?.id,
        when: Date.now(),
      });
      
      form.reset(defaultFormData);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Error al verificar información"
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Correo Empresa */}
        <FormField
          control={form.control}
          name="correo_empresa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Correo Electrónico de la Empresa{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="correo@empresa.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* URL Maps */}
        <FormField
          control={form.control}
          name="url_maps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                URL de Google Maps <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://maps.google.com/..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dirección */}
        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Dirección <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Dirección completa del comercio"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Foto Interior */}
        <FormField
          control={form.control}
          name="foto_interior"
          render={({ field: { onChange, } }) => (
            <FormItem>
              <FormLabel>
                Foto Interior del Comercio{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Foto Exterior */}
        <FormField
          control={form.control}
          name="foto_exterior"
          render={({ field: { onChange, } }) => (
            <FormItem>
              <FormLabel>
                Foto Exterior del Comercio{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Factura de Servicio */}
        <FormField
          control={form.control}
          name="factura_servicio"
          render={({ field: { onChange, } }) => (
            <FormItem>
              <FormLabel>
                Factura de Servicio <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {form.formState.isSubmitting ? "Actualizando..." : "Actualizar Información"}
        </Button>
      </form>
    </Form>
  );
}