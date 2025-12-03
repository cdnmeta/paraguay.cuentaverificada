import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { Loader2, Save, Edit3, Plus, Trash2, AlertCircle, Info } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Switch } from "@/components/ui/switch";

// APIs
import { getPlanById, createPlan, updatePlan, getPlanesTiposRepartir } from "@/apis/planes.api";

// Schema de validación Zod basado en el DTO CreatePlanPayloadDto
const planSchema = z.object({
  descripcion: z.string().min(1, "La descripción del plan es obligatoria"),
  nombre: z.string().min(1, "El nombre del plan es obligatorio"),
  precio: z.coerce
    .number({
      invalid_type_error: "El precio del plan debe ser un número",
      required_error: "El precio del plan es obligatorio",
    }),
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
  precio_oferta: z.coerce.number({
    invalid_type_error: "El precio de oferta debe ser un número",
  }).optional(),
  esta_en_oferta: z.boolean().optional(),
  porcentajes_repartir: z
    .array(
      z.object({
        id_tipo: z.coerce.number({
          required_error: "El tipo de reparto es obligatorio",
          invalid_type_error: "El tipo de reparto debe ser un número",
        }),
        porcentaje_primera_venta: z.coerce
          .number({
            required_error: "El porcentaje es obligatorio",
            invalid_type_error: "El porcentaje debe ser un número",
          })
          .min(0, "El porcentaje debe ser al menos 0")
          .max(100, "El porcentaje no puede ser mayor a 100"),
        porcentaje_venta_recurrente: z.coerce
          .number({
            required_error: "El porcentaje es obligatorio",
            invalid_type_error: "El porcentaje debe ser un número",
          })
          .min(0, "El porcentaje debe ser al menos 0")
          .max(100, "El porcentaje no puede ser mayor a 100"),
      }),
    )
    .min(1, "Debe haber al menos un tipo de reparto")
    .refine(
      (data) => {
        const tipos = data.map((item) => item.id_tipo);
        return new Set(tipos).size === tipos.length;
      },
      {
        message: "No puede haber tipos de reparto duplicados",
      }
    )
    .refine(
      (data) => {
        const suma_primera_venta = data.reduce((sum, item) => sum + item.porcentaje_primera_venta, 0);
        return suma_primera_venta === 100;
      },
      {
        message: "La suma de porcentajes de primera venta debe ser exactamente 100%",
      }
    )
    .refine(
      (data) => {
        const suma_venta_recurrente = data.reduce((sum, item) => sum + item.porcentaje_venta_recurrente, 0);
        return suma_venta_recurrente === 100;
      },
      {
        message: "La suma de porcentajes de venta recurrente debe ser exactamente 100%",
      }
    ),
  
}).superRefine((data, ctx) => {
  if (data.esta_en_oferta) {
    if (data.precio_oferta === undefined || data.precio_oferta === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El precio de oferta es obligatorio cuando el plan está en oferta",
      });
    }
  }
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
  const [tiposReparto, setTiposReparto] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const isEditMode = Boolean(id);

  // Estado para el formulario de agregar tipo de reparto
  const [nuevoTipo, setNuevoTipo] = useState({
    id_tipo: "",
    porcentaje_primera_venta: "",
    porcentaje_venta_recurrente: ""
  });

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
      precio_oferta: null,
      porcentajes_repartir: [],
      esta_en_oferta: false,
    },
  });

  // Cargar tipos de reparto desde la API
  const loadTiposReparto = useCallback(async () => {
    try {
      setLoadingTipos(true);
      const response = await getPlanesTiposRepartir();
    
        // Filtrar solo tipos activos
        const tiposFiltrados = response.data
        setTiposReparto(tiposFiltrados);
     
    } catch (error) {
      console.error("Error loading tipos reparto:", error);
      toast.error("Error al cargar los tipos de reparto");
      setTiposReparto([]);
    } finally {
      setLoadingTipos(false);
    }
  }, []);

  // Cargar datos del plan cuando esté en modo edición

  const loadPlanData = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingData(true);
      const response = await getPlanById(id);

      if (response.status === 200) {
        const planData = response.data;
        
        // Convertir planes_descuentos a porcentajes_repartir
        let porcentajes_repartir = [];
        if (planData.porcentajes_reparto && Array.isArray(planData.porcentajes_reparto)) {
          porcentajes_repartir = planData.porcentajes_reparto
            .map(descuento => ({
              id_tipo: descuento.id_tipo,
              porcentaje_primera_venta: descuento.porcentaje_primera_venta,
              porcentaje_venta_recurrente: descuento.porcentaje_venta_recurrente
            }));
        }

        form.reset({
          descripcion: planData.descripcion || "",
          nombre: planData.nombre || "",
          precio: planData.precio || 0,
          precio_sin_iva: planData.precio_sin_iva || 0,
          renovacion_plan: planData.renovacion_plan || "mes",
          renovacion_valor: planData.renovacion_valor || 1,
          tipo_iva: planData.tipo_iva?.toString() || "3",
          esta_en_oferta: planData.esta_en_oferta || false,
          precio_oferta: String(planData.precio_oferta) || "",
          porcentajes_repartir: porcentajes_repartir,
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
    loadTiposReparto();
  }, [loadTiposReparto]);

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

  // Funciones helper para porcentajes
  const calcularPorcentajesTotales = (porcentajes) => {
    const totalPrimera = porcentajes.reduce((sum, p) => sum + (Number(p.porcentaje_primera_venta) || 0), 0);
    const totalRecurrente = porcentajes.reduce((sum, p) => sum + (Number(p.porcentaje_venta_recurrente) || 0), 0);
    return { totalPrimera, totalRecurrente };
  };

  const agregarTipoReparto = () => {
    if (!nuevoTipo.id_tipo) {
      toast.error("Debe seleccionar un tipo de reparto");
      return;
    }

    const currentValues = form.getValues("porcentajes_repartir");
    const tiposUsados = currentValues.map(p => p.id_tipo);
    
    if (tiposUsados.includes(parseInt(nuevoTipo.id_tipo))) {
      toast.error("Este tipo de reparto ya está agregado");
      return;
    }

    form.setValue("porcentajes_repartir", [
      ...currentValues,
      {
        id_tipo: parseInt(nuevoTipo.id_tipo),
        porcentaje_primera_venta: parseFloat(nuevoTipo.porcentaje_primera_venta) || 0,
        porcentaje_venta_recurrente: parseFloat(nuevoTipo.porcentaje_venta_recurrente) || 0,
      }
    ]);

    // Limpiar el formulario
    setNuevoTipo({
      id_tipo: "",
      porcentaje_primera_venta: "",
      porcentaje_venta_recurrente: ""
    });

    toast.success("Tipo de reparto agregado exitosamente");
  };

  const eliminarTipoReparto = (index) => {
    const currentValues = form.getValues("porcentajes_repartir");
    const newValues = currentValues.filter((_, i) => i !== index);
    form.setValue("porcentajes_repartir", newValues);
    toast.success("Tipo de reparto eliminado");
  };

  // Watch para obtener los porcentajes actuales y recalcular tipos disponibles
  const currentPorcentajes = form.watch("porcentajes_repartir");
  
  // Obtener tipos disponibles para el select (reactivo)
  const getTiposDisponibles = () => {
    const tiposUsados = currentPorcentajes.map(p => p.id_tipo);
    return tiposReparto.filter(t => !tiposUsados.includes(t.id));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // ver los datos a enviar
      console.log("Datos a enviar:", data);

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

  if (loadingData || loadingTipos) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {loadingData ? "Cargando datos del plan..." : "Cargando tipos de reparto..."}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log(form.watch())

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

            {/* Switch para habilitar precio de oferta */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="esta_en_oferta"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Precio en oferta
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Habilitar precio promocional para este plan
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Precio de Oferta - Solo visible si está habilitado */}
              {form.watch("esta_en_oferta") && (
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="precio_oferta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio de Oferta *</FormLabel>
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
                            fixedDecimalScale
                            allowNegative={false}
                            placeholder="Ingrese el precio de oferta"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-yellow-400 text-sm">Atención: El precio de oferta será el precio que se mostrará en lugar del precio regular e influirá en las ganancias y repartos correspondientes.</p>
                </div>
              )}
            </div>

            {/* Gestión de Porcentajes de Reparto */}
            <div className="space-y-6">
              <div className="border-t pt-6">
                <h3 className="text-lg text-foreground font-semibold mb-4">Tipos de Reparto y Porcentajes</h3>
                
                {/* Formulario para agregar nuevo tipo */}
                <div className="border rounded-lg p-4 space-y-4 mb-6">
                  <h4 className="font-medium">Agregar Tipo de Reparto</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Select de tipo */}
                    <div className="space-y-2 mt-2">
                      <label className="text-sm font-medium">Tipo de Reparto</label>
                      <Select 
                        value={nuevoTipo.id_tipo} 
                        onValueChange={(value) => setNuevoTipo({...nuevoTipo, id_tipo: value})}
                      >
                        <SelectTrigger className={'w-full'}>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTiposDisponibles().map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id.toString()}>
                              {tipo.descripcion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Input porcentaje primera venta */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Primera Venta (%)</label>
                      <NumericFormat
                        customInput={Input}
                        value={nuevoTipo.porcentaje_primera_venta}
                        onValueChange={(values) => {
                          setNuevoTipo({...nuevoTipo, porcentaje_primera_venta: values.value || ""});
                        }}
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={false}
                        max={100}
                        placeholder="0,00"
                        suffix="%"
                      />
                    </div>

                    {/* Input porcentaje venta recurrente */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Venta Recurrente (%)</label>
                      <NumericFormat
                        customInput={Input}
                        value={nuevoTipo.porcentaje_venta_recurrente}
                        onValueChange={(values) => {
                          setNuevoTipo({...nuevoTipo, porcentaje_venta_recurrente: values.value || ""});
                        }}
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={false}
                        max={100}
                        placeholder="0,00"
                        suffix="%"
                      />
                    </div>

                    {/* Botón agregar */}
                    <Button
                      type="button"
                      onClick={agregarTipoReparto}
                      className="flex items-center gap-2"
                      disabled={getTiposDisponibles().length === 0}
                    >
                      <Plus className="h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                </div>

                {/* Alert informativo */}
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Los porcentajes deben sumar exactamente 100% tanto para primera venta como para ventas recurrentes. 
                    Configure todos los tipos de reparto necesarios incluyendo el porcentaje para la empresa.
                  </AlertDescription>
                </Alert>

                {/* Lista de tipos de reparto */}
                <FormField
                  control={form.control}
                  name="porcentajes_repartir"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-3">
                        {field.value.map((porcentaje, index) => {
                          const tipoLabel = tiposReparto.find(t => t.id === porcentaje.id_tipo)?.descripcion || `Tipo ${porcentaje.id_tipo}`;
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                              <div className="flex items-center gap-4">
                                <div className="font-medium text-gray-900">
                                  {tipoLabel}
                                </div>
                                <div className="flex gap-4 text-sm text-gray-600">
                                  <span>Primera Venta: <strong>{porcentaje.porcentaje_primera_venta}%</strong></span>
                                  <span>Recurrente: <strong>{porcentaje.porcentaje_venta_recurrente}%</strong></span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarTipoReparto(index)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                        
                        {field.value.length === 0 && (
                          <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                            <p>No hay tipos de reparto configurados.</p>
                            <p className="text-sm">Use el formulario superior para agregar tipos.</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Mostrar totales */}
                      {field.value.length > 0 && (
                        <div className="mt-4 p-3 rounded-lg border">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Total Primera Venta: </span>
                              <span className={`${calcularPorcentajesTotales(field.value).totalPrimera !== 100 ? 'text-red-600 font-bold' : 'text-green-600 font-semibold'}`}>
                                {calcularPorcentajesTotales(field.value).totalPrimera}%
                              </span>
                              {calcularPorcentajesTotales(field.value).totalPrimera !== 100 && (
                                <span className="text-red-500 text-xs ml-2">
                                  (Falta: {100 - calcularPorcentajesTotales(field.value).totalPrimera}%)
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Total Recurrente: </span>
                              <span className={`${calcularPorcentajesTotales(field.value).totalRecurrente !== 100 ? 'text-red-600 font-bold' : 'text-green-600 font-semibold'}`}>
                                {calcularPorcentajesTotales(field.value).totalRecurrente}%
                              </span>
                              {calcularPorcentajesTotales(field.value).totalRecurrente !== 100 && (
                                <span className="text-red-500 text-xs ml-2">
                                  (Falta: {100 - calcularPorcentajesTotales(field.value).totalRecurrente}%)
                                </span>
                              )}
                            </div>
                          </div>
                          {(calcularPorcentajesTotales(field.value).totalPrimera !== 100 || calcularPorcentajesTotales(field.value).totalRecurrente !== 100) && (
                            <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Los porcentajes deben sumar exactamente 100% para cada tipo de venta.
                            </div>
                          )}
                        </div>
                      )}
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
