// ResetCredentialsCard.jsx
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { inicializarCredencialesPorToken,  } from "@/apis/auth.api";
import { toast } from "sonner";
import { regenerarToken, verificarToken } from "@/apis/verificacionCuenta.api";
import { useNavigate } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/utils/routes.routes";


// --- Schema ---
const CANT_DIGITOS_PIN = 4;
const CANT_DIGITOS_MIN_PASS = 6;
const pinRegex = new RegExp(`^[0-9]{${CANT_DIGITOS_PIN}}$`);

const schema = z.object({
    password: z.string()
        .min(CANT_DIGITOS_MIN_PASS, `La contraseña debe tener al menos ${CANT_DIGITOS_MIN_PASS} caracteres`),
    confirmPassword: z.string(),
    pin: z.string().regex(pinRegex, `Debe ser un PIN de ${CANT_DIGITOS_PIN} dígitos`),
    confirmPin: z.string().regex(pinRegex, `Debe ser un PIN de ${CANT_DIGITOS_PIN} dígitos`),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["confirmPassword"],
            message: "Las contraseñas no coinciden",
        });
    }
    if (data.pin !== data.confirmPin) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["confirmPin"],
            message: "Los PIN no coinciden",
        });
    }
});

const getDataFromUrl = () => {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token");
  const destino = url.searchParams.get("dest");
  const cedula = url.searchParams.get("ced");
  return { token, destino, cedula };
};

export default function InicializarContrasenaPin() {
  const [submitting, setSubmitting] = useState(false);
    const [token,setToken] = useState(null)
    const [destino,setDestino] = useState(null)
    const navigate = useNavigate();
    
  useEffect(()=>{
    const verificarTokenUrl = async () => {
        try {
            const { token, destino, cedula } = getDataFromUrl();
            console.log("Token desde URL:", token);
            const dataenviar = {
                cedula,
                token
            }
            const response = await verificarToken(dataenviar);
            setToken(token);
            setDestino(destino);
            toast.success("Token verificado, ya puedes actualizar tus credenciales",{richColors: true});
            
        } catch (error) {
            if([400].includes(error?.response?.status)) {
                toast.error("Token inválido",{richColors: true});
                return;
            }
            toast.error("Error al verificar el token",{richColors: true});
        }
    }
    verificarTokenUrl();
  },[])

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      pin: "",
      confirmPin: "",
    },
  });

  const handleRenovarToken = async (e) => {
    e.preventDefault();
    console.log("Renovar token");
    try {
        const url = new URL(window.location.href);
        const { token, cedula } = getDataFromUrl();
        const dataEnviar = {
            cedula,
            token
        }
        const response = await regenerarToken(dataEnviar);
        const tokenRecibido = response?.data?.token;
        const documento = response?.data?.documento;

        const urlRedireccionar = `${url.origin}${url.pathname}?token=${tokenRecibido}&dest=cambio_pass&ced=${documento}`;
        // Redirigir al usuario a la nueva URL
        window.location.href = urlRedireccionar;
    } catch (error) {
        toast.error("Error al renovar el token",{richColors: true});
    }
  }

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
        const dataEnviar = {
            token:getDataFromUrl().token,
            password: values.password,
            pin: values.pin,
            cedula: getDataFromUrl().cedula
        }
        console.log("Data enviar", dataEnviar);
       await inicializarCredencialesPorToken(dataEnviar);
      toast.success("Contraseña y PIN actualizados correctamente", { richColors: true });
    navigate(PUBLIC_ROUTES.login);
      form.reset();
    } catch(error){
        if([400].includes(error?.response?.status)) {
            toast.error(error?.response?.data?.message || "Error al actualizar las credenciales", { richColors: true });
            return;
        }
        toast.error("Error al actualizar las credenciales", { richColors: true });
    
    } finally {
      setSubmitting(false);
    }
  };

return (
    <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="mx-auto w-full max-w-md shadow-lg">
            <CardHeader>
                <CardTitle>Actualizar credenciales</CardTitle>
                <CardDescription className="text-base text-muted-foreground font-medium mt-1">
                    Define tu contraseña y un PIN de {CANT_DIGITOS_PIN} dígitos.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {/* Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Confirm Password */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* PIN */}
                        <FormField
                            control={form.control}
                            name="pin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>PIN (OTP)</FormLabel>
                                    <FormControl>
                                        <InputOTP maxLength={CANT_DIGITOS_PIN} {...field}>
                                            <InputOTPGroup>
                                                {[...Array(CANT_DIGITOS_PIN)].map((_, i) => (
                                                    <InputOTPSlot key={i} index={i} />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Confirm PIN */}
                        <FormField
                            control={form.control}
                            name="confirmPin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar PIN</FormLabel>
                                    <FormControl>
                                        <InputOTP maxLength={CANT_DIGITOS_PIN} {...field}>
                                            <InputOTPGroup>
                                                {[...Array(CANT_DIGITOS_PIN)].map((_, i) => (
                                                    <InputOTPSlot key={i} index={i} />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <CardFooter className="px-0">
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? "Guardando..." : "Guardar"}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
                <span className="text-sm text-muted-foreground flex mt-4">
                    Token Expirado?,
                    <p  onClick={handleRenovarToken} className="text-blue-600 underline">
                        Renovar Token
                    </p>
                </span>
            </CardContent>
        </Card>
    </div>
);
}
