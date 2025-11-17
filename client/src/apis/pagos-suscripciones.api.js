
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "pago-suscripciones";

// Usa la instancia de axios importada (no volver a declararla)

export const crearPagoSuscripcion = async (data) => {
  
  const response = await api.post(`/${URL_ENDPOINT}/registrar-pago`, data, {
    
    withCredentials: true,
  });
  return response;
};
