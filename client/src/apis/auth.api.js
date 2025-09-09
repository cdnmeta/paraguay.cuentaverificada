import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "auth";

// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`, // Cambia esto por tu URL base
});

export const login = async (credentials) => {
  const response = await api.post("/login", credentials, {
    headers: {
      "Content-Type": "application/json", // explícito
    },
  });
  return response;
};

export const getUserInfo = async () => {
  const response = await api.get("/me/", {
    headers: {
      "Content-Type": "application/json", // explícito
      "Authorization": `Bearer ${await getIdToken()}`,
    },
    withCredentials: true, // para enviar cookies
  });
  return response;
};

export const registrarUsuario = async (data) => {
  const response = await api.post("/register", data, {
    headers: {
      "Content-Type": "multipart/form-data", // explícito
    },
    withCredentials: true, // para enviar cookies
  });
  return response;
}



export const inicializarCredencialesPorToken = async (data) => {
  const response = await api.post("/inicializar-credenciales-token", data, {
    withCredentials: true, // para enviar cookies
  });
  return response;
};

export default api;
