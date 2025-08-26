import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "verificacion-comercio";

// Cache del token con expiración


// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`,
});


export const updateSeguimientoSolicitudComercio = async (id, data) => {
  return api.put(`/seguimiento-verificacion-comercio/${id}`, data, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`, // Usa token cacheado
    },
  });
};

export const solicitarVerificacionComercio = async (data) => {
  return api.post("/solicitar-verificacion", data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${await getIdToken()}`, // Usa token cacheado
    },
  });
};

export const updateSolicitudComercio = async (id, data) => {
  return api.put(`/solicitar-verificacion/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${await getIdToken()}`, // Usa token cacheado
    },
  });
}

export const rechazarPagoSolicitudComercio = async (data) => {
  return api.post(`/rechazo-pago-verificacion/`, data, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`, // Usa token cacheado
    },
  });
};


export const getComerciosAprovar = async () => {
  return api.get(`/listado-comercios-aprobar`, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`, // Usa token cacheado
    },
  });
};

export const rechazarComercio = async (data) => {
  return api.post(`/rechazar-comercio`, data, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`, // Usa token cacheado
    },
  });
};

export const verificarInformacionComercio = async (data) => {
  return api.post(`/verificar-informacion/`, data, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`, // Usa token cacheado
    },
  });
};

export const actualizarVerificacionComercio = async (id,data) => {
  return api.put(`verificar-informacion/${id}`, data, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`, // Usa token cacheado
    },
  });
};


export const verificarComercio = async (data) => {
  return api.post(`/verificar-comercio`, data, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`, // Usa token cacheado
    },
  });
}
