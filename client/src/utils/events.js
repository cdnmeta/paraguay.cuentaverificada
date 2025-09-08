// src/utils/eventBus.js
const bus = new EventTarget();

export const EVENTS = {
  SOLICITUD_COMERCIO_ACTUALIZADA: "solicitud_comercio_actualizada",
  VERIFICACION_COMERCIO_ACTUALIZADA: "verificacion_comercio_actualizada",
  SOLICITUDES_CUENTA_ACTUALIZADA: "SOLICITUDES_CUENTA_ACTUALIZADA",
};

/** Emitir un evento con un payload opcional */
export function emit(type, detail = {}) {
  bus.dispatchEvent(new CustomEvent(type, { detail }));
}

/** Suscribirse a un evento (devuelve función de cleanup) */
export function on(type, handler) {
  const listener = (e) => handler(e.detail);
  bus.addEventListener(type, listener);
  return () => bus.removeEventListener(type, listener);
}
