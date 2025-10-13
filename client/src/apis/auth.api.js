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

export const getGruposHabilitados = async () => {
  const response = await api.get("/grupos", {
    headers: {
      "Authorization": `Bearer ${await getIdToken()}`,
    },
    withCredentials: true, // para enviar cookies
  });
  return response;
};

// Funciones para recuperación de PIN
export const solicitarRecoveryPin = async (data) => {
  const response = await api.post("/solicitud-recovery-pin", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const verificarToken = async (token, cedula) => {
  const response = await api.get(`/verificar-token?token=${token}&cedula=${cedula}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const resetPin = async (data) => {
  const response = await api.post("/recovery-pin", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const refreshToken = async (data) => {
  const response = await api.post("/refresh-token", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post("/reset-contrasena", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const confirmarUsuario = async (data) => {
  return await api.post("/confirmar-usuario", data)
};

export const refreshCodigoVerificacion = async (data) => {
  return await api.post("/refresh-codigo-verificacion", data)
}

export default api;
