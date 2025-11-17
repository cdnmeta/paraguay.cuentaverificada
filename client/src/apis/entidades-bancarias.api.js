
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "entidades-bancarias";
export const getEntidadesBancarias = async () => {

    const response = await api.get(`/${URL_ENDPOINT}/`, {
      
      withCredentials: true,
    });
    return response;

};
