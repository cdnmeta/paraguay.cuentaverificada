import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "notificaciones";

// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`, // Cambia esto por
});

export const suscribirNotificaciones = async (subscription) => {
  const response = await api.post("/suscribe-notificacion", subscription, {
      headers: {
        Authorization: `Bearer ${await getIdToken()}`,
      },
    }
  );
  return response;
};

export const getNotificacionesUsuario = async () => {
  const response = await api.get("/mis-notificaciones", {
      headers: {
        Authorization: `Bearer ${await getIdToken()}`,
      },
    }
  );
  return response;
}