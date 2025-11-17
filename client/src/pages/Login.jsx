// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SuperHeroeAnimado from "@/components/SuperHeroeAnimado";
import { LogInIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { PUBLIC_ROUTES } from "@/utils/routes.routes";
import { login } from "@/apis/auth.api";

// RHF + Zod + ShadCN
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  documento: z
    .string()
    .trim()
    .min(3, "Ingresá al menos 3 caracteres.")
    .max(30, "Máximo 30 caracteres."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});


export const FormLogin = ({redirect=true, afterSubmit = ()=>{}}) => {
  const [mensaje, setMensaje] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      documento: "",
      password: "",
    },
    mode: "onSubmit",
  });

  // Mantiene la lógica original, solo recibe los valores desde el form
  const iniciarSesion = async (values) => {
    try {
      setIsSubmitting(true);
      setMensaje(null);

      const { documento, password } = values;

      const dataEnviar = {
        documento,
        password,
      };

      const credentials = await login(dataEnviar);
      //const response = await signInWithCustomToken(auth, credentials.data.token);
    
      // guardar el token en Zustand
      useAuthStore.getState().setTokenJwtUser(credentials.data.token);

      // 🔥 Llamar a fetchUser() desde Zustand (trae y guarda el user)
      await useAuthStore.getState().fetchUser();
      

      toast.success("Bienvenido a Cuenta Verificada.");
      if(redirect) navigate(PUBLIC_ROUTES.panel);
      afterSubmit?.();
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      if ([400].includes(err?.response?.status)) {
        toast.error("❌ Datos incorrectos. Verificá tu documento y contraseña.", {
          richColors: true,
        });
        return;
      }
      toast.error("❌ Ocurrió un error al iniciar sesión. Verificá tus datos.", {
        richColors: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
     <Form {...form}>
            <form
              onSubmit={form.handleSubmit(iniciarSesion)}
              className="space-y-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cedula de Identidad</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingrese su cedula de identidad sin puntos"
                        {...field}
                        autoComplete="username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Contraseña"
                        {...field}
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogInIcon size={18} />
                    Iniciar sesión
                  </>
                )}
              </Button>

              {mensaje && (
                <p className="text-yellow-600 text-sm font-semibold text-center mt-2">
                  {mensaje}
                </p>
              )}

              <div className="text-center mt-4 text-sm">
                <Link
                  to={PUBLIC_ROUTES.solicitarCuentaVerificada}
                  className="text-primary underline block mt-2"
                >
                  ¿No tenés cuenta? Registrarte
                </Link>
                <Link
                  to={PUBLIC_ROUTES.resetPassword}
                  className="text-white underline block mt-2"
                >
                  ¿Olvidaste tu contraseña? Restablecer contraseña
                </Link>
              </div>
            </form>
          </Form>
  )
}

const Login = () => {
  


  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white relative p-4">
      <div className="z-10 mb-4">
        <SuperHeroeAnimado />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Accedé con tu documento y contraseña
          </CardDescription>
        </CardHeader>

        <CardContent>
         <FormLogin />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
