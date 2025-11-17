
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "notificaciones";

export const suscribirNotificaciones = async (subscription) => {
  
  const response = await api.post(`/${URL_ENDPOINT}/suscribe-notificacion`, subscription, {
    
    withCredentials: true,
  });
  return response;
};

export const getNotificacionesUsuario = async () => {
  
  const response = await api.get(`/${URL_ENDPOINT}/mis-notificaciones`, {
    
    withCredentials: true,
  });
  return response;
};