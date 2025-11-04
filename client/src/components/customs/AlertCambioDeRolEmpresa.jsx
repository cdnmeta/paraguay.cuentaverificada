import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { useGruposEmpresaStore } from "@/store/useGrupoEmpresaStore";
import { useGruposEmpresa } from "@/hooks/useGrupoEmpresa";
import { redirect, replace, useNavigate } from "react-router-dom";
import { getUrlDashboardGrupos } from "@/utils/routes.routes";
import { useDialogCleanup } from "@/hooks/useBodyPointerEvents";
import { useCallback, useMemo } from "react";

const AlertCambioDeRolEmpresa = ({ user }) => {
  useGruposEmpresa(user?.id); // carga automática al montar
  const navigate = useNavigate();
  const { cleanupPointerEvents } = useDialogCleanup();

  const {
    gruposEmpresa,
    grupoSeleccionado,
    openDialogGruposEmpresa,
    isLoading,
    error,
    setGrupoSeleccionado,
    setOpenDialogGruposEmpresa
  } = useGruposEmpresaStore();

  const grupoActual = useMemo(() => 
    gruposEmpresa.find(grupo => String(grupo.id) === String(grupoSeleccionado)), 
    [grupoSeleccionado, gruposEmpresa]
  );

  const handleCambioGrupo = useCallback(async (id) => {
    console.log("Cambio de rol solicitado:", id);
    
    const success = setGrupoSeleccionado(id);
    if (!success) {
      console.error("No se pudo seleccionar el grupo:", id);
      return;
    }

    setOpenDialogGruposEmpresa(false);
    cleanupPointerEvents();
    
    // Navegar al dashboard del grupo seleccionado
    try {
      // ir a al dashboard del grupo reemplazando el historial
      navigate(getUrlDashboardGrupos(id), { replace: true }); 
    } catch (error) {
      console.error("Error al navegar:", error);
    }
  }, [setGrupoSeleccionado, setOpenDialogGruposEmpresa, cleanupPointerEvents, navigate]);

  const ItemGrupo = useCallback(({ id, descripcion }) => {
    const isSelected = String(grupoSeleccionado) === String(id);
    
    return (
      <li
        key={id}
        className={`flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-colors ${
          isSelected
            ? "bg-muted border-primary"
            : "hover:bg-accent"
        }`}
        onClick={() => handleCambioGrupo(id)}
      >
        <Checkbox checked={isSelected} readOnly />
        <span>{descripcion}</span>
      </li>
    );
  }, [grupoSeleccionado, handleCambioGrupo]);

  const handleOpenChange = useCallback((open) => {
    setOpenDialogGruposEmpresa(open);
    
    // Si se está cerrando el diálogo, limpiar pointer-events
    if (!open) {
      cleanupPointerEvents();
    }
  }, [setOpenDialogGruposEmpresa, cleanupPointerEvents]);

  // No mostrar el diálogo si no hay grupos disponibles
  if (!gruposEmpresa.length && !isLoading) {
    return null;
  }

  return (
    <Dialog open={openDialogGruposEmpresa} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Cambiar Rol de Empresa {grupoActual ? `(${grupoActual.descripcion})` : ''}
          </DialogTitle>
          <DialogDescription>
            {error && (
              <div className="text-red-500 text-sm mb-2">
                Error: {error}
              </div>
            )}
            {isLoading ? (
              <div className="text-center py-4">
                <span>Cargando grupos...</span>
              </div>
            ) : (
              <ul className="space-y-2 mt-4">
                {gruposEmpresa.map((grupo) => (
                  <ItemGrupo key={grupo.id} {...grupo} />
                ))}
              </ul>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlertCambioDeRolEmpresa;
