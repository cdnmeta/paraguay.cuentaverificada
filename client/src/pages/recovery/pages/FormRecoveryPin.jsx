import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CreditCard, AlertCircle, CheckCircle, LogIn } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { solicitarRecoveryPin } from "@/apis/auth.api";
import { Link, useNavigate } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/utils/routes.routes";

// Schema de validación
const recoveryPinSchema = z.object({
  cedula: z.string()
    .min(1, "La cédula es obligatoria")
    .regex(/^[0-9]+$/, "La cédula debe contener solo números"),
  correo: z.string()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo válido")
});

const FormRecoveryPin = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(recoveryPinSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);

    try {
      await solicitarRecoveryPin(data);
      
      setSuccess(true);
      toast.success("Correo de recuperación enviado exitosamente");
      reset(); // Limpiar el formulario
      
    } catch (error) {
      console.error("Error al solicitar recuperación:", error);
      toast.error(
        error?.response?.data?.message || 
        "Error al enviar la solicitud. Intenta nuevamente."
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
          <CardTitle className="text-green-800">Correo Enviado</CardTitle>
          <CardDescription>
            Hemos enviado un enlace de recuperación a tu correo electrónico. 
            Revisa tu bandeja de entrada y sigue las instrucciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setSuccess(false)}
          >
            Enviar otro correo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle> Restablecer PIN</CardTitle>
        <CardDescription>
          Ingresa tu cédula y correo para recibir un enlace de restablecimiento
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Cédula */}
          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula</Label>
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

          {/* Campo Correo */}
          <div className="space-y-2">
            <Label htmlFor="correo">Correo Electrónico</Label>
            <Input
              id="correo"
              type="email"
              placeholder="correo@ejemplo.com"
              {...register("correo")}
              className={errors.correo ? "border-red-500" : ""}
              disabled={loading}
            />
            {errors.correo && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.correo.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Botón Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar Enlace de Recuperación
              </>
            )}
          </Button>
        </form>
        <Button onClick={() => navigate(PUBLIC_ROUTES.login)} className="w-full mt-2">
          <LogIn className="mr-2 h-4 w-4" />
          Ir al Login
        </Button>
      </CardContent>
    </Card>
  );
};

export default FormRecoveryPin;
