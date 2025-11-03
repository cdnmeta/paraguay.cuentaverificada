import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "estados-animos";
// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`, // Cambia esto por
});

export const getTiposEstadosAnimo = async () => {
  const response = await api.get("/tipos-estados", {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
  return response;
}

export const getEstadosAnimosById = async (id) => {
  const response = await api.get(`/${id}`, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
  return response;
}

export const getMensajesEstadosAnimo = async (params) => {
  const response = await api.get("/listado", {
    params,
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
  return response;
};

export const getMensajeDelDia = async (params) => {
  const response = await api.get("/obtener-mensaje", {
    params,
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
  return response;
};

export const crearMensajeEstadoAnimo = async (data) => {
  const response = await api.post("/", data, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
  return response;
};

export const actualizarMensajeEstadoAnimo = async (id, data) => {
  const response = await api.put(`/${id}`, data, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
  return response;
};

export const eliminarMensajeEstadoAnimo = async (id) => {
  const response = await api.delete(`/${id}`, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
  return response;
};
