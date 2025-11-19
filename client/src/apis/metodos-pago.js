
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "metodos-pago";
export const getMetodosPago = async () => {
  const response = await api.get(`/${URL_ENDPOINT}`, {
    
    withCredentials: true,
  });
  return response;
};
