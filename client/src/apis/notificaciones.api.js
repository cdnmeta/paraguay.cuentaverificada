
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "notificaciones";

export const suscribirNotificaciones = async (subscription) => {
  
  const response = await api.post(`/${URL_ENDPOINT}/suscribe-notificacion`, subscription, {
    
    withCredentials: true,
  });
  return response;
};

export const getNotificacionesUsuario = async (params = {}) => {
  const response = await api.get(`/${URL_ENDPOINT}/mis-notificaciones`, {
    params,
    withCredentials: true,
  });
  return response;
};