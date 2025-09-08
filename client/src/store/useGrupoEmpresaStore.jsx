// store/useGruposEmpresaStore.ts
import { create } from "zustand";

export const useGruposEmpresaStore = create((set, get) => ({
  gruposEmpresa: [],
  grupoSeleccionado: null,
  openDialogGruposEmpresa: false,
  setOpenDialogGruposEmpresa: (isOpen) => set({ openDialogGruposEmpresa: isOpen }),
  setGruposEmpresa: (grupos) => {
    set({ gruposEmpresa: grupos });

    const savedId = localStorage.getItem("grupoSeleccionado");

    if (savedId && grupos.find((g) => g.id == savedId)) {
      set({ grupoSeleccionado: savedId });
    } else {
      // 🧹 Eliminar si no existe más
      localStorage.removeItem("grupoSeleccionado");
      set({ grupoSeleccionado: null });
    }
  },

  

  setGrupoSeleccionado: (id) => {
    localStorage.setItem("grupoSeleccionado", id);
    set({ grupoSeleccionado: id });
  },

  getGrupoSeleccionado: () => {
    const state = get();
    return state.gruposEmpresa.find(
      (grupo) => grupo.id == state.grupoSeleccionado
    );
  },
}));
