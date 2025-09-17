import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ShadCN UI
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Icono (lucide-react)
import { ArrowLeftRight } from "lucide-react";

// APIs
import { getMonedas } from "@/apis/moneda.api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { registrarCotizacionEmpresa } from "@/apis/cotizacion-empresa.api";
import { emit, EVENTS } from "@/utils/events";

// ====== Validación ======
const schema = z
  .object({
    origen: z
      .string({ required_error: "Seleccioná la moneda base" })
      .min(1, "Seleccioná la moneda base"),
    destino: z
      .string({ required_error: "Seleccioná la moneda destino" })
      .min(1, "Seleccioná la moneda destino"),
    monto_venta: z
      .string()
      .min(1, "Ingresá el monto de venta")
      .regex(/^\d+(\.\d{1,5})?$/, "El monto de venta debe ser un número válido"),
    monto_pagos: z
      .string()
      .min(1, "Ingresá el monto de pagos")
      .regex(/^\d+(\.\d{1,5})?$/, "El monto de pagos debe ser un número válido"),
  })
  .refine((data) => data.origen !== data.destino, {
    message: "La moneda base y destino deben ser distintas",
    path: ["destino"],
  });

/**
 * FormCotizacion
 * Props:
 * - loading?: boolean                                   // desactiva UI durante acción externa
 * - className?: string
 */
export default function FormCotizacion({ loading = false, className = "" }) {
  const [monedas, setMonedas] = useState([]);
  const [loadingMonedas, setLoadingMonedas] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      origen: "",
      destino: "",
      monto_venta: "",
      monto_pagos: "",
    },
    mode: "onBlur", // Cambiar a onBlur para que la validación refine se ejecute correctamente
  });

  // Cargar las monedas al montar el componente
  const loadMonedas = async () => {
    setLoadingMonedas(true);
    try {
      const response = await getMonedas();
      console.log("Monedas cargadas:", response?.data);
      setMonedas(response?.data || []);
    } catch (error) {
      toast.error("Error al cargar monedas");
      console.error("Error al cargar monedas:", error);
    } finally {
      setLoadingMonedas(false);
    }
  };

  useEffect(() => {
    loadMonedas();
  }, []);

  const handleSwap = () => {
    const origen = form.getValues("origen");
    const destino = form.getValues("destino");
    form.setValue("origen", destino);
    form.setValue("destino", origen);
  };

  const submit = async (values) => {
    try {
      console.log(values);
      const dataEnviar = {
        id_moneda_origen: Number(values.origen),
        id_moneda_destino: Number(values.destino),
        monto_venta: parseFloat(values.monto_venta),
        monto_pagos: parseFloat(values.monto_pagos),
      };
      await registrarCotizacionEmpresa(dataEnviar);
      toast.success("Cotización registrada con éxito");
      form.reset();
        // Emitir evento para recargar la lista
        emit(EVENTS.COTIZACIONES_EMPRESA_ACTUALIZADA,{
            when: new Date().toISOString()
        });
    } catch (error) {
      if ([400].includes(error?.response?.status)) {
        const data = error?.response?.data;
        toast.error(data?.message || "Error al registrar la cotización");
        return;
      }
      toast.error("Error al registrar la cotización");
      console.error("Error al registrar la cotización:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className={`grid gap-4 ${className}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] items-end gap-3">
          {/* Moneda base */}
          <FormField
            control={form.control}
            name="origen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda Origen</FormLabel>
                <Select
                  disabled={loading || loadingMonedas}
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    // Si destino coincide con la nueva base, lo limpiamos
                    if (form.getValues("destino") === v) {
                      form.setValue("destino", "");
                    }
                    // Trigger validation para que se ejecute el refine de Zod
                    setTimeout(() => form.trigger(["origen", "destino"]), 0);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingMonedas
                          ? "Cargando monedas..."
                          : "Seleccioná la base"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {monedas.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nombre} - {c.sigla_iso}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botón swap */}
          <div className="flex justify-center md:pb-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSwap}
              disabled={
                loading ||
                !form.getValues("origen") ||
                !form.getValues("destino")
              }
              className="h-10 w-full md:w-10"
              title="Intercambiar origen ↔ destino"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span className="sr-only">Intercambiar</span>
            </Button>
          </div>

          {/* Moneda destino */}
          <FormField
            control={form.control}
            name="destino"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda Destino</FormLabel>
                <Select
                  disabled={loading || loadingMonedas}
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    // Trigger validation para que se ejecute el refine de Zod
                    setTimeout(() => form.trigger(["origen", "destino"]), 0);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingMonedas
                          ? "Cargando monedas..."
                          : "Seleccioná el destino"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {monedas.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nombre} - {c.sigla_iso}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/*Input monto_venta */}
          <FormField
            control={form.control}
            name="monto_venta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto de venta</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Input monto_pagos */}
          <FormField
            control={form.control}
            name="monto_pagos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto de pagos</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Submit */}
        <div className="flex md:pb-2">
          <Button
            type="submit"
            disabled={loading || !form.formState.isValid}
            className="w-full"
          >
            {form.formState.isSubmitting ? "Guardando..." : "Agregar cotización"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
