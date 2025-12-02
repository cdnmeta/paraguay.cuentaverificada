import { storage } from "@/firebaseConfig";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { getDownloadURL, ref } from "firebase/storage";
import { TOKEN_CACHE_DURATION } from "./constants";
import { toast } from "sonner";
import { refreshTokenJwt } from "@/apis/auth.api";

// Flag para prevenir múltiples refreshes simultáneos
let isRefreshingToken = false;
let pendingTokenPromise = null;

export const getIdToken = async () => {
  try {
    let tokenJwt = useAuthStore.getState().tokenJwtUser;
    
    // Si no hay token, retornar null
    if (!tokenJwt) {
      return null;
    }

    // decode token to check expiration
    const payload = JSON.parse(atob(tokenJwt.split(".")[1]));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    const tokenExpirado = exp <= now;

    // Si el token ya expiró, no intentar refrescarlo desde aquí
    // Dejar que el interceptor de Axios maneje la renovación
    if (tokenExpirado) {
      console.log("Token expirado, será manejado por el interceptor");
      return tokenJwt; // Retornar el token expirado para que el interceptor lo detecte
    }

    // Si expira en 5 minutos o menos y no está expirado, refrescar preventivamente
    if (exp - now <= (60 * 5)) {
      // Prevenir múltiples refreshes simultáneos
      if (isRefreshingToken) {
        // Si ya se está refrescando, esperar a que termine
        if (pendingTokenPromise) {
          await pendingTokenPromise;
          return useAuthStore.getState().tokenJwtUser;
        }
        return tokenJwt;
      }

      isRefreshingToken = true;
      console.log("Token cerca de expirar, refrescando preventivamente");
      
      try {
        // Crear una promesa para que otros calls puedan esperarla
        pendingTokenPromise = refreshTokenJwt();
        const refresh = await pendingTokenPromise;
        const { token } = refresh.data;
        
        useAuthStore.getState().setTokenJwtUser(token);
        tokenJwt = token;
        
        console.log("Token refrescado preventivamente");
      } catch (refreshError) {
        console.error("Error al refrescar token preventivamente:", refreshError);
        // En caso de error, retornar el token actual
      } finally {
        isRefreshingToken = false;
        pendingTokenPromise = null;
      }
    }

    return tokenJwt;
  } catch (error) {
    console.error("Error al obtener el idToken:", error);
    return null;
  }
};

export const checkAuthOnStart = async () => {
  const token = useAuthStore.getState().tokenJwtUser;
  if (token) {
    try {
      await useAuthStore.getState().fetchUser();
    } catch (err) {
      console.error("❌ Error verificando sesión:", err);
      useAuthStore.getState().logout();
    }
  } else {
    try {
      console.log("🔄 No hay token, intentando refresh desde cookie...");
      const response = await refreshTokenJwt();
      const newToken = response.data.token;
      
      // ✅ Guardar el nuevo token
      useAuthStore.getState().setTokenJwtUser(newToken);
      
      // ✅ IMPORTANTE: Después del refresh, obtener los datos del usuario
      await useAuthStore.getState().fetchUser();
      
      console.log("✅ Sesión restaurada exitosamente");
    } catch (error) {
      console.error("❌ Error en refresh token:", error);
      useAuthStore.getState().logout();
    }
  }
  useAuthStore.getState().setHydrated();
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

/**
 * Rellena un número con un carácter específico hasta alcanzar una cantidad máxima de dígitos
 * @param {number} cantidadDigitosMax - Cantidad máxima de dígitos que debe tener el string resultante
 * @param {number|string} numero - Número a rellenar
 * @param {string} relleno - Carácter usado para el relleno (por defecto "0")
 * @returns {string} - String con el número rellenado
 * 
 * @example
 * rellenarNumero(5, 2, "0") // "00002"
 * rellenarNumero(3, 42) // "042"
 * rellenarNumero(4, 7, "#") // "###7"
 */
export  const rellenarNumero = (cantidadDigitosMax, numero,relleno = "0") => {
  // Convertir el número a string
  const numeroStr = String(numero);
  
  // Si el número ya tiene la cantidad de dígitos requerida o más, devolverlo tal como está
  if (numeroStr.length >= cantidadDigitosMax) {
    return numeroStr;
  }
  
  // Calcular cuántos caracteres de relleno necesitamos
  const cantidadRelleno = cantidadDigitosMax - numeroStr.length;
  
  // Crear el relleno y concatenar con el número
  return relleno.repeat(cantidadRelleno) + numeroStr;
};


// FUncion para crear wa.me links
export const crearEnlaceWhatsApp = (numeroTelefono, mensaje = "") => {
  // Eliminar espacios, guiones y paréntesis del número de teléfono
  const numeroLimpio = numeroTelefono.replace(/[\s\-()]/g, '');
  // Codificar el mensaje para URL
  const mensajeCodificado = encodeURIComponent(mensaje);
  // Construir el enlace de WhatsApp
  return `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
}



