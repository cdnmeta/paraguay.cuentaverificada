import React from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cambiarContrasena } from "@/apis/usuarios.api";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { useNavigate } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/utils/routes.routes";
const schemaSeguridad = z
  .object({
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
    pin: z
      .string({ required_error: "Pin requerido" })
      .nonempty("Pin requerido"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export default function FormCambiarPassword() {
    const {logout} = useAuthStore()
    const navigate = useNavigate();
  const formSeguridad = useForm({
    resolver: zodResolver(schemaSeguridad),
    defaultValues: {
      password: "",
      confirmPassword: "",
      pin: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    const dataEnviar = {
      contrasena: data.password,
      pin: data.pin,
    };
    try {
      await cambiarContrasena(dataEnviar);
      formSeguridad.reset();
      toast.success("Contraseña cambiada exitosamente, cerrando sesión...");
       setTimeout(() => {
        logout();
        navigate(PUBLIC_ROUTES.login);
      }, 1500);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error al cambiar la contraseña"
      );
    }
  };
  return (
    <Form {...formSeguridad}>
      <form
        onSubmit={formSeguridad.handleSubmit(onSubmit)}
        className="grid grid-cols-1  gap-6 md:grid-cols-3"
      >
        <FormField
          control={formSeguridad.control}
          name="password"
          render={({ field }) => (
            <FormItem asChild>
              <div className="space-y-1">
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={formSeguridad.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem asChild>
              <div className="space-y-1">
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={formSeguridad.control}
          name="pin"
          render={({ field }) => (
            <FormItem asChild>
              <div className="space-y-1">
                <FormLabel>Pin</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <div className="md:col-span-2 flex items-center gap-3">
          <Button disabled={formSeguridad.formState.isSubmitting} type="submit">
            {formSeguridad.formState.isSubmitting
              ? "Cambiando..."
              : "Cambiar contraseña"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
