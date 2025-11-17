import { URL_BASE_BACKEND_API } from "@/utils/constants";

import api from "@/apis/axiosBase";

const URL_ENDPOINT = "recordatorios";

const recordatoriosAPI = {
  // Obtener todos los recordatorios del usuario autenticado
  obtenerMisRecordatorios: async () => {
    const response = await api.get(`${URL_ENDPOINT}/mis-recordatorios`);
    return response.data;
  },

  // Obtener un recordatorio por ID
  obtenerRecordatorioPorId: async (id) => {
    const response = await api.get(`${URL_ENDPOINT}/${id}`);
    return response.data;
  },

  // Crear nuevo recordatorio
  crearRecordatorio: async (data) => {
    const formData = new FormData();
    
    // Agregar datos básicos
    formData.append("descripcion", data.descripcion);
    formData.append("titulo", data.titulo);
    if (data.id_estado) {
      formData.append("id_estado", data.id_estado);
    }
    
    // Agregar imágenes si existen
    if (data.imagenes && data.imagenes.length > 0) {
      data.imagenes.forEach((imagen) => {
        if (imagen instanceof File) {
          formData.append("imagenes", imagen);
        }
      });
    }
    
    const response = await api.post(`${URL_ENDPOINT}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
    });
    return response.data;
  },

  // Actualizar recordatorio
  actualizarRecordatorio: async (id, data) => {
    const formData = new FormData();
    
    // Agregar datos básicos
    if (data.descripcion !== undefined) {
      formData.append("descripcion", data.descripcion);
    }
    if (data.id_estado !== undefined) {
      formData.append("id_estado", data.id_estado);
    }
    if (data.activo !== undefined) {
      formData.append("activo", data.activo);
    }
    if (data.titulo !== undefined) {
      formData.append("titulo", data.titulo);
    }
    
    // Agregar nuevas imágenes si existen
    if (data.nuevasImagenes && data.nuevasImagenes.length > 0) {
      data.nuevasImagenes.forEach((imagen) => {
        if (imagen instanceof File) {
          formData.append("imagenes", imagen);
        }
      });
    }
    
    const response = await api.put(`${URL_ENDPOINT}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
    });
    return response.data;
  },

  // Eliminar recordatorio (soft delete)
  eliminarRecordatorio: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  // Eliminar recordatorio permanentemente
  eliminarRecordatorioPermanente: async (id) => {
    const response = await api.delete(`${URL_ENDPOINT}/${id}/permanente`);
    return response.data;
  },

  // Eliminar imágenes específicas
  eliminarImagenesEspecificas: async (id, urlsAEliminar) => {
    const response = await api.delete(`${URL_ENDPOINT}/${id}/imagenes`, {
      data: { urlsAEliminar },
    });
    return response.data;
  },

  // Actualizar estado del recordatorio
  actualizarEstadoRecordatorio: async (id, nuevoEstado) => {
    const response = await api.put(`${URL_ENDPOINT}/estado/${id}`, { id_estado: nuevoEstado },);
    return response.data;
  }

};

export default recordatoriosAPI;