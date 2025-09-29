import { Button } from "@/components/ui/button";
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
import { collection, doc, getDoc, query } from "firebase/firestore";
import { use, useEffect, useRef, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { useGruposEmpresaStore } from "@/store/useGrupoEmpresaStore";
import { useGruposEmpresa } from "@/hooks/useGrupoEmpresa";
import { useNavigate } from "react-router-dom";
import { getUrlDashboardGrupos } from "@/utils/routes.routes";
import { useDialogCleanup } from "@/hooks/useBodyPointerEvents";
const AlertCambioDeRolEmpresa = ({user}) => {
    useGruposEmpresa(user?.id); // carga automática al montar
    const navigate = useNavigate();
    const { cleanupPointerEvents } = useDialogCleanup();

  const gruposEmpresa = useGruposEmpresaStore((state) => state.gruposEmpresa);
  const grupoSeleccionado = useGruposEmpresaStore((state) => state.grupoSeleccionado);
  const setGrupoSeleccionado = useGruposEmpresaStore((state) => state.setGrupoSeleccionado);
  const openDialogGruposEmpresa = useGruposEmpresaStore((state) => state.openDialogGruposEmpresa);
  const setOpenDialogGruposEmpresa = useGruposEmpresaStore((state) => state.setOpenDialogGruposEmpresa);
  const getGrupoSeleccionado = useGruposEmpresaStore(
    (state) => state.getGrupoSeleccionado
  );
  const handleCambioGrupo = async (id) => {
    setGrupoSeleccionado(id);
    //closeRef.current.click(); // Cierra el diálogo
    setOpenDialogGruposEmpresa(false);
    
    // Limpiar pointer-events del body después de cerrar el diálogo
    cleanupPointerEvents();
    
    // Aquí puedes navegar al grupo seleccionado
    navigate(getUrlDashboardGrupos(id));
  }

  const ItemGrupo = (grupo) => {
    return (
      <li
        key={grupo.id}
        className={`flex items-center gap-3 p-2 rounded-md border cursor-pointer ${
          grupoSeleccionado === grupo.id
            ? "bg-muted border-primary"
            : "hover:bg-accent"
        }`}
        onClick={() => handleCambioGrupo(grupo.id)}
      >
        <Checkbox checked={grupoSeleccionado == grupo.id} />
        <span>{grupo.descripcion}</span>
      </li>
    );
  };
  const handleOpenChange = (open) => {
    setOpenDialogGruposEmpresa(open);
    
    // Si se está cerrando el diálogo, limpiar pointer-events
    if (!open) {
      cleanupPointerEvents();
    }
  };

  return (
    <Dialog open={openDialogGruposEmpresa} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Rol de Empresa ({getGrupoSeleccionado()?.descripcion})</DialogTitle>
          <DialogDescription>
            <ul className="space-y-2 mt-4">
              {gruposEmpresa.map((grupo) => (
                <ItemGrupo key={grupo.id} {...grupo} />
              ))}
            </ul>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlertCambioDeRolEmpresa;
