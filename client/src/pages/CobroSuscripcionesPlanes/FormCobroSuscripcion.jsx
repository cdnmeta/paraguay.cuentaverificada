import { getCotizacionesEmpresa } from "@/apis/cotizacion-empresa.api";
import { getEntidadesBancarias } from "@/apis/entidades-bancarias.api";
import { getInfoFacturaPago } from "@/apis/facturas-suscripciones.api";
import { getMetodosPago } from "@/apis/metodos-pago";
import { getMonedas } from "@/apis/moneda.api";
import { crearPagoSuscripcion } from "@/apis/pagos-suscripciones.api";
import { ComboBox } from "@/components/customs/comboBoxShadcn/ComboBox1";
import { DatePicker } from "@/components/date-picker1";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { emit, EVENTS } from "@/utils/events";
import { convertirMoneda } from "@/utils/funciones";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
// ⛔️ antes: import z from "zod";
import { z } from "zod";

const detallesPagosSchema = z
  .object({
    fecha_pago: z.date().refine((date) => date <= new Date(), {
      message: "La fecha debe ser anterior o igual a hoy",
    }),
    monto: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z
        .number({
          required_error: "El monto es requerido",
          invalid_type_error: "El monto debe ser numérico",
        })
        .gt(0, { message: "El monto debe ser positivo" })
    ),
    id_metodo_pago: z.string().min(1,"Método de Pago Requerido").transform((val) => Number(val)),
    id_moneda: z.string().min(1,"Moneda Requerida").transform((val) => Number(val)),

    // Preprocesamos para que "" -> undefined y no 0
    id_entidad_financiera: z
      .string()
      .transform((val) => (val ? Number(val) : undefined))
      .optional(),

    numero_comprobante: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Método 5: requiere comprobante y entidad financiera
    if (data.id_metodo_pago === 5 && !data.numero_comprobante?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "El comprobante es requerido",
        path: ["numero_comprobante"],
      });
    }
    if (data.id_metodo_pago === 5 && !data.id_entidad_financiera) {
      ctx.addIssue({
        code: "custom",
        message: "La entidad financiera es requerida",
        path: ["id_entidad_financiera"],
      });
    }
  });

