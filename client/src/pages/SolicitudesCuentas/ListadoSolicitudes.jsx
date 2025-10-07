import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-tables/data-table";
import { Check, Copy, Eye, Key, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormEditarDatosSolicitud from "./FormEditarDatosSolicitud";
import { PhotoProvider } from "react-photo-view";
import { useTransition } from "react";
import { toast } from "sonner";
import BadgeEstadosSolicitudesCuentas from "@/components/customs/BadgeEstadosSolicitudesCuentas";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  aprobarCuenta,
  generarTokenSolicitudById,
  rechazarSolicitud,
} from "@/apis/verificacionCuenta.api";
import { emit, EVENTS } from "@/utils/events";
import { Form } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { se } from "date-fns/locale";
import { generarUrlInicializacionDeCredenciales } from "@/utils/auth";
export function DialogSolicitudes({ open, setOpen, contenido = {} }) {
  const className = contenido?.className || "sm:max-w-[425px] !z-[2000]";
  const classNameContenido = contenido?.classNameContenido || "p-6";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={className}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{contenido?.title}</DialogTitle>
        </DialogHeader>

        {contenido?.description && (
          <p className="text-sm opacity-80">{contenido.description}</p>
        )}
        <div className={classNameContenido}>{contenido?.componente}</div>
      </DialogContent>
    </Dialog>
  );
}
export default function ListadoSolicitudes({
  data = [],
  opcionesLista = {},
  columnasHabilitadas = {},
}) {
  const [open, setOpen] = React.useState(false);
  const [contenido, setContenido] = React.useState({});
  const [generating, setGenerating] = React.useState(false);
  const [tokenGenerado, setTokenGenerado] = React.useState(null);

  const {
    aprobarSolicitudes = false,
    rechazarSolicitudes = false,
    generarTokenUsuario = false,
  } = opcionesLista;
  const { ver_columna_verificador = false } = columnasHabilitadas;
  const columnas = [
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      accessorKey: "apellido",
      header: "Apellido",
    },
    {
      accessorKey: "documento",
      header: "Documento",
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
    },
    {
      accessorKey: "correo",
      header: "Correo",
    },
    {
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.original.id_estado;
        return <BadgeEstadosSolicitudesCuentas estado={estado} />;
      },
    },
  ];

  if (ver_columna_verificador)
    columnas.push({
      accessorKey: "nombre_verificador",
      header: "Verificador",
    });

  // 1) UI simple para mostrar estados
  const VistaTokenGenerado = ({ token, loading, documento }) => {
    if (loading) return <p className="text-muted-foreground">Generando...</p>;
    if (!token)
      return <p className="text-red-500">No se pudo generar el token.</p>;

    const url = generarUrlInicializacionDeCredenciales({
      token,
      cedula: documento,
    });

    const handleCopiar = (url) => {
      navigator.clipboard.writeText(url);
      toast.info("Enlace copiado", {
        richColors: true,
        duration: 800,
      });
      setOpen(false);
    };

    return (
      <div className="space-y-2">
        <p className="font-semibold">Token generado</p>

        <div className="relative">
          <p className="break-all rounded-md bg-muted p-2 pr-12">{url}</p>
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-1 right-1 h-7 w-7 p-0"
            onClick={() => handleCopiar(url)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // 2) El “contenedor” que se monta dentro del modal y hace la llamada al montar
  function TokenDialog({ solicitudId }) {
    const [loading, setLoading] = React.useState(true);
    const [token, setToken] = React.useState(null);
    const [documento, setDocumento] = React.useState(null);

    useEffect(() => {
      let alive = true;
      (async () => {
        try {
          // Llamada real a tu API
          const response = await generarTokenSolicitudById(solicitudId);
          const { token: TokenResponse, documento } = response.data;

          if (!alive) return;
          setDocumento(documento);
          setToken(TokenResponse);
        } catch (error) {
          const status = error?.status ?? error?.response?.status;
          if ([400, 404].includes(status)) {
            toast.error("Solicitud no encontrada", { richColors: true });
          } else {
            toast.error("Error al generar el token", { richColors: true });
          }
        } finally {
          if (alive) setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [solicitudId]);

    return (
      <VistaTokenGenerado
        token={token}
        loading={loading}
        documento={documento}
      />
    );
  }

  const handleGenerarToken = async (solicitud) => {
    try {
      setContenido({
        className: "sm:max-w-[600px] !z-[2000]",
        classNameContenido: "p-2",
        title: "Generar Token",
        componente: <TokenDialog solicitudId={solicitud.id} />,
      });
      setOpen(true);
    } catch (error) {
      if ([400, 404].includes(error?.status)) {
        toast.error("Solicitud no encontrada", { richColors: true });
        return;
      }
      toast.error("Error al generar el token");
    } finally {
      setGenerating(false);
    }
  };

  columnas.push({
    accessorKey: "Opciones",
    cell: ({ row }) => {
      const solicitud = row.original;
      const estadosVerSolicitud = [1, 2, 3, 4, 5]; // Estados

      const isVerEditable = estadosVerSolicitud.includes(solicitud.id_estado);
      const isAprobable = solicitud.id_estado === 2;
      const isTokenGenerable = solicitud.id_estado === 3;
      return (
        <div className="flex gap-1">

            <Tooltip>
              <TooltipTrigger>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  onClick={() => handleVerSolicitud(row.original)}
                >
                  <Eye />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver Solicitud</p>
              </TooltipContent>
            </Tooltip>

          {aprobarSolicitudes && isAprobable && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  size={"sm"}
                  variant={"success"}
                  onClick={() => handleAprobar(row.original)}
                >
                  <Check />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Aprobar Solicitudes</p>
              </TooltipContent>
            </Tooltip>
          )}

          {rechazarSolicitudes && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  size={"sm"}
                  variant={"destructive"}
                  onClick={() => handleRechazar(row.original)}
                >
                  <X />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rechazar Solicitudes</p>
              </TooltipContent>
            </Tooltip>
          )}
          {generarTokenUsuario && isTokenGenerable && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  onClick={() => handleGenerarToken(row.original)}
                >
                  <Key />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generar Token</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    },
  });

  const SIZES = {
    sm: "w-full sm:max-w-[425px]",
    md: "w-full max-w-[95vw] sm:max-w-[700px]",
    lg: "w-full max-w-[95vw] sm:max-w-[800px] md:max-w-[900px]",
    xl: "w-full max-w-[95vw] sm:max-w-[900px] md:max-w-[1100px]",
    full: "w-[98vw] h-[98vh]",
  };

  const FormAprobacion = ({ solicitud }) => {
    const [aprobando, startTransition] = useTransition();
    const handleAprobarSolicitud = async () => {
      try {
        await aprobarCuenta({ id_usuario_aprobacion: solicitud.id });
        toast.success("Solicitud aprobada");
        emit(EVENTS.SOLICITUDES_CUENTA_ACTUALIZADA, {
          when: Date.now(),
        });
      } catch (error) {
        if ([400, 404].includes(error?.status)) {
          toast.error(
            error?.response?.data?.message || "Solicitud no encontrada",
            { richColors: true }
          );
          return;
        }
        toast.error("Error al aprobar la solicitud", { richColors: true });
      } finally {
        setOpen(false);
      }
    };
    return (
      <div className="space-y-4">
        <div>
          <p className="font-semibold">
            ¿Estás seguro de aprobar esta solicitud?
          </p>
          <p>
            La cuenta de{" "}
            <span className="font-semibold">
              {solicitud?.nombre} {solicitud?.apellido} - {solicitud?.documento}
            </span>{" "}
            será aprobada.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={() => startTransition(handleAprobarSolicitud)}
          >
            {aprobando ? "Aprobando..." : "Aprobar Solicitud"}
          </Button>
        </div>
      </div>
    );
  };

  const FormRechazoSolicitud = ({ solicitud }) => {
    const schemaRechazo = z.object({
      motivo_rechazo: z
        .string()
        .min(2)
        .max(100)
        .nonempty("Este campo es obligatorio"),
      confirmar_rechazo: z.boolean().refine((val) => val === true, {
        message: "Debes confirmar el rechazo",
      }),
    });

    const formRechazo = useForm({
      resolver: zodResolver(schemaRechazo),
      defaultValues: {
        motivo_rechazo: "",
        confirmar_rechazo: false,
      },
    });

    const handleRechazarSolicitud = async (data) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const dataEnviar = {
          id_usuario_rechazo: solicitud.id,
          motivo: data.motivo_rechazo,
        };
        await rechazarSolicitud(dataEnviar);
        toast.success("Solicitud rechazada", { richColors: true });
        emit(EVENTS.SOLICITUDES_CUENTA_ACTUALIZADA, {
          when: Date.now(),
        });
        formRechazo.reset();
        setOpen(false);
      } catch (error) {
        if ([400, 404].includes(error?.status)) {
          toast.error("Solicitud no encontrada", { richColors: true });
          return;
        }
        toast.error("Error al rechazar la solicitud", { richColors: true });
      }
    };

    const disableBotonRechazar = () => {
      if (formRechazo.formState.isSubmitting) return true;
      if (formRechazo.getValues("confirmar_rechazo") === false) return true;
      return false;
    };

    return (
      <form
        onSubmit={formRechazo.handleSubmit(handleRechazarSolicitud)}
        className="space-y-4"
      >
        <div>
          <p className="font-semibold">
            ¿Estás seguro de rechazar esta solicitud?
          </p>
          <p>
            La cuenta de{" "}
            <span className="font-semibold">
              {solicitud?.nombre} {solicitud?.apellido} - {solicitud?.documento}
            </span>{" "}
            será rechazada.
          </p>
          <p className="uppercase font-semibold text-yellow-400">
            Por favor, proporciona un motivo para el rechazo:
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Motivo de rechazo</Label>
          <Textarea
            className={"h-[100px]"}
            placeholder="Escribe aquí el motivo del rechazo"
            {...formRechazo.register("motivo_rechazo")}
          />
          {formRechazo.formState.errors.motivo_rechazo && (
            <p className="text-red-500 text-sm">
              {formRechazo.formState.errors.motivo_rechazo.message}
            </p>
          )}
          <div className="flex gap-1 items-center">
            <Checkbox
              id="confirmar_rechazo"
              checked={formRechazo.watch("confirmar_rechazo")}
              onCheckedChange={(val) =>
                formRechazo.setValue("confirmar_rechazo", !!val)
              }
            />
            <Label htmlFor="confirmar_rechazo">
              Confirmo que deseo rechazar esta solicitud
            </Label>
          </div>
          {formRechazo.formState.errors.confirmar_rechazo && (
            <p className="text-red-500 text-sm">
              {formRechazo.formState.errors.confirmar_rechazo.message}
            </p>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              variant={"outline"}
              type="button"
              onClick={() => setOpen(false)}
            >
              Cerrar
            </Button>
            <Button
              disabled={disableBotonRechazar()}
              type="submit"
              variant="destructive"
            >
              {formRechazo.formState.isSubmitting
                ? "Rechazando..."
                : "Rechazar Solicitud"}
            </Button>
          </div>
        </div>
      </form>
    );
  };

  const afterSubmit = () => {
    setOpen(false);
    emit(EVENTS.SOLICITUDES_CUENTA_ACTUALIZADA, {
      when: Date.now(),
    });
  };

  const handleVerSolicitud = (solicitud) => {
    setContenido({
      className: `${SIZES.lg} overflow-y-auto`,
      classNameContenido: "max-h-[80vh] overflow-y-auto",
      title: "Detalles de la Solicitud",
      description: "Aquí puedes ver los detalles de la solicitud.",
      componente: (
        <FormEditarDatosSolicitud
          id={solicitud.id}
          afterSubmit={() => afterSubmit()}
        />
      ),
    });
    setOpen(true);
  };

  const handleAprobar = (solicitud) => {
    setContenido({
      className: `${SIZES.md} overflow-y-auto`,
      classNameContenido: "max-h-[70vh] overflow-y-auto",
      title: "Atencion",
      componente: <FormAprobacion solicitud={solicitud} />,
    });
    setOpen(true);
  };

  const handleRechazar = (solicitud) => {
    setContenido({
      className: `${SIZES.md} overflow-y-auto`,
      classNameContenido: "max-h-[70vh] overflow-y-auto",
      title: "Atencion",
      componente: <FormRechazoSolicitud solicitud={solicitud} />,
    });
    setOpen(true);
  };

  useEffect(() => {
    // Lógica para cargar las solicitudes
    if (!open) setContenido({}); // Limpiar contenido al cerrar el modal
  }, [open]);

  return (
    <>
      <DataTable columns={columnas} data={data} />
      <DialogSolicitudes open={open} setOpen={setOpen} contenido={contenido} />
    </>
  );
}
