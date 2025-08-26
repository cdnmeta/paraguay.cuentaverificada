// stores/useAlertDialogStore.js
import { create } from "zustand";

export const useAlertDialogStore = create((set) => ({
  open: false,
  title: "",
  description: "",
  type: "info", // info | success | error | warning | question
  confirmText: "Aceptar",
  cancelText: "Cancelar",
  showCancel: true,
  closeOnOutsideClick: true, // <-- NUEVO
  onConfirm: null,

  showAlert: ({
    title,
    description,
    type = "info",
    onConfirm,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    showCancel = true,
    closeOnOutsideClick = true, // <-- NUEVO
  }) =>
    set({
      open: true,
      title,
      description,
      type,
      confirmText,
      cancelText,
      showCancel,
      closeOnOutsideClick,
      onConfirm,
    }),

  closeAlert: () =>
    set({
      open: false,
      onConfirm: null,
    }),
}));
