import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { getMonedas } from "@/apis/moneda.api";
import {
  actualizarMovimientoSemaforo,
  crearMovimientoSemaforo,
  obtenerMovimientoSemaforo,
} from "@/apis/semaforoFinanciero.api";
import { useNavigate } from "react-router-dom";
import { BASE_URL, routes } from "@/pages/SemaforoFinanciero/config/routes";
import { DatePicker } from "@/components/date-picker1";
import { TIPOS_MOVIMIENTOS } from "../utils/constanst";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema de validación
const movimientoSchema = z.object({
  titulo: z
    .string()
    .min(1, "El título es requerido")
    .max(255, "El título es muy largo"),
  tipo_movimiento: z.coerce
    .number({ required_error: "Seleccione un tipo de movimiento" })
    .min(1, "Seleccione un tipo de movimiento"),
  monto: z.coerce
    .number({ required_error: "El monto es requerido" })
    .refine((val) => val > 0, "El monto debe ser mayor a cero"),
  id_moneda: z.coerce
    .number({ required_error: "Seleccione una moneda" })
    .min(1, "Seleccione una moneda"),
  observacion: z.string().max(500, "La observación es muy larga").optional(),
  fecha_vencimiento: z
    .date({
      invalid_type_error: "La fecha de vencimiento debe ser una fecha válida",
    })
    .optional()
    .nullable(),
});

// Constantes
const TIPOS_MOVIMIENTO = [
  { value: "1", label: "Ingreso fijo" },
  { value: "2", label: "Ingreso Extra" },
  { value: "3", label: "Gasto Fijo" },
  { value: "4", label: "Gasto Extra" },
  { value: "5", label: "Cuentas Por Pagar" },
  { value: "6", label: "Cuentas Por Cobrar" },
];

const ESTADOS = [
  { value: "1", label: "Pendiente" },
  { value: "2", label: "Pagado" },
  { value: "3", label: "Cobrado" },
];

const FormSemaforoFinancieroMovimiento = ({
  id_movimiento,
  onSuccess,
  tipoMovimiento = TIPOS_MOVIMIENTOS.INGRESO_FIJO,
}) => {
  const [monedas, setMonedas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(movimientoSchema),
    defaultValues: {
      titulo: "",
      tipo_movimiento: "",
      fecha_vencimiento: null,
      id_estado: "",
      monto: "",
      id_moneda: "",
      observacion: "",
    },
    reValidateMode: "onChange",
  });

  const habilitarFechaVencimiento =
    form.watch("tipo_movimiento") == TIPOS_MOVIMIENTOS.CUENTAS_POR_COBRAR ||
    form.watch("tipo_movimiento") == TIPOS_MOVIMIENTOS.CUENTAS_POR_PAGAR;

  useEffect(() => {
    if (!habilitarFechaVencimiento) form.setValue("fecha_vencimiento", null);
  }, [habilitarFechaVencimiento, form]);

  // Cargar monedas al montar el componente
  useEffect(() => {
    const cargarMonedas = async () => {
      try {
        const response = await getMonedas();
        setMonedas(response.data);
      } catch (error) {
        console.error("Error al cargar monedas:", error);
        toast.error("Error al cargar las monedas");
      }
    };

    if (tipoMovimiento) {
      form.setValue("tipo_movimiento", tipoMovimiento.toString());
    }

    cargarMonedas();
  }, [form, tipoMovimiento]);

  // Cargar datos del movimiento si es edición
  useEffect(() => {
    if (id_movimiento) {
      const cargarMovimiento = async () => {
        try {
          setLoadingData(true);
          const response = await obtenerMovimientoSemaforo(id_movimiento);
          const data = response.data;

          // Rellenar el formulario con los datos
          form.setValue("titulo", data.titulo);
          form.setValue("tipo_movimiento", data.tipo_movimiento.toString());
          form.setValue("id_estado", data.id_estado?.toString() || "");
          form.setValue("monto", data.monto);
          form.setValue("id_moneda", data.id_moneda.toString());
          form.setValue("observacion", data.observacion || "");
          form.setValue(
            "fecha_vencimiento",
            data.fecha_vencimiento ? new Date(data.fecha_vencimiento) : null
          );
        } catch (error) {
          console.error("Error al cargar movimiento:", error);
          toast.error("Error al cargar los datos del movimiento");
          if (error.response?.status === 404) {
            navigate(`/${routes.index}`);
          }
        } finally {
          setLoadingData(false);
        }
      };

      cargarMovimiento();
    }
  }, [id_movimiento, navigate, form]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Convertir strings a números donde sea necesario
      const payload = {
        ...data,
        tipo_movimiento: data.tipo_movimiento,
        id_moneda: data.id_moneda,
        fecha_vencimiento: data.fecha_vencimiento
          ? new Date(data.fecha_vencimiento).toISOString()
          : null,
      };

      if (id_movimiento) {
        // Actualizar movimiento existente
        await actualizarMovimientoSemaforo(id_movimiento, payload);
        toast.success("Movimiento actualizado exitosamente");
      } else {
        // Crear nuevo movimiento
        await crearMovimientoSemaforo(payload);
        toast.success("Movimiento creado exitosamente");
        form.reset(); // Limpiar formulario después de crear
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error al guardar movimiento:", error);
      const message =
        error.response?.data?.message || "Error al guardar el movimiento";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Cargando datos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Título */}
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ingrese el título del movimiento"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monto */}
          <FormField
            control={form.control}
            name="monto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto *</FormLabel>
                <FormControl>
                  <NumericFormat
                    customInput={Input}
                    value={field.value}
                    onValueChange={(values) => {
                      field.onChange(values.value);
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    allowNegative={false}
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Moneda */}
          <FormField
            control={form.control}
            name="id_moneda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className={"w-full"}>
                      <SelectValue placeholder="Seleccione una moneda" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {monedas.map((moneda) => (
                      <SelectItem key={moneda.id} value={moneda.id.toString()}>
                        {moneda.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Campo de tipo de movimiento - solo visible en edición */}
        {id_movimiento && (
          <FormField
            control={form.control}
            name="tipo_movimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Movimiento *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un tipo de movimiento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIPOS_MOVIMIENTO.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {habilitarFechaVencimiento && (
          <FormField
            control={form.control}
            name="fecha_vencimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Vencimiento</FormLabel>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccione una fecha"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Observación */}
        <FormField
          control={form.control}
          name="observacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Ingrese observaciones adicionales (opcional)"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {id_movimiento ? "Actualizando..." : "Guardando..."}
              </>
            ) : id_movimiento ? (
              "Actualizar Movimiento"
            ) : (
              "Crear Movimiento"
            )}
          </Button>
          {!id_movimiento && (
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
  );
};

export default FormSemaforoFinancieroMovimiento;
