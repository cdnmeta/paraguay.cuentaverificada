// MisDatosSoloEditables.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

const paraguayPhoneRegex = /^\+?595\s?\d{3}\s?\d{3}\s?\d{3}$/; // +595 972 711 111

const schema = z.object({
  direccion: z.string().min(5, "Ingresa una dirección válida"),
  email: z.string().email("Email inválido"),
  telefono: z
    .string()
    .regex(paraguayPhoneRegex, "Teléfono PY inválido (+595 ...)")
});

const schemaSeguridad = z.object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Mínimo 8 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});



/**
 * Props opcionales:
 * - user: datos no editables y valores iniciales
 */
export default function MisDatosSoloEditables({
  user = {
    nombres: "Jose Luis",
    apellidos: "Caceres Varela",
    cedula: "8447805",
    ruc: "8447805-5",
    telefono: "+595 972 711 111",
    email: "chowuy@gmail.com",
    direccion: "Av Doctor Ignacio Alberto Pane",
    departamento: "Alto Paraná",
    ciudad: "Ciudad del Este",
  },
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      direccion: user.direccion || "",
      email: user.email || "",
      telefono: user.telefono || "",
    },
    mode: "onChange",
  });

  const formSeguridad = useForm({
    resolver: zodResolver(schemaSeguridad),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      // Aquí envías solo los campos editables
      // const res = await fetch("/api/mis-datos", { method:"PUT", body: JSON.stringify(values) })
      console.log("Editables enviados:", values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight">Mis Datos</h1>
        {/* Datos solo lectura */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Datos no editables</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Nombre/s</span>
              <p className="font-medium">{user.nombres}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Apellidos</span>
              <p className="font-medium">{user.apellidos}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Cédula</span>
              <p className="font-medium">{user.cedula}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">RUC</span>
              <p className="font-medium">{user.ruc}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                Departamento
              </span>
              <p className="font-medium">{user.departamento}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Ciudad</span>
              <p className="font-medium">{user.ciudad}</p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Formulario: solo Dirección, Email, Teléfono y Contraseña */}
        <Card>
          <CardHeader>
            <CardTitle>Editar datos</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                <FormField
                  control={form.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem asChild>
                      <p className="space-y-1">
                        <FormLabel>Dirección (donde vive)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Calle, número, referencia..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem asChild>
                      <p className="space-y-1">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="correo@dominio.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem asChild>
                      <p className="space-y-1">
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+595 972 711 111" {...field} />
                        </FormControl>
                        <FormMessage />
                      </p>
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2 flex items-center gap-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : "Guardar cambios"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                  >
                    Restablecer
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className={"mt-6"}>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...formSeguridad}>
              <form
                onSubmit={formSeguridad.handleSubmit((values) => {
                  // Aquí puedes manejar el cambio de contraseña
                  console.log("Seguridad enviados:", values);
                })}
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                <FormField
                  control={formSeguridad.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem asChild>
                      <div className="space-y-1">
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
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
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2 flex items-center gap-3">
                  <Button type="submit">
                    Cambiar contraseña
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => formSeguridad.reset()}
                  >
                    Restablecer
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
