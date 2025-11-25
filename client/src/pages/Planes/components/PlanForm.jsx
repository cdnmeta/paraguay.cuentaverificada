import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { Loader2, Save, Edit3 } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// APIs
import { getPlanById, createPlan, updatePlan } from "@/apis/planes.api";

// Schema de validación Zod basado en el DTO CreatePlanPayloadDto
const planSchema = z.object({
  descripcion: z.string().min(1, "La descripción del plan es obligatoria"),
  nombre: z.string().min(1, "El nombre del plan es obligatorio"),
  precio: z.coerce
    .number({
      invalid_type_error: "El precio del plan debe ser un número",
      required_error: "El precio del plan es obligatorio",
    })
    .min(1, "El precio del plan debe ser mayor a 0"),
  precio_sin_iva: z.coerce
    .number({
      invalid_type_error: "El precio sin IVA del plan debe ser un número",
      required_error: "El precio sin IVA del plan es obligatorio",
    })
    .min(1, "El precio sin IVA del plan debe ser mayor a 0"),   
  renovacion_plan: z.enum(["mes", "anio", "dia"], {
    errorMap: () => ({
      message: "La renovación del plan debe ser mensual, anual o diario",
    }),
  }),
  renovacion_valor: z
    .number({
      invalid_type_error: "El valor de la renovación debe ser un número",
    })
    .min(1, "El valor de la renovación debe ser mayor a 0"),
  tipo_iva: z
    .string()
    .refine((val) => !isNaN(Number(val)), {
      message: "El tipo de IVA debe ser un número válido",
    })
    .transform((val) => Number(val)),
});

/**
 * PlanForm - Formulario para crear/editar planes
 * @param {string|number} [id] - ID del plan para modo edición
 * @param {function} [onSuccess] - Callback ejecutado después del éxito
 * @param {string} [className] - Clases CSS adicionales
 */
export default function PlanForm({ id, onSuccess, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const isEditMode = Boolean(id);

  // Configuración del formulario
  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      descripcion: "",
      nombre: "",
      precio: "",
      precio_sin_iva: "",
      renovacion_plan: "mes",
      renovacion_valor: 1,
      tipo_iva: "3",
    },
  });

  // Cargar datos del plan cuando esté en modo edición

  const loadPlanData = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingData(true);
      const response = await getPlanById(id);

      if (response.status === 200) {
        const planData = response.data;
        form.reset({
          descripcion: planData.descripcion || "",
          nombre: planData.nombre || "",
          precio: planData.precio || 0,
          precio_sin_iva: planData.precio_sin_iva || 0,
          renovacion_plan: planData.renovacion_plan || "mes",
          renovacion_valor: planData.renovacion_valor || 1,
          tipo_iva: planData.tipo_iva?.toString() || "10",
        });
      } else {
        toast.error("Error al cargar los datos del plan");
      }
    } catch (error) {
      console.error("Error loading plan data:", error);
      toast.error("Error al cargar los datos del plan");
    } finally {
      setLoadingData(false);
    }
  }, [id, form]);
  useEffect(() => {
    if (isEditMode) {
      loadPlanData();
    }
  }, [isEditMode, loadPlanData]);

  const IVAS = [
    { label: "Exentas", id: 1, valor: 0 },
    { label: "5%", id: 2, valor: 5 },
    { label: "10%", id: 3, valor: 10 },
  ];

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      let response;

      if (isEditMode) {
        await updatePlan(id, data);

        toast.success("Plan actualizado exitosamente");
      } else {
        await createPlan(data);

        toast.success("Plan creado exitosamente");
        form.reset();
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error(error.response?.data?.message || "Error al guardar el plan");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando datos del plan...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Edit3 className="h-5 w-5" />
              Editar Plan
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Crear Plan
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre del plan */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del plan *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingrese el nombre del plan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo de IVA */}
              <FormField
                control={form.control}
                name="tipo_iva"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de IVA *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className={"w-full"}>
                          <SelectValue placeholder="Seleccione el tipo de IVA" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {IVAS.map((iva) => (
                          <SelectItem key={iva.id} value={String(iva.id)}>
                            {iva.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descripción */}
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del plan *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingrese la descripción del plan"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Precios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Precio sin IVA */}
              <FormField
                control={form.control}
                name="precio_sin_iva"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio sin IVA *</FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        value={field.value}
                        onValueChange={(values) => {
                          const precioSinIva = values.value;
                          console.log(
                            "iva actual ",
                            form.getValues("tipo_iva")
                          );
                          const tipoIva =
                            Number(form.getValues("tipo_iva")) || 0;
                          const ivautilizar =
                            IVAS.find((iva) => iva.id == tipoIva)?.valor || 0;
                          console.log("iva usar", ivautilizar);
                          const precioConIva =
                            precioSinIva * (1 + ivautilizar / 100);
                          field.onChange(precioSinIva);
                          console.log("precio con iva", precioConIva);
                          form.setValue("precio", precioConIva,{ shouldValidate: true});
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={false}
                        placeholder="0,00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Precio con IVA */}
              <FormField
                control={form.control}
                name="precio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio con IVA *</FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        value={field.value}
                        readOnly
                        thousandSeparator="."
                        decimalSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={false}
                        placeholder="0,00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Configuración de renovación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de renovación */}
              <FormField
                control={form.control}
                name="renovacion_plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de renovación *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione el tipo de renovación" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dia">Diario</SelectItem>
                        <SelectItem value="mes">Mensual</SelectItem>
                        <SelectItem value="anio">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valor de renovación */}
              <FormField
                control={form.control}
                name="renovacion_valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor de renovación *</FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.floatValue || 1);
                        }}
                        decimalScale={0}
                        allowNegative={false}
                        placeholder="1"
                        min={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Actualizar Plan" : "Crear Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
