import { getComerciosAprovar, rechazarComercio, verificarComercio } from "@/apis/verificacioComercios";
import {
  AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-tables/data-table";
import { Check, Eye, X } from "lucide-react";
import React, { useEffect, useMemo, useState, useCallback, useTransition } from "react";
import { toast } from "sonner";
import InfoComercioAprobar from "./InfoComercioAprobar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader as DialogHeader2, DialogTitle as DialogTitle2,
} from "@/components/ui/dialog";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import BadgeEstadoComercio from "@/components/customs/BadgeEstadoComercio";

const rechazoSchema = z.object({
  id_comercio: z.coerce.number().int().positive({ message: "Id de comercio es requerido" }),
  motivo: z.string({ required_error: "Motivo es requerido" }).trim().min(2).max(100),
});

const MODES = { REJECT: "reject", APPROVE: "approve", VERIFY: "verify" };

export default function ListSolicitudComercios() {
  const [data, setData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [selectedComercio, setSelectedComercio] = useState(null);
  const [verificandoComercio, startTransition] = useTransition();

  const {
    formState: { isSubmitting, errors },
    register,
    handleSubmit,
    reset,
  } = useForm({
    resolver: zodResolver(rechazoSchema),
    defaultValues: { id_comercio: undefined, motivo: "" },
  });

  const getId = (c) => Number(c?.id ?? c?.id_comercio ?? c?.idComercio ?? NaN);

  const BotonVerInfoComercio = ({ comercio }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline"><Eye /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="!w-[60vw] !max-w-[60vw]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Detalles del Comercio</AlertDialogTitle>
        </AlertDialogHeader>
        <InfoComercioAprobar comercio={comercio} />
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="destructive">Cerrar</Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const openDialogFor = useCallback((mode, comercio) => {
    setSelectedComercio(comercio);
    setDialogMode(mode);
    if (mode === MODES.REJECT) {
      const id = getId(comercio);
      reset({ id_comercio: Number.isFinite(id) ? id : undefined, motivo: "" });
    }
    setDialogOpen(true);
  }, [reset]);

  const handleRechazoComercio = useCallback(async (formData) => {
    try {
      const payload = { motivo: formData.motivo, id_comercio: formData.id_comercio };
      await rechazarComercio(payload);
      toast.success("Comercio rechazado correctamente.");
      setDialogOpen(false);
      reset({ id_comercio: undefined, motivo: "" });
      const resp = await getComerciosAprovar();
      setData(resp.data);
    } catch {
      toast.error("No se pudo rechazar el comercio.");
    }
  }, [reset]);

  // ✅ Depende de selectedComercio para no capturar valores viejos
  const handleApprove = useCallback(async (explicitId) => {
    const id = Number(explicitId ?? getId(selectedComercio));
    if (!Number.isFinite(id)) {
      toast.error("No se encontró el ID del comercio.");
      return;
    }
    try {
      await verificarComercio({ id_comercio: id });
      toast.success("Comercio aprobado.");
      setDialogOpen(false);
      const resp = await getComerciosAprovar();
      setData(resp.data);
    } catch (e) {
      setDialogOpen(false);
      if ([400].includes(e?.response?.status)) {
        toast.error(e?.response?.data?.message || "Error al aprobar comercio.");
        return;
      }
      toast.error(e?.message || "No se pudo aprobar el comercio.");
    }
  }, [selectedComercio]);



  useEffect(() => {
    (async () => {
      try {
        const response = await getComerciosAprovar();
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al obtener comercios");
      }
    })();
  }, []);

  const columnas = useMemo(() => [
    { accessorKey: "razon_social", header: "Razón Social" },
    { accessorKey: "ruc", header: "RUC" },
    { accessorKey: "telefono", header: "Teléfono" },
    { header: "Estado", cell: ({ row }) => <BadgeEstadoComercio estado={row.original.estado_actual} /> },
    {
      header: "Acciones",
      cell: ({ row }) => {
        const original = row.original;
        return (
          <div className="flex gap-2">
            <BotonVerInfoComercio comercio={original} />
            <Button variant="destructive" onClick={() => openDialogFor(MODES.REJECT, original)}>
              <X />
            </Button>
            <Button variant="success" onClick={() => openDialogFor(MODES.APPROVE, original)}>
              <Check />
            </Button>
          </div>
        );
      },
    },
  ], [openDialogFor]);

  const FormRechazoComercio = () => (
    <form onSubmit={handleSubmit(handleRechazoComercio)}>
      <DialogHeader2>
        <DialogTitle2>Rechazar Comercio</DialogTitle2>
        <DialogDescription>
          ¿Seguro que deseas rechazar la solicitud de <b>{selectedComercio?.razon_social}</b>?
        </DialogDescription>
      </DialogHeader2>

      <input type="hidden" {...register("id_comercio", { valueAsNumber: true })} />

      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="motivo-rechazo">Motivo</Label>
          <Textarea id="motivo-rechazo" placeholder="Escribe el motivo…" {...register("motivo")} disabled={isSubmitting} />
          {errors.motivo && <p className="text-red-500 text-sm">{errors.motivo.message}</p>}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => !isSubmitting && setDialogOpen(false)} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="destructive" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Rechazando..." : "Rechazar"}
        </Button>
      </DialogFooter>
    </form>
  );

  const FormVerificacionComercio = () => {
    const id = getId(selectedComercio);
    return (
      <>
        <DialogHeader2>
          <DialogTitle2>Aprobar Comercio</DialogTitle2>
          <DialogDescription>
            ¿Deseas aprobar a <b>{selectedComercio?.razon_social}</b>?
          </DialogDescription>
        </DialogHeader2>
        <div className="py-4 text-sm text-muted-foreground">
          Esta acción marcará el comercio como verificado y habilitado.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          {/* ✅ Pasamos el id explícito para evitar cierres obsoletos */}
          <Button
            variant="success"
            onClick={() => startTransition(() => { void handleApprove(id); })}
            disabled={!Number.isFinite(id)}
          >
            {verificandoComercio ? "Verificando..." : "Aprobar"}
          </Button>
        </DialogFooter>
      </>
    );
  };

  const renderDialogBody = () => {
    if (!dialogMode) return null;
    if (dialogMode === MODES.REJECT)  return <FormRechazoComercio />;
    if (dialogMode === MODES.APPROVE) return <FormVerificacionComercio />;
    if (dialogMode === MODES.VERIFY)  return <FormVerificacionComercio />;
    return null;
  };

  return (
    <div className="w-full p-4">
      <DataTable columns={columnas} data={data} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-[480px]"
          onEscapeKeyDown={(e) => {
            if (dialogMode === MODES.REJECT && isSubmitting) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (dialogMode === MODES.REJECT && isSubmitting) e.preventDefault();
          }}
        >
          {renderDialogBody()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
