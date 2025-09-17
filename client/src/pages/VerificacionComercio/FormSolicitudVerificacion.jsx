// FormSolicitudVerificacion.jsx (versión 2 forms independientes)
import React, { useEffect, useMemo, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  comercioSchema,
  comercioUpdateSchema,
  comercioVerificacionInformacion,
  updateComercioVerificacionInformacion,
} from "./schemas/comercio";
import paisesCode from "@/utils/countries.json";
import { getComercioById } from "@/apis/comercios.api";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
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

import {
  verificarInformacionComercio,
  actualizarVerificacionComercio,
} from "@/apis/verificacioComercios"; // <- ajusta a tu ruta real
import { ComboBox } from "@/components/customs/comboBoxShadcn/ComboBox1";
import { emit, EVENTS } from "@/utils/events";

const array_estados_habilitar_edicion_info_verificacion = [2, 3, 5];

export default function FormSolicitudVerificacion({
  idComercio = null,
  refreshTrigger = 0,
}) {
  const [loadingComercio, startTransition] = useTransition();
  const [isEditar, setIsEditar] = useState(false);
  const [paises, setPaises] = useState([]);
  const { user } = useAuthStore();
  const [comercioData, setComercioData] = useState(null);

  // --- FORM A: Crear / Editar comercio ---
  const formA = useForm({
    resolver: zodResolver(isEditar ? comercioUpdateSchema : comercioSchema),
    defaultValues: {
      razonSocial: "",
      ruc: "",
      telefono: "",
      codigoVendedor: "",
      aceptaTerminos: false,
      codigoPais: "",
      comprobantePago: undefined,
    },
  });

  // --- FORM B: Verificación ---
  const formB = useForm({
    resolver: zodResolver(
      isEditar
        ? updateComercioVerificacionInformacion
        : comercioVerificacionInformacion
    ),
    defaultValues: {
      correo_empresa: "",
      url_maps: "",
      foto_interior: undefined,
      foto_exterior: undefined,
      cedula_frontal: undefined,
      cedula_reverso: undefined,
      factura_servicio: undefined,
    },
  });

  useEffect(() => {
    const loadPaises = () => {
      const paisesMap = paisesCode.map((pais) => {
        return {
          label: `${pais.name} +(${pais.dial_code})`,
          value: pais.code,
        };
      });
      setPaises(paisesMap);
    };

    loadPaises();
  }, []);

  // --- Helpers ---
  const habilitarCargarDatosVerificacion = () => {
    if (
      array_estados_habilitar_edicion_info_verificacion.includes(
        comercioData?.estado
      )
    ) {
      return true;
    }
    if (comercioData?.estado === 4) {
      // Verificado
      return false;
    }
    return false;
  };

  // --- Carga de comercio ---
  useEffect(() => {
    const loadComercioData = async (id) => {
      if (!id) return;
      try {
        // Reset ambos forms
        formA.reset();
        formB.reset();
        setIsEditar(false);

        const response = await getComercioById(id);
        const comercio = response.data;
        if (!comercio) return;

        setComercioData(comercio);
        setIsEditar(true);

        // Pre-cargar Form A
        formA.reset({
          razonSocial: comercio.razon_social ?? "",
          ruc: comercio.ruc ?? "",
          telefono: comercio.telefono ?? "",
          dialCode: comercio.dial_code ?? "",
          codigoPais: comercio.codigo_pais ?? "",
          codigoVendedor: "",
          aceptaTerminos: false,
          comprobantePago: undefined,
        });

        // Si corresponde, pre-cargar Form B (solo campos de texto)
        if (habilitarCargarDatosVerificacion() || comercio.estado === 5) {
          formB.reset({
            correo_empresa: comercio.correo_empresa ?? "",
            url_maps: comercio.urlmaps ?? "",
            foto_interior: undefined,
            foto_exterior: undefined,
            cedula_frontal: undefined,
            cedula_reverso: undefined,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar comercio");
      }
    };

    startTransition(() => loadComercioData(idComercio));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idComercio, refreshTrigger]);

  // --- Submit A ---
  const onSubmitA = async (data) => {
    try {
      const fd = new FormData();
      const payload = {
        ...data,
        telefono: `${data.telefono}`,
        prefijoTelefono: data.dialCode,
        id_usuario: user?.id,
      };

      Object.entries(payload).forEach(([k, v]) => {
        if (k === "comprobantePago") {
          if (!isEditar || (comercioData.estado === 6 && v?.[0]))
            fd.append(k, v[0]); // sólo crear exige archivo
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
      formA.reset();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Error al enviar solicitud"
      );
    }
  };

  // --- Submit B ---
  const onSubmitB = async (data) => {
    try {
      const fd = new FormData();
      fd.append("correo_empresa", data.correo_empresa);
      fd.append("url_maps", data.url_maps);
      fd.append("foto_interior", data.foto_interior);
      fd.append("foto_exterior", data.foto_exterior);
      fd.append("cedula_frontal", data.cedula_frontal);
      fd.append("cedula_reverso", data.cedula_reverso);
      fd.append("imagen_factura_servicio", data.factura_servicio);
      fd.append("direccion", data.direccion);

      fd.append("id_comercio", comercioData.id);

      console.log(comercioData);

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
      formB.reset({
        correo_empresa: data.correo_empresa,
        url_maps: data.url_maps,
        foto_interior: undefined,
        foto_exterior: undefined,
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Error al verificar información"
      );
    }
  };


  // --- Render bloques ---
  const BloqueRegistroEdicion = () => (
    <Form {...formA}>
      <form onSubmit={formA.handleSubmit(onSubmitA)} className="space-y-6">
        {/* Razón Social */}
        <FormField
          control={formA.control}
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
          control={formA.control}
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
              control={formA.control}
              name="codigoPais"
              render={({ field }) => (
                <FormItem className="w-[180px]">
                  <FormControl>
                    <ComboBox
                      items={paises}
                      placeholder="Seleccione el Pais"
                      onChange={(value) => {
                        const paisSeleccionado = paisesCode.find(
                          (p) => p.code === value
                        );
                        field.onChange(value);
                        formA.setValue(
                          "dialCode",
                          paisSeleccionado?.dial_code || ""
                        );
                      }}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex-1">
              <FormField
                control={formA.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Ej: 0983123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <input type="hidden" {...formA.register("dialCode")} />
        </div>

        {/* Comprobante (sólo crear o estado 6) */}
        {(!isEditar || comercioData?.estado === 6) && (
          <FormField
            control={formA.control}
            name="comprobantePago"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Comprobante de Pago <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WEBP. Máx: 5MB
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {!isEditar && (
          <FormField
            control={formA.control}
            name="codigoVendedor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Código de Vendedor{" "}
                  <span className="text-gray-400">(opcional)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el código" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Acepta términos (sólo crear) */}
        {!isEditar && (
          <FormField
            control={formA.control}
            name="aceptaTerminos"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aceptaTerminos"
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="aceptaTerminos" className="text-sm">
                    Acepto los{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Aquí irían los términos legales");
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Términos y Condiciones
                    </a>{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Botón/confirmación */}
        <ConfirmDialog
          confirmDialogTitle={
            isEditar
              ? "Confirmar actualización"
              : "Confirmar solicitud de Verificación"
          }
          confirmDialogDescripcion={
            <>
              <p>
                {isEditar
                  ? "¿Guardar cambios del comercio?"
                  : "¿Estás seguro de enviar esta solicitud?"}
              </p>
              {!isEditar && (
                <p>
                  <b>Esta acción no se puede deshacer.</b>
                </p>
              )}
            </>
          }
          buttonActivate={
            <Button
              type="button"
              className="w-full"
              disabled={formA.formState.isSubmitting}
            >
              {formA.formState.isSubmitting
                ? isEditar
                  ? "Guardando..."
                  : "Enviando..."
                : isEditar
                ? "Guardar cambios"
                : "Solicitar Verificación"}
            </Button>
          }
          onConfirm={() => formA.handleSubmit(onSubmitA)()}
        />
      </form>
    </Form>
  );

  const BloqueVerificacion = () => (
    <Form {...formB}>
      <form
        onSubmit={formB.handleSubmit(onSubmitB)}
        className="mt-2 flex flex-col gap-4"
      >
        <h3 className="text-lg font-semibold text-center">
          {comercioData?.razon_social} - {comercioData?.ruc}
        </h3>

        {/* Correo */}
        <FormField
          control={formB.control}
          name="correo_empresa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo de la Empresa</FormLabel>
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
          control={formB.control}
          name="url_maps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de Google Maps</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="https://maps.google.com/..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dirección Comercial */}
        <FormField
          control={formB.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Direccion de Comercio </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Ingrese la dirección comercial"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fotos interior / exterior */}
        <div className="flex flex-col md:flex-row gap-2">
          <FormField
            control={formB.control}
            name="foto_interior"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Foto del interior del local</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={formB.control}
            name="foto_exterior"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Foto del exterior del local</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        <FormField
          control={formB.control}
          name="factura_servicio"
          render={({ field }) => (
            <FormItem className="flex-1 w-full">
              <FormLabel>Factura Servicio (Ande)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={formB.formState.isSubmitting}
        >
          {formB.formState.isSubmitting ? "Cargando..." : "Enviar verificación"}
        </Button>
      </form>
    </Form>
  );

  // --- Render principal ---
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {isEditar ? "Editar Comercio" : "Registrar Comercio"}
        </CardTitle>
        <CardDescription className="text-center">
          Complete el formulario para {isEditar ? "editar" : "registrar"} su
          comercio
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Siempre muestra el Form A al cargar la página */}

        {/* Renderiza Form B si corresponde según estado */}
        {habilitarCargarDatosVerificacion() ? (
          <BloqueVerificacion />
        ) : (
          <BloqueRegistroEdicion />
        )}
      </CardContent>
    </Card>
  );
}
