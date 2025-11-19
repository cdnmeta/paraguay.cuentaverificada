import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { verificarToken, resetPin, refreshToken } from "@/apis/auth.api";


// Constante para la cantidad de dígitos del PIN
const CANT_DIGITOS_PIN = 4;

// Schema de validación
const resetPinSchema = z.object({
  cedula: z.string().min(1, "La cédula es obligatoria"),
  pin: z.string()
    .length(CANT_DIGITOS_PIN, `El PIN debe tener exactamente ${CANT_DIGITOS_PIN} dígitos`),
  repetir_pin: z.string()
    .length(CANT_DIGITOS_PIN, `El PIN debe tener exactamente ${CANT_DIGITOS_PIN} dígitos`)
}).refine((data) => data.pin === data.repetir_pin, {
  message: "Los PINs no coinciden",
  path: ["repetir_pin"],
});

const FormResetPin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [success, setSuccess] = useState(false);

  // Extraer parámetros de la URL
  const token = searchParams.get("token");
  const cedula = searchParams.get("cedula");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control
  } = useForm({
    resolver: zodResolver(resetPinSchema),
    defaultValues: {
      cedula: "",
      pin: "",
      repetir_pin: ""
    }
  });

  // Validar token al cargar el componente
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !cedula) {
        toast.error("Enlace inválido. Faltan parámetros requeridos.");
        setValidatingToken(false);
        return;
      }

      try {
        await verificarToken(token, cedula);
        setTokenValid(true);
        setValue("cedula", cedula); // Pre-llenar la cédula
        toast.success("Token válido. Puedes cambiar tu PIN.");
      } catch (error) {
        console.error("Error validando token:", error);
        setTokenValid(false);
        toast.error("El enlace ha expirado o es inválido.");
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token, cedula, setValue]);

  // Refresh token
  const handleRefreshToken = async () => {
    if (!token || !cedula) {
      toast.error("No se pueden actualizar los parámetros del enlace.");
      return;
    }

    setRefreshingToken(true);

    try {
      const response = await refreshToken({
        token: token,
        cedula: cedula
      });

      // Redirigir con nuevo token
      const newUrl = `/reset-pin?token=${response.data.token}&cedula=${response.data.cedula}`;
      navigate(newUrl, { replace: true });
      toast.success("Enlace actualizado correctamente.");
      
      // Revalidar después de un breve delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error("Error al actualizar token:", error);
      toast.error("No se pudo actualizar el enlace. Solicita uno nuevo.");
    } finally {
      setRefreshingToken(false);
    }
  };

  // Submit del formulario
  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Token no disponible.");
      return;
    }

    setLoading(true);

    try {
      const resetData = {
        pin: data.pin,
        token: token,
        cedula: data.cedula
      };

      await resetPin(resetData);
      
      setSuccess(true);
      toast.success("PIN cambiado exitosamente");
      reset();
      
    } catch (error) {
      console.error("Error al cambiar PIN:", error);
      toast.error(
        error?.response?.data?.message || 
        "Error al cambiar el PIN. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  // Vista de validando token
  if (validatingToken) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <CardTitle>Validando Enlace</CardTitle>
          <CardDescription>
            Verificando que el enlace sea válido...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Vista de éxito
  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">PIN Cambiado</CardTitle>
          <CardDescription>
            Tu PIN ha sido actualizado exitosamente. Ya puedes usar tu nueva clave.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full"
            onClick={() => navigate("/")}
          >
            Ir al Inicio
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Vista de token inválido
  if (!tokenValid) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-800">Enlace Inválido</CardTitle>
          <CardDescription>
            El enlace ha expirado o no es válido. Puedes intentar actualizarlo o solicitar uno nuevo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleRefreshToken}
            disabled={refreshingToken}
          >
            {refreshingToken ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar Enlace
              </>
            )}
          </Button>
          
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => navigate("/recovery-pin")}
          >
            Solicitar Nuevo Enlace
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Formulario principal
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle>Cambiar PIN</CardTitle>
        <CardDescription>
          Enlace válido. Ingresa tu nuevo PIN de seguridad.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Cédula (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula</Label>
            <Input
              id="cedula"
              type="text"
              {...register("cedula")}
              className="opacity-50 cursor-not-allowed"
              disabled={true}
              readOnly
            />
            {errors.cedula && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.cedula.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Campo PIN */}
          <div className="space-y-2">
            <Label htmlFor="pin">Nuevo PIN</Label>
            <div className="flex justify-center">
              <Controller
                name="pin"
                control={control}
                render={({ field }) => (
                  <InputOTP
                    maxLength={CANT_DIGITOS_PIN}
                    value={field.value}
                    onChange={(val) => {
                      let valAsignar = val
                      if( typeof valAsignar === "string") {
                        valAsignar = valAsignar.toLowerCase();
                      }
                      field.onChange(valAsignar);
                    }}
                    disabled={loading}
                    className="gap-3"
                  >
                    <InputOTPGroup className="gap-3">
                      {Array.from({ length: CANT_DIGITOS_PIN }, (_, index) => (
                        <InputOTPSlot 
                          key={index} 
                          index={index} 
                          className="w-14 h-14 text-xl font-semibold border-2 rounded-lg"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
            </div>
            {errors.pin && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.pin.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Campo Repetir PIN */}
          <div className="space-y-2">
            <Label htmlFor="repetir_pin">Confirmar PIN</Label>
            <div className="flex justify-center">
              <Controller
                name="repetir_pin"
                control={control}
                render={({ field }) => (
                  <InputOTP
                    maxLength={CANT_DIGITOS_PIN}
                    value={field.value}
                    onChange={(val) => {
                      let valAsignar = val
                      if( typeof valAsignar === "string") {
                        valAsignar = valAsignar.toLowerCase();
                      }
                      field.onChange(valAsignar);
                    }}
                    disabled={loading}
                    className="gap-3"
                  >
                    <InputOTPGroup className="gap-3">
                      {Array.from({ length: CANT_DIGITOS_PIN }, (_, index) => (
                        <InputOTPSlot 
                          key={index} 
                          index={index} 
                          className="w-14 h-14 text-xl font-semibold border-2 rounded-lg"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
            </div>
            {errors.repetir_pin && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.repetir_pin.message}</AlertDescription>
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
                Cambiando PIN...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Cambiar PIN
              </>
            )}
          </Button>

          {/* Enlace para actualizar token */}
          <div className="text-center pt-2">
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={handleRefreshToken}
              disabled={refreshingToken}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {refreshingToken ? "Actualizando enlace..." : "¿El enlace expiró? Actualízalo aquí"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormResetPin;