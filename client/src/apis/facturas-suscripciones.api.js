

import api from "@/apis/axiosBase";

const URL_ENDPOINT = "facturas-suscripciones";

export const getInfoFacturaPago = async (id) => {
  
  const response = await api.get(`/${URL_ENDPOINT}/info-pago/${id}`, {
    
    withCredentials: true,
  });
  return response;
};

export const getGananciasFacturas = async () => {
  
  return await api.get(`/${URL_ENDPOINT}/ganancias-facturas`, {
    
    withCredentials: true,
  });
};
