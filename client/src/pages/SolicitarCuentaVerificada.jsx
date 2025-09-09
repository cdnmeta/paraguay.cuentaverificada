// src/pages/SolicitarCuentaVerificada.jsx
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ComboBox } from "@/components/customs/comboBoxShadcn/ComboBox1";
import paisesCode from "@/utils/paises-flag.json";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { crearSolicitudCuenta } from "@/apis/verificacionCuenta.api";
import { REGEX_CEDULA_IDENTIDAD } from "@/utils/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-dropdown-menu";
// import { registrarUsuario } from "@/apis/auth.api";
// import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const MB = 1024 * 1024;
const CANTIDAD_DIGITOS_OTP = 6;

const schema = z.object({
  email: z.string().trim().email("Correo inválido"),
  nombre: z.string().trim().min(1, "Nombre es requerido"),
  apellido: z.string().trim().min(1, "Apellido es requerido"),
  terminos: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
  documento: z
    .string()
    .regex(REGEX_CEDULA_IDENTIDAD, "Cédula de identidad inválida"),
  codigo_pais: z
    .string({
      required_error: "Código de país es requerido",
      invalid_type_error: "Cogido debe ser string",
    })
    .trim()
    .min(1, "Selecciona un código"),
  telefono: z.string().trim().min(6, "Teléfono inválido"),
});

export default function SolicitarCuentaVerificada() {
  const [paises, setPaises] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      apellido: "",
      documento: "",
      email: "",
      codigo_pais: "",
      telefono: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    setPaises(
      paisesCode.map((p) => ({
        value: p.code, // clave consistente
        label: `${p.country} (+${p.countryCode})`,
        img: p.flag,
      }))
    );
  }, []);

  const getDataPais = (codigo) => {
    return paisesCode.find((p) => p.code === codigo);
  };

  const onSubmit = async (data) => {
    try {
      const pais = getDataPais(data.codigo_pais);
      const payload = {
        nombre: data.nombre,
        apellido: data.apellido,
        documento: data.documento,
        correo: data.email,
        dial_code: String(pais.countryCode),
        telefono: data.telefono,
      };

      // Llamada real (descomenta cuando tengas API)
      //await crearSolicitudCuenta(payload);

      toast.success("Cuenta solicitada con éxito ✅");
      setOpenConfirm(false);
      form.reset();
      // aquí puedes redirigir si quieres
    } catch (err) {
      if ([400].includes(err?.response?.status)) {
        toast.error(err?.response?.data?.message);
        return;
      }
      toast.error("No se pudo enviar la solicitud.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4 py-10 relative">
      {/* reCAPTCHA container (invisible) */}
      <div id="recaptcha-container" />

      <div className="flex flex-col gap-3 mt-6 z-10 w-full max-w-sm">
        <div className="bg-red-900 border border-red-600 text-sm text-white p-3 rounded">
          ⚠️ Al hacer clic en{" "}
          <span className="underline font-bold">"Crear cuenta"</span>, aceptás
          bajo juramento que el documento es tuyo. El uso de documentos ajenos o
          falsos puede derivar en sanciones legales y el bloqueo inmediato de la
          cuenta.
        </div>

        <Card className="w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold">
              Crear Cuenta
            </CardTitle>
            <CardDescription>
              Completa el formulario. Te enviaremos un código por SMS para
              verificar tu número antes de registrar la cuenta.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col gap-3"
              >
                {/* Datos */}
                <FormField
                  name="nombre"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: RODRIGO RAMON" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="apellido"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: PAVÓN GAUTO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="documento"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cédula</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 4661615" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@dominio.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* País + teléfono */}
                <div className="flex flex-col w-full gap-1">
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
                                className="w-[160px]"
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
                  <div className="flex-1 mt-1">
                    <FormField
                      name="terminos"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem
                          className={
                            "flex items-center gap-2 space-y-0 mb-0"
                          }
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked)
                              }
                            />
                          </FormControl>
                          <div className="flex flex-col">
                            <FormLabel className="text-sm text-muted-foreground">
                            <span>
                              He leido y acepto los <span className="text-blue-600 hover:underline"><a href="#">Terminos y Condiciones</a></span>
                            </span>
                          </FormLabel>
                          <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Botón que abre el diálogo de confirmación */}
                <div className="pt-2">
                  <Button
                    type="button"
                    className={"w-full"}
                    onClick={() => {
                      // valida antes de abrir el diálogo
                      const ok = form.trigger();
                      Promise.resolve(ok).then((valid) => {
                        if (valid) setOpenConfirm(true);
                      });
                    }}
                  >
                    {form.formState.isSubmitting
                      ? "Enviando..."
                      : "Enviar Solicitud"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de confirmación controlado (sin Trigger para evitar doble acción) */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent
          onInteractOutside={(e) =>
            form.formState.isSubmitting && e.preventDefault()
          }
          onEscapeKeyDown={(e) =>
            form.formState.isSubmitting && e.preventDefault()
          }
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">
              Solicitud de Cuenta
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div>
                <p>Estás a un paso de solicitar tu cuenta verificada.</p>
                <p>
                  Por favor,
                  <span className="font-bold uppercase text-destructive">
                    revisa tus datos antes de continuar.
                  </span>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={form.formState.isSubmitting}>
              Revisar
            </AlertDialogCancel>
            <Button
              className="bg-green-600"
              disabled={form.formState.isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              {form.formState.isSubmitting ? "Enviando..." : "Continuar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
