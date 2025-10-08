// store/useGruposEmpresaStore.ts
import { create } from "zustand";

export const useGruposEmpresaStore = create((set, get) => ({
  gruposEmpresa: [],
  grupoSeleccionado: null,
  openDialogGruposEmpresa: false,
  isLoading: false,
  error: null,

  setOpenDialogGruposEmpresa: (isOpen) => set({ openDialogGruposEmpresa: isOpen }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  setGruposEmpresa: (grupos) => {
    // Validar que grupos sea un array
    const validGroups = Array.isArray(grupos) ? grupos : [];
    set({ gruposEmpresa: validGroups, error: null });

    const savedId = localStorage.getItem("grupoSeleccionado");

    // Validar que el grupo guardado aún existe
    if (savedId && validGroups.find((g) => String(g.id) === String(savedId))) {
      set({ grupoSeleccionado: savedId });
    } else {
      // Si no existe, seleccionar el primer grupo disponible o limpiar
      if (validGroups.length > 0) {
        const firstGroupId = String(validGroups[0].id);
        localStorage.setItem("grupoSeleccionado", firstGroupId);
        set({ grupoSeleccionado: firstGroupId });
      } else {
        localStorage.removeItem("grupoSeleccionado");
        set({ grupoSeleccionado: null });
      }
    }
  },

  setGrupoSeleccionado: (id) => {
    const stringId = String(id);
    const state = get();
    
    // Verificar que el grupo existe antes de seleccionarlo
    const grupoExiste = state.gruposEmpresa.find((g) => String(g.id) === stringId);
    
    if (grupoExiste) {
      localStorage.setItem("grupoSeleccionado", stringId);
      set({ grupoSeleccionado: stringId });
      return true;
    } else {
      console.warn(`Grupo con ID ${stringId} no encontrado`);
      return false;
    }
  },

  getGrupoSeleccionado: () => {
    const state = get();
    return state.gruposEmpresa.find(
      (grupo) => String(grupo.id) === String(state.grupoSeleccionado)
    );
  },

  // Método para limpiar el store
  clearStore: () => {
    localStorage.removeItem("grupoSeleccionado");
    set({
      gruposEmpresa: [],
      grupoSeleccionado: null,
      openDialogGruposEmpresa: false,
      isLoading: false,
      error: null
    });
  },
}));
