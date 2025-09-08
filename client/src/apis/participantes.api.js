import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "participantes";
// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`, // Cambia esto por
})

export const agregarParticipacion = async (data) => {
  return await api.post(`/registrar-participacion`, data, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    }
  });
};

