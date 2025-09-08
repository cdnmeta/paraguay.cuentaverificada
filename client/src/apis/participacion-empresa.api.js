import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "participacion-empresa";
// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`, // Cambia esto por
})


export const getPrecioMeta = async () => {
  const token = await getIdToken();
  const response = await api.get("/consultar-precio", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const obtenerParticipaciones = async () => {
  return await api.get(`/mis-participaciones`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    }
  });
}
