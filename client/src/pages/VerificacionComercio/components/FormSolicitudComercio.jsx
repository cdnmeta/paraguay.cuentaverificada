// FormSolicitudComercio.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { comercioSchema, comercioUpdateSchema } from "../schemas/comercio";
import paisesCode from "@/utils/countries.json";
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
  solicitarVerificacionComercio,
  updateSolicitudComercio,
} from "@/apis/verificacioComercios";
import { ComboBox } from "@/components/customs/comboBoxShadcn/ComboBox1";
import { emit, EVENTS } from "@/utils/events";
import { CODIGO_PAIS_BASE } from "@/utils/constants";


const defaultFormData = {
  razonSocial: "",
  ruc: "",
  telefono: "",
  codigoVendedor: "",
  aceptaTerminos: false,
  codigoPais: CODIGO_PAIS_BASE,
  comprobantePago: undefined,
};

export default function FormSolicitudComercio({
  isEditar = false,
  comercioData = null,
  idComercio = null,
  onSuccess = () => {},
}) {
  const [paises, setPaises] = useState([]);
  const { user } = useAuthStore();

  const form = useForm({
    resolver: zodResolver(isEditar ? comercioUpdateSchema : comercioSchema),
    defaultValues: defaultFormData,
  });

  useEffect(() => {
    const loadPaises = () => {
      const paisesMap = paisesCode.map((pais) => ({
        label: `${pais.name} +(${pais.dial_code})`,
        value: pais.code,
      }));
      setPaises(paisesMap);
    };
    loadPaises();
  }, []);

  // Cargar datos cuando se recibe comercioData
  useEffect(() => {
    if (comercioData && isEditar) {
      form.reset({
        razonSocial: comercioData.razon_social ?? "",
        ruc: comercioData.ruc ?? "",
        telefono: comercioData.telefono ?? "",
        dialCode: comercioData.dial_code ?? "",
        codigoPais: comercioData.codigo_pais ?? CODIGO_PAIS_BASE,
        direccion: comercioData.direccion ?? "",
        codigoVendedor: "",
        aceptaTerminos: false,
        comprobantePago: undefined,
      });
    } else {
      form.reset(defaultFormData);
    }
  }, [comercioData, isEditar, form]);

  const onSubmit = async (data) => {
    try {
      const fd = new FormData();
      const payload = {
        ...data,
        telefono: `${data.telefono}`,
        id_usuario: user?.id,
      };

      const paisSeleccionado = paisesCode.find(p => p.code == data.codigoPais);
      payload.prefijoTelefono = paisSeleccionado ? paisSeleccionado.dial_code : "";

      Object.entries(payload).forEach(([k, v]) => {
        if (k === "comprobantePago") {
          if (!isEditar || (comercioData?.estado === 6 && v?.[0]))
            fd.append(k, v); // sólo crear exige archivo
        } else if (v !== undefined && v !== null) {
          fd.append(k, v);
        }
      });



      if (isEditar && idComercio) {
        await updateSolicitudComercio(idComercio, fd);
      } else {
        await solicitarVerificacionComercio(fd);
      }

      // 🔔 EMIT EVENTO para que otros componentes refresquen
      emit(EVENTS.SOLICITUD_COMERCIO_ACTUALIZADA, {
        idComercio: isEditar ? idComercio : undefined,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Razón Social */}
        <FormField
          control={form.control}
          name="razonSocial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Razón Social <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ingrese la razón social" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* RUC */}
        <FormField
          control={form.control}
          name="ruc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                R.U.C. <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ej: 978783-8" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Teléfono + País */}
        <div className="space-y-2">
          <Label>
            Teléfono/WhatsApp <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="codigoPais"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <ComboBox
                      items={paises}
                      placeholder="Seleccione país"
                      notFoundText="País no encontrado"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem className="flex-[2]">
                  <FormControl>
                    <Input placeholder="987654321" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Código Vendedor */}
        <FormField
          control={form.control}
          name="codigoVendedor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de Vendedor</FormLabel>
              <FormControl>
                <Input placeholder="Opcional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Comprobante de Pago */}
        {(!isEditar || comercioData?.estado === 6) && (
          <FormField
            control={form.control}
            name="comprobantePago"
            render={({ field: { onChange,  } }) => (
              <FormItem>
                <FormLabel>
                  Comprobante de Pago <span className="text-red-500">*</span>
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
        )}

        {/* Términos y Condiciones */}
        <FormField
          control={form.control}
          name="aceptaTerminos"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Acepto los términos y condiciones{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {
            form.formState.isSubmitting
            ? (isEditar ? "Actualizando..." : "Enviando...")
            : (isEditar ? "Actualizar Solicitud" : "Enviar Solicitud")
          }
        </Button>
      </form>
    </Form>
  );
}