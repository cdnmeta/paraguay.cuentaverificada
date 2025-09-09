"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, UserCheck, AlertCircle } from "lucide-react";
import { agregarUsuarioGrupo, getUserByQuery } from "@/apis/usuarios.api";
import { agregarParticipacion } from "@/apis/participantes.api";
import { NumericFormat } from "react-number-format";
import { getPrecioMeta } from "@/apis/participacion-empresa.api";

// Esquemas de validación
const cedulaSchema = z.object({
  cedula: z
    .string()
    .min(1, "La cédula es requerida")
    .regex(/^[0-9]{6,10}$/, "La cédula debe tener entre 6 y 10 dígitos"),
});

const participacionSchema = z
  .object({
    monto_meta: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z
        .number({
          required_error: "El monto es requerido",
          invalid_type_error: "El monto debe ser numérico",
        })
        .gt(0, { message: "El monto debe ser positivo" })
    ),
  });


export default function ParticipantesForm() {
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [cargandoConversion, setCargandoConversion] = useState(false);
  const [cargandoParticipacion, setCargandoParticipacion] = useState(false);
  const [reloadMetaInfo, setReloadMetaInfo] = useState(false);
  const [metaInfo, setMetaInfo] = useState(null);

  const fetchMetaInfo = async () => {
    try {
      const data = await getPrecioMeta();
      setMetaInfo(data);
    } catch (error) {
      toast.error("Error al cargar la información meta: " + error.message);
    }
  };
  useEffect(() => {

    fetchMetaInfo();
  }, [reloadMetaInfo]);

  // Form para búsqueda por cédula
  const formBusqueda = useForm({
    resolver: zodResolver(cedulaSchema),
    defaultValues: {
      cedula: "",
    },
  });

  // Form para registro de participación
  const formParticipacion = useForm({
    resolver: zodResolver(participacionSchema),
    defaultValues: {
      monto_meta: "",
    },
  });

  // Calcular si puede registrar participación
  const puedeRegistrar =
    usuarioEncontrado &&
    (usuarioEncontrado.esParticipante ||
      usuarioEncontrado.grupos.some((grupo) => grupo.id_grupo === 4));

  const onBuscarUsuario = async (data) => {
    setCargandoBusqueda(true);
    setUsuarioEncontrado(null);

    try {
      const query = {
        documento: data.cedula,
      };
      const resultado = await getUserByQuery(query);

      setUsuarioEncontrado(resultado.data);
      toast.success("Usuario encontrado");
    } catch (error) {
      if([400,404].includes(error.response?.status)){
        toast.error(error.response?.data?.message || "Error al buscar usuario");
      }
      else{
        toast.error("Error al solicitar búsqueda");
      }
    } finally {
      setCargandoBusqueda(false);
    }
  };

  const onConvertirParticipante = async () => {
    if (!usuarioEncontrado) return;

    setCargandoConversion(true);

    try {
      const resultado = await agregarUsuarioGrupo({
        id_usuario: usuarioEncontrado.id,
        id_grupo: 4,
      });

      setUsuarioEncontrado((prev) => ({ ...prev, esParticipante: true }));
      toast.success("Usuario convertido a participante exitosamente");
    } catch (error) {
      if ([400, 404].includes(error.response?.status)) {
        toast.error(
          error.response?.data?.message || "Error al convertir usuario"
        );
      } else {
        toast.error("Error de conexión");
      }
    } finally {
      setCargandoConversion(false);
    }
  };

  const onRegistrarParticipacion = async (data) => {
    if (!usuarioEncontrado) return;
    if (!metaInfo) return;

    if (metaInfo?.precio_meta <= 0) {
      toast.error("El precio meta no es válido");
      return;
    }

    setCargandoParticipacion(true);

    try {
      const payload = {
        id_usuario: usuarioEncontrado.id,
        monto_meta: data.monto_meta,
        precio_meta: metaInfo?.precio_meta,
      };

      await agregarParticipacion(payload);

      toast.success("Participación registrada exitosamente");
      formParticipacion.reset();
      setReloadMetaInfo((prev) => !prev);
    } catch (error) {
      if ([400].includes(error.response?.status)) {
        toast.error(
          error.response?.data?.message || "Error al registrar participación"
        );
      } else {
        toast.error("Error de conexión");
      }
    } finally {
      setCargandoParticipacion(false);
    }
  };

  const PreviewResultado = ({precio,monto}) => {
    return (
      <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 border rounded-lg p-4 shadow-sm">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-xs text-muted-foreground">Precio actual</span>
          <span className="font-semibold text-lg text-primary">
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'USD',
            }).format(precio)}
          </span>
        </div>
        <div className="flex flex-col items-center md:items-end">
          <span className="text-xs text-muted-foreground">Resultado</span>
          <span className="font-semibold text-lg text-green-700">
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'USD',
            }).format(monto)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Registro de Participante
        </CardTitle>
        <CardDescription>
          Busca por cédula y, si el usuario cumple, registra su participación
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sección Buscar por Cédula */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Buscar por Cédula</h3>

          <Form {...formBusqueda}>
            <form
              onSubmit={formBusqueda.handleSubmit(onBuscarUsuario)}
              className="flex gap-2"
            >
              <FormField
                control={formBusqueda.control}
                name="cedula"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="sr-only">Cédula</FormLabel>
                    <Input
                      placeholder="Ej: 1234567"
                      disabled={cargandoBusqueda}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={cargandoBusqueda}>
                {cargandoBusqueda ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Buscar
              </Button>
            </form>
          </Form>
        </div>

        {/* Resultado de búsqueda */}
        {usuarioEncontrado === null &&
          formBusqueda.formState.isSubmitted &&
          !cargandoBusqueda && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No encontrado</AlertTitle>
              <AlertDescription>
                No existe un usuario con esa cédula
              </AlertDescription>
            </Alert>
          )}

        {usuarioEncontrado && (
          <div className="space-y-4">
            {/* Información del usuario */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Usuario Encontrado</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{usuarioEncontrado.documento}</Badge>
                  <span className="font-medium">
                    {usuarioEncontrado.nombre} {usuarioEncontrado.apellido}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {usuarioEncontrado.grupos.map((grupo) => (
                    <Badge
                      key={grupo.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {grupo.nombre}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Verificación y conversión */}
            {!puedeRegistrar && (
              <div className="space-y-3">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Conversión requerida</AlertTitle>
                  <AlertDescription>
                    Este usuario debe ser convertido a participante para poder
                    registrar participaciones
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={onConvertirParticipante}
                  disabled={cargandoConversion}
                  className="w-full"
                >
                  {cargandoConversion ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Convertir a Participante
                </Button>
              </div>
            )}

            {puedeRegistrar && (
              <Alert>
                <UserCheck className="h-4 w-4" />
                <AlertTitle>Usuario habilitado</AlertTitle>
                <AlertDescription>
                  Este usuario puede registrar participación
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Formulario de Participación */}
        {puedeRegistrar && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Registro de Participación</h3>

            <Form {...formParticipacion}>
              <form
                onSubmit={formParticipacion.handleSubmit(
                  onRegistrarParticipacion
                )}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={formParticipacion.control}
                    name="monto_meta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto Meta</FormLabel>
                        <NumericFormat
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.floatValue);
                          }}
                          thousandSeparator="."
                          decimalSeparator=","
                          customInput={Input}
                          decimalScale={2}
                          fixedDecimalScale
                          allowNegative={false}
                          placeholder="Ingrese el monto meta"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
                  <PreviewResultado
                    precio={metaInfo?.precio_meta || 0}
                    monto={
                      (formParticipacion.watch("monto_meta") || 0) *
                      (metaInfo?.precio_meta || 0)
                    }
                  />
                

                <Button
                  type="submit"
                  disabled={cargandoParticipacion}
                  className="w-full"
                >
                  {cargandoParticipacion ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Guardar participación
                </Button>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Funciones mock para simular API calls
const buscarUsuarioPorCedula = async (cedula) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulamos diferentes casos
      if (cedula === "1234567") {
        resolve({
          ok: true,
          data: {
            id: 1,
            nombre: "Juan",
            apellido: "Pérez",
            documento: cedula,
            grupos: [
              { id: 1, nombre: "Usuarios" },
              { id: 4, nombre: "Grupo Especial" },
            ],
            esParticipante: false,
          },
        });
      } else if (cedula === "7654321") {
        resolve({
          ok: true,
          data: {
            id: 2,
            nombre: "María",
            apellido: "González",
            documento: cedula,
            grupos: [{ id: 1, nombre: "Usuarios" }],
            esParticipante: true,
          },
        });
      } else if (cedula === "9999999") {
        resolve({
          ok: true,
          data: {
            id: 3,
            nombre: "Carlos",
            apellido: "López",
            documento: cedula,
            grupos: [{ id: 2, nombre: "Otros" }],
            esParticipante: false,
          },
        });
      } else {
        resolve({
          ok: false,
          error: "Usuario no encontrado",
        });
      }
    }, 1000);
  });
};

const convertirEnParticipante = async (idUsuario) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ok: true });
    }, 800);
  });
};

const crearParticipacion = async (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Creando participación:", payload);
      resolve({ ok: true });
    }, 1000);
  });
};
