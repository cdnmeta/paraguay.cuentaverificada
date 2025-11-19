
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "planes";
export const getPlanes = async () => {
  const response = await api.get(`/${URL_ENDPOINT}`, {
    
    withCredentials: true,
  });
  
  return response;
};
