import { auth, storage } from "@/firebaseConfig";
import { getAuth, signOut } from "firebase/auth";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { getDownloadURL, ref } from "firebase/storage";
import { TOKEN_CACHE_DURATION } from "./constants";
import { toast } from "sonner";

export const getIdToken = async (forzarRefresh = false) => {
  try {
    const user = auth.currentUser;
  if (!user) return null;
  if(forzarRefresh){
    return await user?.getIdToken(true);
  }

  // 🔄 Esto devuelve un idToken nuevo si está cerca de expirar
  return await user?.getIdToken();
  } catch (error) {
    console.error("Error al obtener el idToken:", error);
  }
};

export const logout = async () => {
  const auth = getAuth();
  await signOut(auth);
  // Aquí podrías agregar lógica adicional para limpiar el estado de la aplicación
};

export const checkAuthOnStart = async () => {
  console.log("checkAuthOnStart invoked");
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      
      if (user) {
        console.log("Usuario autenticado:", user)
        try {
          await useAuthStore.getState().fetchUser(); // obtiene info desde backend
        } catch (err) {
          console.error("❌ Error verificando sesión:", err);
          useAuthStore.getState().logout();
        }
      } else {
        useAuthStore.getState().logout();
      }

      useAuthStore.getState().setHydrated(); // marcar hidratado
      unsubscribe();
      resolve();
    });
  });
};

/**
 * Convierte un monto de una moneda a otra utilizando una lista de cotizaciones.
 *
 * @param {Array<Object>} cotizaciones - Lista de cotizaciones disponibles. Cada cotización debe tener las propiedades:
 *   - {string|number} id_moneda_origen - ID de la moneda de origen.
 *   - {string|number} id_moneda_destino - ID de la moneda de destino.
 *   - {number} monto - Tasa de conversión de la moneda de origen a la de destino.
 * @param {number} monto - Monto a convertir.
 * @param {string|number} origen - ID de la moneda de origen.
 * @param {string|number} destino - ID de la moneda de destino.
 * @returns {number} El monto convertido a la moneda de destino.
 * @throws {Error} Si no hay cotizaciones disponibles o no existe una tasa de conversión entre las monedas especificadas.
 */
export function convertirMoneda(cotizaciones = [], monto, origen, destino) {
  if (cotizaciones.length == 0) {
    throw new Error("No hay cotizaciones para hacer la conversion");
  }

  const converciones = {}

  if (origen === destino) {
    return { compra: monto, venta: monto };
  }

  const directa = cotizaciones.find(
    (t) => t.id_moneda_origen === origen && t.id_moneda_destino === destino
  );
  const inversa = cotizaciones.find(
    (t) => t.id_moneda_origen === destino && t.id_moneda_destino === origen
  );

  if (directa) {
    converciones.compra = monto * directa.monto_compra;
    converciones.venta = monto * directa.monto_venta;
    return converciones;
  } else if (inversa) {
    converciones.compra = monto / inversa.monto_compra;
    converciones.venta = monto / inversa.monto_venta;
    return converciones;
  } else {
    throw new Error("No hay tasa...");
  }
}

export const cargarURL = async (urlImg) => {
  try {
    const url = await getDownloadURL(ref(storage, urlImg));
    return url;
  } catch (error) {
    console.error("Error al obtener URL del comprobante:", error);
    return null;
  }
};


export const executePeticionAxios = async (peticionFunc = () => {}) => {
  try {
    if (typeof peticionFunc !== 'function') {
      throw new Error("peticionFunc debe ser una función que retorne una promesa de Axios");
    }
    return  peticionFunc();
  } catch (error) {
    if([400,404].includes(error?.response?.status)){
      console.log("mostrar datos")
      toast.error(error?.response?.data?.message || "Error en la petición");
      throw error;
    }
    toast.error("Error en la petición: " + error?.message || "Error desconocido");
    throw error;
  }
}

/**
 * Helper para ejecutar peticiones con manejo automático de errores y toasts
 * @param {Function} peticionFunc - Función que retorna una promesa (API call)
 * @param {Object} opciones - Opciones para personalizar el comportamiento
 * @param {string} opciones.mensajeExito - Mensaje de éxito opcional
 * @param {string} opciones.mensajeError - Mensaje de error personalizado
 * @param {boolean} opciones.mostrarToastError - Si mostrar toast de error (default: true)
 * @param {boolean} opciones.mostrarToastExito - Si mostrar toast de éxito (default: false)
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export const executeWithErrorHandler = async (peticionFunc, opciones = {}) => {
  const {
    mensajeExito,
    mensajeError,
    mostrarToastError = true,
    mostrarToastExito = false
  } = opciones;

  try {
    if (typeof peticionFunc !== 'function') {
      throw new Error("peticionFunc debe ser una función que retorne una promesa");
    }

    const resultado = await peticionFunc();
    
    // Mostrar toast de éxito si está configurado
    if (mostrarToastExito && mensajeExito) {
      toast.success(mensajeExito);
    }

    return {
      success: true,
      data: resultado
    };

  } catch (error) {
    console.error("Error en executeWithErrorHandler:", error);

    // Mostrar toast de error si está habilitado
    if (mostrarToastError) {
      let mensaje = mensajeError;
      
      if (!mensaje) {
        // Determinar mensaje de error automáticamente
        if (error?.response?.status && [400, 404].includes(error.response.status)) {
          mensaje = error?.response?.data?.message || "Error en la petición";
        } else {
          mensaje = error?.message || "Error desconocido";
        }
      }

      toast.error(mensaje);
    }

    return {
      success: false,
      error: error
    };
  }
};
