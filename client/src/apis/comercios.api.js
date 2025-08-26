import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "comercios";
// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`, // Cambia esto por
});


export const getComerciosByQuery = async (query) => {
  return api.get(`/search`, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`, // Autenticación
    },
    params: query,
  });
};

export const getComerciosForUser = async (userId, query) => {
  return api.get(`/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`, // Autenticación
    },
    params: query,
  });
};

export const getComerciosAprovacionPagos = async () => {
  return api.get(`/aprobacion-pagos`, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`, // Autenticación
    },
  });
};

export const getComercioById = async (id) => {
  return api.get(`/${id}`, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`, // Autenticación
    },
  });
}
