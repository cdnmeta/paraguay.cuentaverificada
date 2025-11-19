
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "comercios";


export const getComerciosByQuery = async (query) => {
  return api.get(`${URL_ENDPOINT}/search`, {
    
    params: query,
    withCredentials: true,
  });
};

export const getComerciosForUser = async (userId, query) => {
  return api.get(`${URL_ENDPOINT}/user/${userId}`, {
    
    params: query,
    withCredentials: true,
  });
};

export const getComerciosAprovacionPagos = async () => {
  return api.get(`${URL_ENDPOINT}/aprobacion-pagos`, {
    
    withCredentials: true,
  });
};

export const getComercioById = async (id) => {
  return api.get(`${URL_ENDPOINT}/${id}`, {
    
    withCredentials: true,
  });
}


export const getComerciosByMany = async (query) => {
  return api.get(`${URL_ENDPOINT}/query-many`, {
    
    params: query,
    withCredentials: true,
  });
}

export const opcionesFiltroComercios = async () => {
  return api.get(`/${URL_ENDPOINT}/opciones-filtro`, {
    
    withCredentials: true,
  });
}

export const getComercioInfoBySlug = async (slug) => {
  return api.get(`/${URL_ENDPOINT}/info/${slug}`, {
    
    withCredentials: true,
  });
}
