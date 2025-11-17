import api from "@/apis/axiosBase";
import axios from "axios";
import { URL_BASE_BACKEND_API } from "@/utils/constants";

const URL_ENDPOINT = "auth";

// Instancia separada de Axios para refresh token sin interceptores
const refreshApi = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}`,
  withCredentials: true,
});

export const login = async (credentials) => {
  const response = await api.post(`/${URL_ENDPOINT}/login`, credentials, {
    headers: {
      "Content-Type": "application/json", // explícito
    },
    withCredentials: true, // para enviar cookies
  });
  return response;
};

export const getUserInfo = async () => {
  const response = await api.get(`/${URL_ENDPOINT}/me/`, {
    headers: {
      "Content-Type": "application/json", // explícito
    },
    withCredentials: true, // para enviar cookies
  });
  return response;
};

export const registrarUsuario = async (data) => {
  const response = await api.post(`/${URL_ENDPOINT}/register`, data, {
    headers: {
      "Content-Type": "multipart/form-data", // explícito
    },
    withCredentials: true,
  });
  return response;
};

export const inicializarCredencialesPorToken = async (data) => {
  const response = await api.post(`/${URL_ENDPOINT}/inicializar-credenciales-token`, data, {
    withCredentials: true, // para enviar cookies
  });
  return response;
};

export const getGruposHabilitados = async () => {
  const response = await api.get(`/${URL_ENDPOINT}/grupos`, {
    withCredentials: true, // para enviar cookies
  });
  return response;
};

// Funciones para recuperación de PIN
export const solicitarRecoveryPin = async (data) => {
  const response = await api.post(`/${URL_ENDPOINT}/solicitud-recovery-pin`, data, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return response.data;
};

export const verificarToken = async (token, cedula) => {
  const response = await api.get(`/${URL_ENDPOINT}/verificar-token?token=${token}&cedula=${cedula}`, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return response.data;
};

export const resetPin = async (data) => {
  const response = await api.post(`/${URL_ENDPOINT}/recovery-pin`, data, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return response.data;
};

export const refreshToken = async (data) => {
  const response = await api.post(`/${URL_ENDPOINT}/refresh-token`, data, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post(`/${URL_ENDPOINT}/reset-contrasena`, data, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return response.data;
};

export const confirmarUsuario = async (data) => {
  return await api.post(`/${URL_ENDPOINT}/confirmar-usuario`, data);
};

export const refreshCodigoVerificacion = async (data) => {
  return await api.post(`/${URL_ENDPOINT}/refresh-codigo-verificacion`, data);
};

export const refreshTokenJwt = async () => {
  // Usar la instancia sin interceptores para evitar bucles infinitos
  const response = await refreshApi.post(`/${URL_ENDPOINT}/refresh`, {}, {
    withCredentials: true, // para enviar cookies
  });
  return response;
};

export default api;
