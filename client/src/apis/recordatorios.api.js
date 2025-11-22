import { URL_BASE_BACKEND_API } from "@/utils/constants";

import api from "@/apis/axiosBase";

const URL_ENDPOINT = "recordatorios";

const recordatoriosAPI = {
  // Obtener todos los recordatorios del usuario autenticado
  obtenerMisRecordatorios: async (params) => {
    const response = await api.get(`${URL_ENDPOINT}/mis-recordatorios`, { params });
    return response;
  },

  // Obtener un recordatorio por ID
  obtenerRecordatorioPorId: async (id) => {
    const response = await api.get(`${URL_ENDPOINT}/${id}`);
    return response;
  },

  // Crear nuevo recordatorio
  crearRecordatorio: async (data) => {
    const response = await api.post(`${URL_ENDPOINT}`, data, {
    });
    return response;
  },

  // Actualizar recordatorio
  actualizarRecordatorio: async (id, data) => {
    const response = await api.put(`${URL_ENDPOINT}/${id}`, data, {
    });
    return response;
  },

  // Eliminar recordatorio (soft delete)
  eliminarRecordatorio: async (id) => {
    const response = await api.delete(`${URL_ENDPOINT}/${id}`);
    return response;
  },

  // Eliminar recordatorio permanentemente
  eliminarRecordatorioPermanente: async (id) => {
    const response = await api.delete(`${URL_ENDPOINT}/${id}/permanente`);
    return response;
  },

  // Eliminar imágenes específicas
  eliminarImagenesEspecificas: async (id, urlsAEliminar) => {
    const response = await api.delete(`${URL_ENDPOINT}/${id}/imagenes`, {
      data: { urlsAEliminar },
    });
    return response;
  },

  // Actualizar estado del recordatorio
  actualizarEstadoRecordatorio: async (id, data) => {
    const response = await api.put(`${URL_ENDPOINT}/estado/${id}`, data);
    return response;
  },

  obtenerMisRecordatoriosHoy: async () => {
    const response = await api.get(`${URL_ENDPOINT}/mis-recordatorios/hoy`);
    return response;
  },

};

export default recordatoriosAPI;