import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "recordatorios";

// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`, // Cambia esto por tu URL base
});


const recordatoriosAPI = {
  // Obtener todos los recordatorios del usuario autenticado
  obtenerMisRecordatorios: async () => {
    const response = await api.get("/mis-recordatorios",{
        headers: {
            "Authorization": `Bearer ${await getIdToken()}`
        }
    });
    return response.data;
  },

  // Obtener un recordatorio por ID
  obtenerRecordatorioPorId: async (id) => {
    const response = await api.get(`/${id}`,{
        headers: {
            "Authorization": `Bearer ${await getIdToken()}`,
        }
    });
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
    
    const response = await api.post("", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${await getIdToken()}`,
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
    
    const response = await api.put(`/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${await getIdToken()}`,
      },
    });
    return response.data;
  },

  // Eliminar recordatorio (soft delete)
  eliminarRecordatorio: async (id) => {
    const response = await api.delete(`/${id}`,{
        headers: {
            "Authorization": `Bearer ${await getIdToken()}`
        }
    });
    return response.data;
  },

  // Eliminar recordatorio permanentemente
  eliminarRecordatorioPermanente: async (id) => {
    const response = await api.delete(`/${id}/permanente`,{
        headers: {
            "Authorization": `Bearer ${await getIdToken()}`
        }
    });
    return response.data;
  },

  // Eliminar imágenes específicas
  eliminarImagenesEspecificas: async (id, urlsAEliminar) => {
    const response = await api.delete(`/${id}/imagenes`, {
      data: { urlsAEliminar },
      headers: {
        "Authorization": `Bearer ${await getIdToken()}`
      }
    });
    return response.data;
  },

  // Actualizar estado del recordatorio
  actualizarEstadoRecordatorio: async (id, nuevoEstado) => {
    const response = await api.put(`estado/${id}`, { id_estado: nuevoEstado }, {
      headers: {
        "Authorization": `Bearer ${await getIdToken()}`
      }
    });
    return response.data;
  }

};

export default recordatoriosAPI;