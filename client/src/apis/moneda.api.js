
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "monedas";
export const getMonedas = async () => {
  
  const response = await api.get(`/${URL_ENDPOINT}`, {
    withCredentials: true
  });
  return response;
};
