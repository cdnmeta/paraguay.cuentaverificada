
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "planes";
export const getPlanes = async () => {
  const response = await api.get(`/${URL_ENDPOINT}`);
  
  return response;
};

export const createPlan = async (data) => {
  const response = await api.post(`/${URL_ENDPOINT}`, data);
  return response;
}

export const updatePlan = async (id, data) => {
  const response = await api.put(`/${URL_ENDPOINT}/${id}`, data);
  return response;
}

export const deletePlan = async (id) => {
  const response = await api.delete(`/${URL_ENDPOINT}/${id}`);
  return response;
}

export const getPlanById = async (id) => {
  const response = await api.get(`/${URL_ENDPOINT}/${id}`);
  return response;
}