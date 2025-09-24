import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Lock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { resetPassword } from "@/apis/auth.api";
import { Link, useNavigate } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/utils/routes.routes";

// Schema de validación
const resetPasswordSchema = z
  .object({
    cedula: z
      .string()
      .min(1, "La cédula es obligatoria")
      .regex(/^[0-9]+$/, "La cédula debe contener solo números"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .min(1, "La contraseña es obligatoria"),
    repetirNuevaContrasena: z
      .string()
      .min(1, "Confirmar contraseña es obligatorio"),
    pin: z
      .string()
      .nonempty("El PIN es obligatorio")
      .min(4, "El PIN debe tener al menos 4 dígitos")
      .max(4, "El PIN no puede tener más de 4 dígitos")
      .refine((val) => {
        if (val && val.length > 0) {
          return /^[0-9]+$/.test(val);
        }
        return true;
      }, "El PIN debe contener solo números"),
  })
  .refine((data) => data.password === data.repetirNuevaContrasena, {
    message: "Las contraseñas no coinciden",
    path: ["repetirNuevaContrasena"],
  });

const FormResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);

    try {
      // Preparar datos - solo incluir PIN si se proporcionó
      const requestData = {
        cedula: data.cedula,
        password: data.password,
        ...(data.pin && data.pin.length > 0 && { pin: data.pin }),
      };

      await resetPassword(requestData);

      setSuccess(true);
      toast.success("Contraseña actualizada exitosamente");
      reset(); // Limpiar el formulario
    } catch (error) {
      console.error("Error al resetear contraseña:", error);
      toast.error(
        error?.response?.data?.message ||
          "Error al actualizar la contraseña. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">
            Contraseña Actualizada
          </CardTitle>
          <CardDescription>
            Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar
            sesión con tu nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => navigate(PUBLIC_ROUTES.login)}
          >
            Ir a Iniciar Sesión
          </Button>
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => setSuccess(false)}
          >
            Resetear otra contraseña
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Resetear Contraseña</CardTitle>
        <CardDescription>
          Actualiza tu contraseña y PIN (opcional) usando tu cédula
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-xs text-gray-500 mb-1">* Campos obligatorios</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Cédula */}
          <div className="space-y-2">
            <Label htmlFor="cedula">
              Cédula <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cedula"
              type="text"
              placeholder="Ingresa tu cédula"
              {...register("cedula")}
              className={errors.cedula ? "border-red-500" : ""}
              disabled={loading}
            />
            {errors.cedula && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.cedula.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Nueva Contraseña <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu nueva contraseña"
                {...register("password")}
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.password && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.password.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Campo Repetir Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="repetirNuevaContrasena">
              Repetir Nueva Contraseña <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="repetirNuevaContrasena"
                type={showRepeatPassword ? "text" : "password"}
                placeholder="Repite tu nueva contraseña"
                {...register("repetirNuevaContrasena")}
                className={
                  errors.repetirNuevaContrasena
                    ? "border-red-500 pr-10"
                    : "pr-10"
                }
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                disabled={loading}
              >
                {showRepeatPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.repetirNuevaContrasena && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.repetirNuevaContrasena.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Campo PIN*/}
          <div className="space-y-2">
            <Label htmlFor="pin">PIN</Label>
            <Input
              id="pin"
              type="password"
              placeholder="Ingresa tu PIN"
              {...register("pin")}
              className={errors.pin ? "border-red-500" : ""}
              disabled={loading}
              maxLength={6}
            />
            {errors.pin && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.pin.message}</AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-gray-500">
              Necesitamos tu PIN para operaciones sensibles como esta
            </p>
          </div>

          {/* Botón Submit */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Actualizar Contraseña
              </>
            )}
          </Button>

          {/* Información adicional */}
          <div className="text-center pt-2">
            <Link to={PUBLIC_ROUTES.recoveryPin} className="text-blue-500 text-sm underline" >
              ¿Olvidaste tu PIN ?, restablece aquí
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormResetPassword;
