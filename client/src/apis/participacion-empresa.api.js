
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "participacion-empresa";
export const getPrecioMeta = async () => {
  
  const response = await api.get(`${URL_ENDPOINT}/consultar-precio`, {
    
    withCredentials: true,
  });
  return response.data;
};
