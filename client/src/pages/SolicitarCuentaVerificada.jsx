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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import {
  crearSolicitudCuenta,
  enviarCodigoVerificacion,
  validarCodigoSolicitud,
} from "@/apis/verificacionCuenta.api";
import {
  CANT_MIN_CARACTERES_CONTRASENA,
  REGEX_CEDULA_IDENTIDAD,
  CODIGO_PAIS_BASE,
} from "@/utils/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Eye, EyeOff } from "lucide-react";
import { useAlertDialogStore } from "@/store/useAlertDialogStore";
import { PUBLIC_ROUTES } from "@/utils/routes.routes";
import { confirmarUsuario, refreshCodigoVerificacion, registrarUsuario } from "@/apis/auth.api";

const MB = 1024 * 1024;
const CANTIDAD_DIGITOS_OTP = 6;

const schema = z
  .object({
    email: z.string().trim().email("Correo inválido"),
    nombre: z.string().trim().min(1, "Nombre es requerido"),
    apellido: z.string().trim().min(1, "Apellido es requerido"),
    password: z
      .string({ required_error: "Contraseña es requerida" })
      .min(
        CANT_MIN_CARACTERES_CONTRASENA,
        `${`La contraseña debe tener al menos ${CANT_MIN_CARACTERES_CONTRASENA} caracteres`}`
      ),
    confirmPassword: z.string(),
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const otpSchema = z.object({
  codigo_verificacion: z
    .string()
    .min(6, "El código debe tener 6 dígitos")
    .max(6, "El código debe tener 6 dígitos"),
});

// Componente para subir imágenes con preview
const ImageUpload = ({ value, onChange, error, label, placeholder }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div className="space-y-2">
      <FormLabel className={error ? "text-red-500" : ""}>{label}</FormLabel>

      {!preview ? (
        <div className="flex items-center justify-center w-full">
          <label
            className={`flex flex-col items-center justify-center w-full h-24 md:h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-3 pb-3 md:pt-5 md:pb-6">
              <Upload className="w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2 text-gray-400" />
              <p className="mb-1 md:mb-2 text-xs md:text-sm text-gray-500">
                <span className="font-semibold">Click para subir</span>
              </p>
              <p className="text-xs text-gray-500 hidden md:block">
                {placeholder}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
            />
          </label>
        </div>
      ) : (
        <div className="relative">
          <div className="w-full h-24 md:h-32 border rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => window.open(preview, "_blank")}
              className="h-6 w-6 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default function SolicitarCuentaVerificada() {
  const [paises, setPaises] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [mostrarVerificacion, setMostrarVerificacion] = useState(false);
  const [idUsuario, setIdUsuario] = useState(null);
  const [userData, setUserData] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const [enviadoCodigo, setEnviadoCodigo] = useState(false);

  const { showAlert } = useAlertDialogStore();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      apellido: "",
      documento: "",
      email: "",
      password: "",
      confirmPassword: "",
      codigo_pais: CODIGO_PAIS_BASE,
      telefono: "",
      terminos: false,
      cedula_frente: null,
      cedula_trasera: null,
      selfie: null,
    },
    mode: "onChange",
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      codigo_verificacion: "",
    },
    mode: "onChange",
  });

  const loadUserByURL = () => {
    const userByURL = new URLSearchParams(window.location.search).get("us");
    console.log(window.location.search);
    if (userByURL && !isNaN(Number(userByURL))) {
      // Aquí podrías cargar datos adicionales si es necesario
      setIdUsuario(Number(userByURL));
      setMostrarVerificacion(true);
    }
  };

  useEffect(() => {
    setPaises(
      paisesCode.map((p) => ({
        value: p.code, // clave consistente
        label: `${p.country} (+${p.countryCode})`,
        img: p.flag,
      }))
    );
    loadUserByURL();
  }, []);

  const getDataPais = (codigo) => {
    return paisesCode.find((p) => p.code === codigo);
  };

  const onSubmit = async (data) => {
    try {
      const pais = getDataPais(data.codigo_pais);

      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append("nombre", data.nombre);
      formData.append("apellido", data.apellido);
      formData.append("documento", data.documento);
      formData.append("correo", data.email);
      formData.append("contrasena", data.password);
      formData.append("dial_code", String(pais.countryCode));
      formData.append("telefono", data.telefono);

      // Agregar archivos
      if (data?.cedula_frente) {
        formData.append("cedula_frontal", data.cedula_frente);
      }
      if (data?.cedula_trasera) {
        formData.append("cedula_reverso", data.cedula_trasera);
      }
      if (data?.selfie) {
        formData.append("selfie", data.selfie);
      }

      // Llamada real - capturar respuesta con el ID del usuario
      const response = await registrarUsuario(formData);
      const { user } = response.data;
      if (user.activo) {
        toast.error("El usuario ya está activo. Por favor, inicia sesión.");
        showAlert({
          title: (
            <p className="text-xl text-center">
              Solicitud de{" "}
              <span className="text-green-400">Cuenta Verificada</span>{" "}
            </p>
          ),
          showCancel: false,
          closeOnOutsideClick: false,
          description: (
            <div>
              <p>
                Tu Usuario ya está activo, seras redireccionado a la página de de <span className="text-green-400 text-xl">Iniciar Sesión</span>
              </p>
            </div>
          ),
          onConfirm: () => {
            form.reset();
            otpForm.reset();
            setIdUsuario(null);
            navigate(PUBLIC_ROUTES.login);
            setOpenConfirm(false);
          },
        });
        return;
      }
      
      setUserData(user);
      setOpenConfirm(false);
      setTimeout(() => {
        setMostrarVerificacion(true);
      }, 6000);

      showAlert({
        title: (
          <p className="text-xl text-center">
            Solicitud de{" "}
            <span className="text-green-400">Cuenta Verificada</span>{" "}
          </p>
        ),
        showCancel: false,
        closeOnOutsideClick: false,
        description: (
          <div>
            <p>
              Hemos Enviado tu{" "}
              <span className="text-green-400">Código de Verificación</span> a
              tu bandeja de entrada
            </p>
            <p>
              El codigo es necesario para validar tu solicitud para obtener una{" "}
              <span className="text-green-400">Cuenta Verificada</span>
            </p>
          </div>
        ),
        onConfirm: () => {
          setOpenConfirm(false);
        },
      });

      // No resetear el form aquí para mantener los datos si es necesario
    } catch (err) {
      console.log(err);
      if ([400].includes(err?.response?.status)) {
        toast.error(err?.response?.data?.message);
        return;
      }
      toast.error("No se pudo procesar la solicitud.");
    }
  };

  const onSubmitOTP = async (data) => {
    try {
      const payload = {
        cedula: userData.documento,
        token: data.codigo_verificacion,
      };

      // Llamada a la API de verificación usando la función del archivo apis
      await confirmarUsuario(payload);

      showAlert({
        title:
          "¡Código verificado exitosamente! Tu solicitud fue verificada exitosamente.",
        showCancel: false,
        descripcion: (
          <>
            <p>Hemos verificado tu solicitud correctamente.</p>
            <p className="font-bold text-lg">
              Favor aguardar que el equipo verifique su solicitud
            </p>
          </>
        ),

        onConfirm: () => {
          form.reset();
          otpForm.reset();
          setIdUsuario(null);

          navigate("/login");
        },
      });
    } catch (err) {
      console.error("Error validando código:", err);
      if (err?.response?.status === 400) {
        toast.error(
          err?.response?.data?.message || "Código inválido. Intenta nuevamente."
        );
      } else {
        toast.error("Error en la verificación. Intenta nuevamente.");
      }
    }
  };

  const handleSolicitarCodigo = async () => {
    try {
      setEnviadoCodigo(true);
      if (!userData) {
        toast.error("No hay una solicitud activa para reenviar el código.");
        return;
      }

      const dataEnviar = {
        cedula: userData.documento,
      }

      await refreshCodigoVerificacion(dataEnviar);
      toast.success("Código de verificación reenviado.");
      otpForm.reset();
    } catch (error) {
      console.error("Error reenviando código:", error);
      toast.error("Error al reenviar el código. Intenta nuevamente.");
    } finally {
      setEnviadoCodigo(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4 py-10 relative">
      {/* reCAPTCHA container (invisible) */}
      <div id="recaptcha-container" />

      <div className="flex flex-col gap-3 mt-6 z-10 w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl">
        {!mostrarVerificacion ? (
          // Formulario principal de solicitud
          <>
            <div className="bg-red-900 border border-red-600 text-sm text-white p-3 rounded">
              ⚠️ Al hacer clic en{" "}
              <span className="underline font-bold">"Crear cuenta"</span>,
              aceptás bajo juramento que el documento es tuyo. El uso de
              documentos ajenos o falsos puede derivar en sanciones legales y el
              bloqueo inmediato de la cuenta.
            </div>

            <Card className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center font-bold">
                  Crear Cuenta
                </CardTitle>
                <CardDescription>
                  Completa el formulario. Te enviaremos un código por correo
                  para que verifiques tu identidad.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6"
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

                    <FormField
                      name="password"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={mostrarPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setMostrarPassword(!mostrarPassword)
                                }
                              >
                                {mostrarPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="confirmPassword"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repetir Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={
                                  mostrarConfirmPassword ? "text" : "password"
                                }
                                placeholder="••••••••"
                                {...field}
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setMostrarConfirmPassword(
                                    !mostrarConfirmPassword
                                  )
                                }
                              >
                                {mostrarConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* País + teléfono */}
                    <div className="flex flex-col w-full gap-1 md:col-span-2">
                      <FormLabel
                        className={
                          form.formState.errors.telefono ? "text-red-500" : ""
                        }
                      >
                        Teléfono
                      </FormLabel>
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
                                    error={!!form.formState.errors.codigo_pais}
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


                      <div className="flex-1 mt-1 md:col-span-2">
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
                                    He leido y acepto los{" "}
                                    <span className="text-primary hover:underline">
                                      <a href="#">Terminos y Condiciones</a>
                                    </span>
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
                    <div className="pt-2 md:col-span-2">
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
                      <div className="text-center mt-4">
                        <span className="text-sm text-muted-foreground">
                          ¿Ya tienes una cuenta?{" "}
                        </span>
                        <Link
                          to="/login"
                          className="text-sm font-medium text-primary hover:text-primary/80 underline decoration-primary underline-offset-4 transition-colors"
                        >
                          Iniciar Sesión
                        </Link>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </>
        ) : (
          // Formulario de verificación OTP
          <Card className="max-w-md mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-2xl text-center font-bold">
                Verificar Código
              </CardTitle>
              <CardDescription>
                Hemos enviado un código de 6 dígitos al correo con el que te
                registraste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...otpForm}>
                <form
                  onSubmit={otpForm.handleSubmit(onSubmitOTP)}
                  className="space-y-6"
                >
                  <FormField
                    name="codigo_verificacion"
                    control={otpForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de Verificación</FormLabel>
                        <FormControl>
                          <InputOTP
                            maxLength={6}
                            value={field.value}
                            onChange={field.onChange}
                            className="justify-center"
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={otpForm.formState.isSubmitting}
                    >
                      {otpForm.formState.isSubmitting
                        ? "Verificando..."
                        : "Verificar Código"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSolicitarCodigo}
                      className="w-full"
                      disabled={otpForm.formState.isSubmitting || enviadoCodigo}
                    >
                      {enviadoCodigo
                        ? "Reenviando código..."
                        : "Reenviar Código"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
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
