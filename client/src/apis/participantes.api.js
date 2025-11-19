
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "participantes";
export const agregarParticipacion = async (data) => {
  
  return await api.post(`/${URL_ENDPOINT}/registrar-participacion`, data, {
   
    withCredentials: true,
  });
};


export const obtenerParticipaciones = async () => {
  
  return await api.get(`/${URL_ENDPOINT}/mis-participaciones`, {
   
    withCredentials: true,
  });
}

export const getParticipantesMany = async (query) => {
  
  return await api.get(`/${URL_ENDPOINT}/query-many`, {
   
    withCredentials: true,
    params: query
  });
}


