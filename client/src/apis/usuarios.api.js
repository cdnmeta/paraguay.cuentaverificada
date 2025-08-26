import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "usuarios";

// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`,
});

// Interceptor para agregar el token de autenticación
export const getUserByDocumento = async (documento) => {
  return await api.get(`/doc/${documento}`);
};

export const crearSolicitudCuenta = async (data) => {
  return await api.post(`/solicitud-cuenta`, data);
};

export const getGruposByUsuario = async () => {
  return await api.get(`/grupos`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    }
  });
};