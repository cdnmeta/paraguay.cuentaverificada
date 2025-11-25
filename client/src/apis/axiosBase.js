import axios from "axios";
import {URL_BASE_BACKEND_API} from "@/utils/constants";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { getIdToken } from "@/utils/funciones";

// Instancia separada para refresh token sin interceptores
const refreshApi = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}`,
  withCredentials: true,
});

// Si usás toast para mostrar errores (como sonner, react-toastify, etc.)
// import { toast } from "sonner"; // o "react-toastify"

const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}`, // Asegúrate de que URL_BACKEND_API esté definido en tu entorno
  withCredentials: true, // 🔒 Necesario para enviar cookies al backend
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, response = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(response);
  });
  failedQueue = [];
};


api.interceptors.request.use(async (request) => {
  const token = await getIdToken();
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

       if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      } 

      isRefreshing = true;

      try {
        const response = await refreshApi.post(
          `/auth/refresh/`,
          {},
          { withCredentials: true }
        );

        // 💡 Ajustá este nombre según lo que devuelva tu backend
        const newAccessToken = response.data.token;

        if (newAccessToken) {
          // 1) actualizar store
          const { setTokenJwtUser } = useAuthStore.getState();
          setTokenJwtUser(newAccessToken);

          // 2) actualizar headers por defecto del axios instance
          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

          // 3) actualizar la request original
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null);
        return api(originalRequest); // reintenta la original
      } catch (refreshError) {
        processQueue(refreshError, null);

        // ✅ Acción opcional si falla el refresh token (por ejemplo, logout o toast)
        // toast.error("Sesión expirada. Iniciá sesión de nuevo.");
        //window.location.href = "/login"; // o navega al login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);



export default api;