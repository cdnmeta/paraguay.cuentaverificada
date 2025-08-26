import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "entidades-bancarias";
// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`, // Cambia esto por
});
export const getEntidadesBancarias = async () => {

    const response = await api.get("/", {
      headers: {
        Authorization: `Bearer ${await getIdToken()}`
      }
    });
    return response;

};
