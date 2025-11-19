import React, { useState } from "react";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cambiarContrasena } from "@/apis/usuarios.api";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { useNavigate } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/utils/routes.routes";
import { CANT_MIN_CARACTERES_PIN } from "@/utils/constants";
const schemaSeguridad = z
  .object({
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
    pin: z
      .string({ required_error: "PIN requerido" })
      .min(CANT_MIN_CARACTERES_PIN, `El PIN debe tener al menos ${CANT_MIN_CARACTERES_PIN} caracteres`)
      .regex(/^[a-zA-Z0-9]+$/, "El PIN solo puede contener letras y números"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export default function FormCambiarPassword() {
    const {logout} = useAuthStore()
    const navigate = useNavigate();
    
    // Estados para mostrar/ocultar contraseñas
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="********" 
                      {...field} 
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
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
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="********" 
                      {...field} 
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
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
                <FormLabel>PIN</FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={CANT_MIN_CARACTERES_PIN}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={formSeguridad.formState.isSubmitting}
                      className="gap-2"
                    >
                      <InputOTPGroup className="gap-2">
                        {Array.from({ length: CANT_MIN_CARACTERES_PIN }, (_, index) => (
                          <InputOTPSlot 
                            key={index} 
                            index={index} 
                            className="w-12 h-12 text-lg font-semibold border-2 rounded-lg"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
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
