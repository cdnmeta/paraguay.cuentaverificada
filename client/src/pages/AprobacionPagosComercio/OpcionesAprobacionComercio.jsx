import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/firebaseConfig";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Eye, X, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // (si lo vas a usar luego)
import { useAuthStore } from "@/hooks/useAuthStorge";
import { estadosVerificacionDeComercio } from "@/utils/constants";
import {
  rechazarPagoSolicitudComercio,
  updateSeguimientoSolicitudComercio,
} from "@/apis/verificacioComercios";
import FormCobroSuscripcion from "../CobroSuscripcionesPlanes/FormCobroSuscripcion";

/* -------------------- Helpers UI -------------------- */

function ImagenConCarga({ src, alt }) {
  return (
    <div className="relative w-full">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto max-h-[70vh] object-contain rounded transition-opacity duration-500"
      />
    </div>
  );
}

/* -------------------- Ver comprobante -------------------- */

function BotonVerComprobante({ comercio }) {
  const [open, setOpen] = useState(false);
  const [urlComprobante, setUrlComprobante] = useState(null);
  const [errorCarga, setErrorCarga] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cargarURL = useCallback(async () => {
    if (!comercio?.url_comprobante_pago) {
      setUrlComprobante(null);
      setErrorCarga(false);
      return;
    }
    setIsLoading(true);
    setErrorCarga(false);
    try {
      const url = await getDownloadURL(
        ref(storage, comercio.url_comprobante_pago)
      );
      setUrlComprobante(url);
    } catch (error) {
      setUrlComprobante(null);
      setErrorCarga(true);
      console.error("Error al obtener URL del comprobante:", error);
    } finally {
      setIsLoading(false);
    }
  }, [comercio]);

  const handleOpenChange = useCallback(
    (v) => {
      setOpen(v);
      if (v) {
        // Carga al abrir (no en el click del trigger, para evitar dobles renders)
        cargarURL();
      } else {
        // Limpia al cerrar
        setUrlComprobante(null);
        setErrorCarga(false);
        setIsLoading(false);
      }
    },
    [cargarURL]
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleOpenChange(true)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Ver comprobante</p>
      </TooltipContent>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="sm:max-w-[60vw]"
          onEscapeKeyDown={(e) => {
            if (isLoading) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (isLoading) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Comprobante de {comercio?.razon_social}</DialogTitle>
            <DialogDescription>
              <div className="space-y-1">
                <p>
                  <strong>RUC:</strong> {comercio?.ruc}
                </p>
                <p>
                  <strong>Código Vendedor:</strong>{" "}
                  {comercio?.codigo_vendedor || "No asignado"}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center min-h-[200px]">
            {isLoading && (
              <p className="text-sm text-muted-foreground">
                Cargando comprobante…
              </p>
            )}
            {!isLoading && errorCarga && (
              <p className="text-sm text-red-500">
                Error al cargar el comprobante.
              </p>
            )}
            {!isLoading && !errorCarga && !urlComprobante && (
              <p className="text-sm text-muted-foreground">
                No se encontró el comprobante.
              </p>
            )}
            {!isLoading && !errorCarga && urlComprobante && (
              <ImagenConCarga
                src={urlComprobante}
                alt={`Comprobante de ${comercio?.razonSocial}`}
              />
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              variant="destructive"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tooltip>
  );
}

/* -------------------- Rechazar comprobante -------------------- */

function BotonRechazoPago({ comercio }) {
  const [open, setOpen] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [isPending, startTransition] = useTransition();
  const cancelButtonRef = useRef(null);

  const onConfirmarRechazo = useCallback(() => {
    startTransition(async () => {
      if (!motivoRechazo.trim()) {
        toast.error("Debes proporcionar un motivo para el rechazo.");
        return;
      }
      try {
        if (!comercio?.id_comercio) throw new Error("Comercio no existe");
        const payload = {
          motivo: motivoRechazo,
          id_comercio: comercio.id_comercio,
        };
        await rechazarPagoSolicitudComercio(payload);
        toast.info("Pago rechazado correctamente");
        setOpen(false);
      } catch (error) {
        if ([400].includes(error?.response?.status)) {
          toast.error(
            error?.response?.data?.message ||
              "Error al rechazar el pago del comercio."
          );
          return;
        }
        console.error("Error al rechazar:", error);
        toast.error(error?.message || "Error desconocido.");
      } finally {
        setMotivoRechazo("");
      }
    });
  }, [motivoRechazo, comercio]);

  const handleOpenChange = useCallback(
    (v) => {
      if (isPending) return; // evita flicker al enviar
      setOpen(v);
      if (!v) setMotivoRechazo("");
    },
    [isPending]
  );

  const disableConfirm = motivoRechazo.trim().length < 5 || isPending;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleOpenChange(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Rechazar comprobante</p>
        </TooltipContent>
      </Tooltip>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent
          onEscapeKeyDown={(e) => {
            if (isPending) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (isPending) e.preventDefault();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              Rechazar pago del Comercio {comercio?.razon_social}{" "}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-sm text-muted-foreground">¿Estás seguro?</p>
                <p className="text-sm text-red-500">
                  Esta acción no se puede deshacer.
                </p>
                <Label htmlFor="motivo" className="text-sm">
                  Motivo
                </Label>
                <textarea
                  id="motivo"
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  value={motivoRechazo}
                  className="border border-muted-foreground rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Escribe tu motivo aquí..."
                  disabled={isPending}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              ref={cancelButtonRef}
              onClick={() => !isPending && setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </AlertDialogCancel>

            <Button
              onClick={onConfirmarRechazo}
              className={"bg-red-500"}
              disabled={disableConfirm}
            >
              {isPending ? "Rechazando..." : "Rechazar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* -------------------- Registrar cobro / Aprobar pago -------------------- */

function BotonAprobarPagoComercio({ comercio }) {
  // Aquí abrimos un Dialog con un form grande (tu FormCobroSuscripcion)
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="success" onClick={() => setOpen(true)}>
        Reg Pago
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="sm:max-w-[60vw]"
        onInteractOutside={(e) => e.preventDefault()} 
        >
          <DialogHeader>
            <DialogTitle>Registrar Cobro</DialogTitle>
          </DialogHeader>
          <FormCobroSuscripcion id_factura={comercio?.id_factura} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* -------------------- Componente principal -------------------- */

export function OpcionesComercio({ comercio, reloadComercios }) {
  return (
    <div className="flex gap-2">
      {/* Ver comprobante */}
      <BotonVerComprobante comercio={comercio} />

      {/* Rechazar comprobante */}
      {[1].includes(comercio?.id_estado_comercio_actual) && (
        <BotonRechazoPago comercio={comercio}  />
      )}

      {/* Registrar cobro / Aprobar pago */}
      {[1].includes(comercio?.id_estado_comercio_actual) && (
        <BotonAprobarPagoComercio comercio={comercio}  />
      )}
    </div>
  );
}
