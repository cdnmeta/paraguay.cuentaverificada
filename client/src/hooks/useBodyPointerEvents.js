import { useEffect, useRef } from 'react';

/**
 * Hook para gestionar el pointer-events del body de manera segura
 * cuando múltiples componentes pueden estar manipulándolo simultáneamente
 */
export function useBodyPointerEvents() {
  const isBlockingRef = useRef(false);

  const blockPointerEvents = () => {
    if (!isBlockingRef.current) {
      document.body.style.pointerEvents = 'none';
      isBlockingRef.current = true;
    }
  };

  const restorePointerEvents = () => {
    if (isBlockingRef.current) {
      document.body.style.pointerEvents = '';
      isBlockingRef.current = false;
    }
  };

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (isBlockingRef.current) {
        document.body.style.pointerEvents = '';
      }
    };
  }, []);

  return {
    blockPointerEvents,
    restorePointerEvents,
    isBlocking: isBlockingRef.current
  };
}

/**
 * Hook para limpiar pointer-events después de que se cierre un diálogo
 */
export function useDialogCleanup() {
  const cleanupPointerEvents = () => {
    setTimeout(() => {
      // Solo limpiar si no hay diálogos modales abiertos
      const modals = document.querySelectorAll('[data-radix-popper-content-wrapper], [data-state="open"][role="dialog"]');
      if (modals.length === 0) {
        document.body.style.pointerEvents = '';
      }
    }, 100);
  };

  return { cleanupPointerEvents };
}