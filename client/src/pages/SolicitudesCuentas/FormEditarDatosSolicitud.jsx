import React, { useEffect, useRef, useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
// ShadCN UI
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  IMAGE_SCHEMA_NO_REQUERIDO,
  REGEX_CEDULA_IDENTIDAD,
} from "@/utils/constants";
import paisesCode from "@/utils/paises-flag.json";
import { ComboBox } from "@/components/customs/comboBoxShadcn/ComboBox1";
import {
  actualizarDatosSolicitud,
  getSolicitudesCuentaById,
} from "@/apis/verificacionCuenta.api";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingSpinner from "@/components/customs/loaders/LoadingSpinner";
import { format, isSameDay } from "date-fns";
import { storage } from "@/firebaseConfig";
import { useStorageURL } from "@/hooks/useStorageURL";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react";
import NoImage from "@/components/customs/NoImage";
import { DatePicker } from "@/components/date-picker1";
import { apiDateToLocal } from "@/utils/funciones";
// --- Zod schema (JSX/JS puro) ---
const MAX_FILE_SIZE_MB = 5;

// Validación para inputs de imagen opcionales
const imageFileSchema = z
  .any()
  .optional()
  .refine((files) => !files || files.length <= 1, "Solo se permite un archivo")
  .refine((files) => {
    if (!files || files.length === 0) return true; // opcional
    const f = files[0];
    return f && typeof f.type === "string" && f.type.startsWith("image/");
  }, "El archivo debe ser una imagen válida")
  .refine((files) => {
    if (!files || files.length === 0) return true; // opcional
    const f = files[0];
    return f && f.size <= MAX_FILE_SIZE_MB * 1024 * 1024;
  }, `La imagen debe pesar hasta ${MAX_FILE_SIZE_MB}MB`);

const formSchema = z.object({
  correo: z.string().email("Correo inválido"),
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  apellido: z.string().min(2, "Mínimo 2 caracteres"),
  codigo_pais: z.string().min(1, "Seleccione un país"),
  telefono: z
    .string()
    .min(6, "Ingrese un teléfono válido")
    .max(20, "Muy largo"),
  documento: z.string().regex(REGEX_CEDULA_IDENTIDAD, "Documento inválido"),
  cedula_frente: IMAGE_SCHEMA_NO_REQUERIDO,
  cedula_reverso: IMAGE_SCHEMA_NO_REQUERIDO,
  selfie_user: IMAGE_SCHEMA_NO_REQUERIDO,
  fecha_nacimiento: z
    .date({ invalid_type_error: "Fecha inválida" })
    .optional()
    .refine((d) => {
      if (!d) return true;
      const hoy = new Date();
      return !isSameDay(d, hoy);
    }, "La fecha no puede ser hoy"),
});

const defaultValues = {
  correo: "",
  nombre: "",
  apellido: "",
  codigo_pais: "",
  telefono: "",
  documento: "",
  ciudad: "",
  cedula_frente: undefined,
  cedula_reverso: undefined,
  selfie_user: undefined,
  fecha_nacimiento: undefined,
};