export default function FormCobroSuscripcion({ id_factura,afterSubmit=()=>{} }) {
  const [cargandoInfofactura, startTransition] = useTransition();
  const [metodosPago, setMetodosPago] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [entidadesBancarias, setEntidadesBancarias] = useState([]);
  const [detallesPagos, setDetallesPagos] = useState([]);
  const [recargarInfoFactura, setRecargarInfoFactura] = useState(false);
  const [infoFactura, setInfoFactura] = useState(null);
  const [saldosFactura, setSaldosFactura] = useState(null);

  const loadedFormDataRef = useRef(false);
  const defaultValues = {
    fecha_pago: new Date(),
    monto: undefined,
    descripcion: "",
    id_metodo_pago: "",
    id_moneda: "",
    id_entidad_financiera: "",
    numero_comprobante: "",
  };

  const form = useForm({
    resolver: zodResolver(detallesPagosSchema),
    defaultValues: defaultValues,
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const metodoPagoActual = form.watch("id_metodo_pago"); // string (por Select)

  const cargardatosFormulario = async () => {
    try {
      const [
      responseCotizacion,
      responseMetodosPago,
      responseMonedas,
      responseEntidadesBancarias,
    ] = await Promise.all([
      getCotizacionesEmpresa(),
      getMetodosPago(),
      getMonedas(),
      getEntidadesBancarias(),
    ]);


    // Mapear las respuestas a los estados correspondientes
    const entidadesMapeadas = responseEntidadesBancarias?.data.map(
      (entidad) => ({
        value: entidad.id,
        label: entidad.nombre,
      })
    );
    setCotizaciones(responseCotizacion?.data);
    setMetodosPago(responseMetodosPago?.data);
    setMonedas(responseMonedas?.data);
    setEntidadesBancarias(entidadesMapeadas);

    if (responseCotizacion?.data?.length === 0) {
      toast.warning("No se encontraron cotizaciones.");
    }

    } catch (error) {
      if ([400].includes(error?.response?.status)) {
        toast.error(error?.response?.data?.message || "Error al cargar los datos del formulario", { richColors: true });
        return null;
      }

      toast.error("Error al cargar los datos del formulario", { richColors: true });
    }
  };

  const cargarInfoFactura = async (id) => {
    try {
      const responsegetInfoFacturaPago = await getInfoFacturaPago(id);

      const { detalles_pagos } = responsegetInfoFacturaPago.data;

      startTransition(() => {
        setInfoFactura(responsegetInfoFacturaPago.data);
        setDetallesPagos(detalles_pagos);
      });
    } catch (error) {
      if ([404].includes(error?.response?.status)) {
        toast.error("No se encontró la factura.", { richColors: true });
      }
    }
  };

  useEffect(() => {
    // Datos del formulario (monedas, métodos, etc.) -> solo 1 vez
    if (loadedFormDataRef.current) return;
    loadedFormDataRef.current = true;
    cargardatosFormulario();

  }, []);

  useEffect(() => {
    // Info de la factura al montar y cuando se pida recargar
    if (!id_factura) return;
    cargarInfoFactura(id_factura);
  }, [id_factura, recargarInfoFactura]);

  const calcularSaldos = ()  => {

    try {
      if (cotizaciones.length === 0) return;

    const monedaFactura = infoFactura?.id_moneda || "";
    const totalFactura = infoFactura?.total_factura || 0;
    const pagadoUSD = infoFactura?.pagado_dolares || 0;
    const pagadoGS = infoFactura?.pagado_guaranies || 0;

    console.log("tasas init", cotizaciones);
    const totalFacturaUSD = convertirMoneda(cotizaciones, totalFactura, monedaFactura, 1);
    const totalfacturaPYG = convertirMoneda(cotizaciones, totalFactura, monedaFactura, 2);

    // saldos convertidos a moneda
    const saldoUSD = totalFacturaUSD - pagadoUSD - convertirMoneda(cotizaciones, pagadoGS, 2, monedaFactura);
    const saldoGS = totalfacturaPYG - pagadoGS - convertirMoneda(cotizaciones, pagadoUSD, monedaFactura, 2);

    console.log(saldoUSD, saldoGS);

    console.log(totalFacturaUSD, pagadoUSD , convertirMoneda(cotizaciones, pagadoGS, monedaFactura, 1));

    return { 
      saldoUSD,
      saldoGS
    };
    } catch (error) {
      toast.error("Error al calcular los saldos de la factura.", {
        richColors: true,
      });
      console.log(error);
    }
  }

  useEffect(()=>{
    if (!infoFactura) return;
    if (!cotizaciones.length) return;
    const saldos = calcularSaldos();
    setSaldosFactura(saldos);
  },[cotizaciones, infoFactura]);

  const handleAgregarDetalle = form.handleSubmit(async (data) => {
    try {
      let cotizacion = null;
      if (infoFactura.id_moneda != data.id_moneda) {
        cotizacion = cotizaciones.find(
          (cot) => data.id_moneda == cot.id_moneda_destino
        );
      }
      const idCotizacion = cotizacion ? cotizacion.id : null;

      const dataInsertar = {
        fecha_pago: data.fecha_pago.toISOString(),
        id_factura,
        monto: data.monto,
        id_metodo_pago: data.id_metodo_pago,
        id_moneda: data.id_moneda,
        id_cotizacion: idCotizacion,
      };

      if (data.id_metodo_pago === 5) {
        dataInsertar.numero_comprobante = data.numero_comprobante || null;
        dataInsertar.id_entidad_financiera = data.id_entidad_financiera ?? null;
      }

      await crearPagoSuscripcion(dataInsertar);

      // ✅ Resetear con RHF (no usar refs en Select)
      form.reset(defaultValues, {
        keepErrors: false,
        keepDirty: false,
        keepTouched: false,
        keepIsSubmitted: false,
        keepSubmitCount: false,
      });
      toast.success("Pago registrado correctamente", {
        richColors: true,
      });
      setRecargarInfoFactura((prev) => !prev); // Recargar info de la factura
    } catch (error) {
      if ([400].includes(error?.response?.status)) {
        toast.error(
          error?.response?.data?.message || "Error al crear el pago",
          {
            richColors: true,
          }
        );
      }
    }finally{
      console.log("Emitir ebvento para recargar la lista de pagos");
      emit(EVENTS.SOLICITUDES_PAGOS_ACTUALIZADA,{
        when: new Date(),
      })
    }
  });

  const CabeceraTabla = () => (
    <TableHeader>
      <TableRow>
        <TableHead>Descripción</TableHead>
        <TableHead>Moneda</TableHead>
        <TableHead>Método de Pago</TableHead>
        <TableHead>Monto</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );


  const  mostrarSaldos = (saldo,moneda) => {
    console.log("saldo mostra", saldo)
    if(saldo === null || saldo === undefined) return "Sin definicion";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: moneda,
    }).format(saldo)
  }

  const disabledBotonAgregarDetalle = () => {
    if(form.formState.isSubmitting || !form.formState.isValid) return true
      if(infoFactura.estado == 2 ) return true
      return false;
  }

  const MontosySaldos = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-1">
        <div className="w-full flex flex-col">
          <p className="font-bold">Total Pagar</p>
          <p className="font-bold text-3xl">
            {new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "USD",
            }).format(infoFactura?.total_factura)}
          </p>
        </div>
        <div className="w-full flex flex-col">
          <p className="font-bold">Pagado USD</p>
          <p className="font-bold text-3xl">
            {new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "USD",
            }).format(infoFactura?.pagado_dolares)}
          </p>
        </div>
        <div className="w-full flex flex-col">
          <p className="font-bold">Pagado Gs</p>
          <p className="font-bold text-3xl">
           {mostrarSaldos(infoFactura?.pagado_guaranies, "PYG")}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1  md:grid-cols-3 lg:grid-cols-3 gap-1">
        <div className="w-full flex flex-col">
          <p className="font-bold">Saldos</p>
        </div>
        <div className="w-full flex flex-col">
          <p className="font-bold">Pagar USD</p>
          <p className="font-bold text-3xl">
            {mostrarSaldos(saldosFactura?.saldoUSD, "USD")}
          </p>
        </div>
        <div className="w-full flex flex-col">
          <p className="font-bold">Pagar PYG</p>
          <p className="font-bold text-3xl">
           {mostrarSaldos(saldosFactura?.saldoGS, "PYG")}
          </p>
        </div>
      </div>
    </>
  );

  if (cargandoInfofactura || !infoFactura) {
    return <p>Cargando información de la factura...</p>;
  }
  if(infoFactura && cotizaciones.length === 0) return <p>No hay cotizaciones disponibles</p>;

  return (
    <div className="w-full space-y-3">
      <MontosySaldos />
      <Form {...form}>
        <form className="space-y-2">
          <div className="grid grid-cols-12 gap-2">
            {/* Fecha */}
            <div className="col-span-12 md:col-span-3 lg:col-span-3">
              <FormField
                control={form.control}
                name="fecha_pago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Fecha</FormLabel>
                    <FormControl>
                      <DatePicker {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Moneda */}
            <div className="col-span-12 md:col-span-3 flex items-end">
              <FormField
                control={form.control}
                name="id_moneda"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Moneda</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange} // string -> number en Zod
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione una moneda" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        {monedas.map((moneda) => (
                          <SelectItem key={moneda.id} value={String(moneda.id)}>
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

            {/* Método de pago */}
            <div className="col-span-12 md:col-span-3 flex items-end">
              <FormField
                control={form.control}
                name="id_metodo_pago"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Método de Pago</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione un método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        {metodosPago.map((metodo) => (
                          <SelectItem key={metodo.id} value={String(metodo.id)}>
                            {metodo.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Monto */}
            <div className="col-span-12 md:col-span-3 lg:col-span-3">
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Monto</FormLabel>
                    <FormControl>
                      <NumericFormat
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.floatValue);
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        customInput={Input}
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={false}
                        placeholder="Ingrese el monto"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campos condicionales para método = 5 */}
            {Number(metodoPagoActual) === 5 && (
              <>
                <div className="col-span-12 md:col-span-3 lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="numero_comprobante"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Número de Comprobante
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-12 md:col-span-3 lg:col-span-3 flex items-end">
                  <Controller
                    control={form.control}
                    name="id_entidad_financiera"
                    render={({ field }) => (
                      <div className="flex-1">
                      <ComboBox
                        items={entidadesBancarias}
                        onChange={field.onChange}
                        value={field.value}
                        placeholder="Seleccione una entidad"
                        error={!!form.formState.errors.id_entidad_financiera}
                      />
                      {form.formState.errors.id_entidad_financiera && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.id_entidad_financiera.message}
                        </p>
                      )}
                      </div>
                    )}
                  />
                </div>
              </>
            )}
          </div>

          <div className="w-full flex justify-end mt-2">
            <Button disabled={disabledBotonAgregarDetalle()} type="button" onClick={handleAgregarDetalle}>
              Agregar Detalle
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-4">
        <h3 className="text-lg font-medium">Detalles de Cobro</h3>
        <Table>
          <CabeceraTabla />
          <TableBody>
            {detallesPagos.map((detalle, index) => (
              <TableRow key={index}>
                <TableCell>
                  {detalle?.numero_comprobante || "Sin comprobante"}
                </TableCell>
                <TableCell>{detalle.moneda}</TableCell>
                <TableCell>{detalle.metodo_pago_descripcion}</TableCell>
                <TableCell>
                  {Intl.NumberFormat("es-ES", {
                    style: "currency",
                    currency: detalle.moneda_sigla,
                  }).format(detalle.monto)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    onClick={() => {
                      /* eliminar */
                    }}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
