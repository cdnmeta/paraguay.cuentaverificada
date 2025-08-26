import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "pago-suscripciones";
// Crear una instancia de Axios
const api = axios.create({
  headers: {
    Authorization: `Bearer ${getIdToken()}`,
  },
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`, // Cambia esto por
});

export const crearPagoSuscripcion = async (data) => {
    const response = await api.post("/registrar-pago", data,{
        headers: {
            Authorization: `Bearer ${ await getIdToken()}`,
        },
    });
    return response;
};