export default function FormEditarDatosSolicitud({
  id = null,
  afterSubmit = () => {},
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    mode: "onBlur",
  });

  const [datosVerificados, setDatosVerificados] = useState(false);
  const loadPaises = () => {
    const paises = paisesCode.map((p) => ({
      value: p.code,
      countryCode: p.countryCode,
      label: `+(${p.countryCode}) ${p.country}`,
      flag: p.flag,
    }));
    return paises;
  };
  const paises = loadPaises();

  // Estado para guardar las rutas de las imágenes de la cédula
  const [cedulaFrontalPath, setCedulaFrontalPath] = useState(null);
  const [cedulaReversoPath, setCedulaReversoPath] = useState(null);
  const [selfieUserPath, setSelfieUserPath] = useState(null);

  const [solicitudData, setSolicitudData] = useState(null);

  // Hooks para obtener las URLs de las imágenes desde Firebase Storage
  const { url: urlCedulaFrontal } = useStorageURL(storage, cedulaFrontalPath);
  const { url: urlCedulaReverso } = useStorageURL(storage, cedulaReversoPath);
  const { url: urlSelfieUser } = useStorageURL(storage, selfieUserPath);

  const fetchData = async () => {
    try {
      const response = await getSolicitudesCuentaById(id);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula retardo
      if (response.status === 200) {
        const data = response.data;
        setSolicitudData(data);
        setCedulaFrontalPath(data.cedula_frente);
        setCedulaReversoPath(data.cedula_reverso);
        setSelfieUserPath(data.selfie);
        const dialCode = paises.find(
          (p) => p.countryCode === Number(data.dial_code)
        );
        const {
          cedula_frente,
          cedula_reverso,
          selfie,
          fecha_nacimiento,
          ...dataRest
        } = data;
        form.reset({
          ...dataRest,
          correo: data.email,
          codigo_pais: dialCode ? String(dialCode.value) : "",
          fecha_nacimiento: fecha_nacimiento
            ? apiDateToLocal(fecha_nacimiento)
            : undefined,
        });
      }
    } catch (error) {
      if ([404].includes(error?.response?.status)) {
        toast.error("Solicitud no encontrada");
        return;
      }
      console.error("Error al cargar los datos de la solicitud:", error);
    }
  };

  useEffect(() => {
    if (id) {
      // Cargar datos de la solicitud por ID
      startTransition(() => fetchData());
    }
  }, [id]);

  // Actualiza las previsualizaciones cuando las URLs cambian
  useEffect(() => {
    setPreviewFrontal(urlCedulaFrontal || null);
  }, [urlCedulaFrontal]);

  useEffect(() => {
    setPreviewReverso(urlCedulaReverso || null);
  }, [urlCedulaReverso]);

  useEffect(() => {
    setPreviewSelfie(urlSelfieUser || null);
  }, [urlSelfieUser]);

  const [previewFrontal, setPreviewFrontal] = useState(null);
  const [previewReverso, setPreviewReverso] = useState(null);
  const [previewSelfie, setPreviewSelfie] = useState(null);
  const [loading, startTransition] = useTransition();
  console.log(form.watch());
  const onSubmit = async (values) => {
    try {
      console.log("enviar", values);
      // Construir FormData para enviar al backend (incluyendo imágenes)
      const fd = new FormData();
      const dialCode = paises.find((p) => p.value == values.codigo_pais);
      fd.append("correo", values.correo);
      fd.append("nombre", values.nombre);
      fd.append("apellido", values.apellido);
      fd.append("dial_code", dialCode ? String(dialCode.countryCode) : "");
      fd.append("telefono", values.telefono);
      fd.append("documento", values.documento);

      if (values.cedula_frente) {
        fd.append("cedula_frontal", values.cedula_frente);
      }
      if (values.cedula_reverso) {
        fd.append("cedula_reverso", values.cedula_reverso);
      }

      if (values.selfie_user) {
        fd.append("selfie_user", values.selfie_user);
      }

      if (values.fecha_nacimiento) {
        fd.append("fecha_nacimiento", values.fecha_nacimiento.toISOString());
      }

      // Aquí haces tu fetch/axios
      // await fetch("/api/tu-endpoint", { method: "POST", body: fd });

      await actualizarDatosSolicitud(id, fd);
      toast.success("Datos Actualizados con exito");
      afterSubmit?.();
    } catch (error) {
      if ([404, 400].includes(error?.response?.status)) {
        toast.error(
          "Error en la solicitud: " + error.response.data.message ||
            "error en la solicitud"
        );
        return;
      }
      toast.error("Ocurrió un error al enviar el formulario: " + error.message);
      console.error("Error al enviar el formulario:", error);
    }
  };

  const disableBotonGuardar = () => {
    if (!datosVerificados) return true;
    if (form.formState.isSubmitting) return true;
    return false;
  };

  if (id && loading) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  const AlertMotivoRechazo = ({ motivo }) => {
    return (
      <Alert variant={"destructive"}>
        <X />
        <AlertTitle>Solicitud Rechazada</AlertTitle>
        <AlertDescription>{motivo || "Solicitud Rechazada"}</AlertDescription>
      </Alert>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {solicitudData?.estado == 5 && (
          <AlertMotivoRechazo motivo={solicitudData?.motivo_rechazo} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="correo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="ej: correo@dominio.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documento</FormLabel>
                <FormControl>
                  <Input placeholder="Nro. de documento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Tu apellido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha de nacimiento (opcional, no puede ser hoy) */}
          <FormField
            control={form.control}
            name="fecha_nacimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value || null}
                    onChange={(d) => field.onChange(d ?? undefined)}
                    placeholder="Seleccione una fecha (opcional)"
                    disableDate={{ after: new Date() }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-[110px,1fr] gap-2 md:col-span-2">
            {/* País + teléfono */}

            <FormLabel>Teléfono</FormLabel>
            <div className="flex w-full">
              <div className="flex-shrink-0">
                <FormField
                  name="codigo_pais"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ComboBox
                          className="w-[200px]"
                          value={field.value}
                          items={paises}
                          onChange={field.onChange}
                          placeholder="Código"
                          buttonClassName="rounded-r-none border-r-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex-1">
                <FormField
                  name="telefono"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Número de teléfono"
                          {...field}
                          className="rounded-l-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 mt-2 gap-4">
          {/* Cédula Frontal */}
          <FormField
            control={form.control}
            name="cedula_frente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cédula (frontal)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files || undefined;
                      field.onChange(files[0]);
                      if (files && files[0]) {
                        const url = URL.createObjectURL(files[0]);
                        setPreviewFrontal(url);
                      } else {
                        setPreviewFrontal(null);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cédula Reverso */}
          <FormField
            control={form.control}
            name="cedula_reverso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cédula (reverso)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files || undefined;
                      field.onChange(files[0]);
                      if (files && files[0]) {
                        const url = URL.createObjectURL(files[0]);
                        setPreviewReverso(url);
                      } else {
                        setPreviewReverso(null);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Selfie*/}
          <FormField
            control={form.control}
            name="selfie_user"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selfie (Usuario) </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files || undefined;
                      field.onChange(files[0]);
                      if (files && files[0]) {
                        const url = URL.createObjectURL(files[0]);
                        setPreviewSelfie(url);
                      } else {
                        setPreviewSelfie(null);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/*Previsualizaciones*/}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-2">
          {
            <PhotoProvider
              onVisibleChange={(e) => {
                document.body.style.pointerEvents = e ? "auto" : "none";
              }}
            >
              {[previewFrontal, previewReverso, previewSelfie].map(
                (url, index) =>
                  url ? (
                    <PhotoView key={index} src={url}>
                      <img
                        src={url}
                        alt={`Previsualización ${index}`}
                        className="w-full h-48 object-cover rounded-xl border"
                      />
                    </PhotoView>
                  ) : (
                    <NoImage />
                  )
              )}
            </PhotoProvider>
          }
        </div>

        {solicitudData?.id_estado != 3 && (
          <>
            <div className="flex items-center gap-3">
              <Checkbox
                id="terms"
                checked={datosVerificados}
                onCheckedChange={(value) => setDatosVerificados(value)}
              />
              <Label htmlFor="terms">He verificado los datos</Label>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button disabled={disableBotonGuardar()} type="submit">
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
