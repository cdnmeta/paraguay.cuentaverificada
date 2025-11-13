import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "wallet";

// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`,
});

// Función para obtener las wallets del usuario
export const obtenerWalletsDelUsuario = async () => {
  const idToken = await getIdToken();
  const response = await api.get("/mis-wallets", {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  return response;
};

// Función para obtener una wallet específica por ID
export const obtenerWalletPorId = async (id) => {
  const idToken = await getIdToken();
  const response = await api.get(`/mis-wallets/${id}`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  return response;
};

export const solicitarRecargaWallet = async (data) => {
    const idToken = await getIdToken();
    const response = await api.post(`/solicitar-recarga`, data, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        },
    });
    return response;
}

export const obtenerListadoSolicitudesRecargas = async () => {
    const idToken = await getIdToken();
    const response = await api.get(`/listado-solicitudes-recargas`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        },
    });
    return response;
}

export const aprobarSolicitudRecarga = async (id, data) => {
    const idToken = await getIdToken();
    const response = await api.put(`/aprobar-solicitud-recarga/${id}`, data, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
        },
    });
    return response;
}

export const rechazarSolicitudRecarga = async (id, data) => {
    const idToken = await getIdToken();
    const response = await api.put(`/rechazo-solicitud-recarga/${id}`, data, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
        },
    });
    return response;
}

export const obtenerMiMovimientosDeWallet = async (walletId) => {
    const idToken = await getIdToken();
    const response = await api.get(`/mi-movimiento/${walletId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        },
    });
    return response;
}

export const rehabilitarSolicitudRecarga = async (id, formData) => {
    const idToken = await getIdToken();
    const response = await api.put(`/habilitar-solicitud-recarga/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response;
}
