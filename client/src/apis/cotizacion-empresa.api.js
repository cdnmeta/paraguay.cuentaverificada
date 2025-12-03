
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "cotizacion-empresa";

export const getCotizacionesEmpresa = async () => {
  
  const response = await api.get(`/${URL_ENDPOINT}/`, {
    
    withCredentials: true,
  });
  return response;
};

export const registrarCotizacionEmpresa = async (data) => {
  
  const response = await api.post(`/${URL_ENDPOINT}/registrar-cotizacion`, data, {
    
    withCredentials: true,
  });
  return response;
};


export const anularCotizacionEmpresa = async (id) => {
  const response = await api.delete(`/${URL_ENDPOINT}/anular-cotizacion/${id}`, {
    withCredentials: true,
  });
  return response;
}
