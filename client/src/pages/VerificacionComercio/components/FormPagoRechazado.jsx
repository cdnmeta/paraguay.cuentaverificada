// FormPagoRechazado.jsx
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { comercioPagoRechazadoSchema } from "../schemas/comercio";
import { useAuthStore } from "@/hooks/useAuthStorge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateSolicitudComercio } from "@/apis/verificacioComercios";
import { emit, EVENTS } from "@/utils/events";

const defaultFormData = {
  comprobantePago: undefined,
};

export default function FormPagoRechazado({
  comercioData = null,
  onSuccess = () => {},
}) {
  const { user } = useAuthStore();

  const form = useForm({
    resolver: zodResolver(comercioPagoRechazadoSchema),
    defaultValues: defaultFormData,
  });

  // Resetear form cuando cambia comercioData
  useEffect(() => {
    form.reset(defaultFormData);
  }, [comercioData, form]);

  const onSubmit = async (data) => {
    try {
      const fd = new FormData();
      fd.append("comprobantePago", data.comprobantePago);
      
      await updateSolicitudComercio(comercioData.id, fd);

      // 🔔 EMIT EVENTO para que otros componentes refresquen
      emit(EVENTS.SOLICITUD_COMERCIO_ACTUALIZADA, {
        idComercio: comercioData.id,
        userId: user?.id,
        when: Date.now(),
      });
      
      toast.success("Solicitud enviada correctamente");
      form.reset(defaultFormData);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Error al enviar solicitud"
      );
    }
  };

  if (!comercioData || comercioData.estado !== 6) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-red-600">
            Pago Rechazado
          </h3>
          <p className="text-sm text-gray-600">
            Su pago ha sido rechazado. Por favor, suba un nuevo comprobante de pago.
          </p>
        </div>

        {/* Comprobante de Pago */}
        <FormField
          control={form.control}
          name="comprobantePago"
          render={({ field: { onChange, } }) => (
            <FormItem>
              <FormLabel>
                Nuevo Comprobante de Pago <span className="text-red-500">*</span>
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
          {
            form.formState.isSubmitting
          }
        </Button>
      </form>
    </Form>
  );
}