
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "estados-animos";

const authConfig = async (extra = {}) => {
  
  return {
    
    withCredentials: true,
    ...extra,
  };
};

export const getTiposEstadosAnimo = async () => {
  const response = await api.get(`/${URL_ENDPOINT}/tipos-estados`, await authConfig());
  return response;
};

export const getEstadosAnimosById = async (id) => {
  const response = await api.get(`/${URL_ENDPOINT}/${id}`, await authConfig());
  return response;
};

export const getMensajesEstadosAnimo = async (params) => {
  const response = await api.get(`/${URL_ENDPOINT}/listado`, await authConfig({ params }));
  return response;
};

export const getMensajeDelDia = async (params) => {
  const response = await api.get(`/${URL_ENDPOINT}/obtener-mensaje`, await authConfig({ params }));
  return response;
};

export const crearMensajeEstadoAnimo = async (data) => {
  const response = await api.post(`/${URL_ENDPOINT}/`, data, await authConfig());
  return response;
};

export const actualizarMensajeEstadoAnimo = async (id, data) => {
  const response = await api.put(`/${URL_ENDPOINT}/${id}`, data, await authConfig());
  return response;
};

export const eliminarMensajeEstadoAnimo = async (id) => {
  const response = await api.delete(`/${URL_ENDPOINT}/${id}`, await authConfig());
  return response;
};

export const guardarMensajeDelDia = async (data) => {
  const response = await api.post(`/${URL_ENDPOINT}/guardar-mensaje`, data, await authConfig());
  return response;
};
