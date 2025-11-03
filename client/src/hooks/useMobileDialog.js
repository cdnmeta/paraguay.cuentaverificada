import { useEffect } from 'react';

/**
 * Hook para optimizar el comportamiento de diálogos en dispositivos móviles
 * Maneja el scroll del body, la posición del viewport y otros ajustes específicos
 */
export const useMobileDialog = (isOpen) => {
  useEffect(() => {
    if (!isOpen) return;

    // Prevenir scroll del body cuando el diálogo está abierto
    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = originalStyle.overflow;
    const originalPosition = originalStyle.position;
    const scrollY = window.scrollY;

    // Aplicar estilos para móvil
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    // Agregar clase para detectar en CSS
    document.body.classList.add('dialog-open');

    // Manejar el viewport en iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // Prevenir zoom en inputs
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const originalViewport = viewportMeta?.getAttribute('content');
      
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }

      return () => {
        // Restaurar estilos originales
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.classList.remove('dialog-open');

        // Restaurar posición del scroll
        window.scrollTo(0, scrollY);

        // Restaurar viewport
        if (viewportMeta && originalViewport) {
          viewportMeta.setAttribute('content', originalViewport);
        }
      };
    }

    return () => {
      // Cleanup para no-iOS
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.classList.remove('dialog-open');

      // Restaurar posición del scroll
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);
};

/**
 * Hook para detectar si estamos en un dispositivo móvil
 */
export const useIsMobile = () => {
  const isMobile = () => {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  return isMobile();
};

/**
 * Hook para manejar múltiples diálogos de forma optimizada
 */
export const useMultipleMobileDialogs = (dialogStates) => {
  const isAnyDialogOpen = Object.values(dialogStates).some(state => {
    if (typeof state === 'boolean') return state;
    if (typeof state === 'object' && state !== null) return state.open;
    return false;
  });

  useMobileDialog(isAnyDialogOpen);

  return { isAnyDialogOpen };
};