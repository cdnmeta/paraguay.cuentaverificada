import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "usuarios";

// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`,
});

// Interceptor para agregar el token de autenticación
export const getUserByDocumento = async (documento) => {
  return await api.get(`/doc/${documento}`);
};


export const getGruposByUsuario = async () => {
  return await api.get(`/grupos`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    }
  });
};

export const getUserByQuery = async (query) => {
  return await api.get(`/query-one`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
    params: query
  });
};

export const agregarUsuarioGrupo = async (data) => {
  return await api.post(`/agregar-grupo`,data ,{
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
};

export const getUsersByQuery = async (query) => {
  return await api.get(`/query-many`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
    params: query,
  });
}

export const asignarGrupos = async (data) => {
  return await api.post(`/asignar-grupos`, data, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}

export const getGruposByUsuarioId = async (id_usuario) => {
  return await api.get(`/grupos/${id_usuario}`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}

export const crearUsuario = async (data) => {
  return await api.post(`/crear-usuario`, data, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}


export const getUsuarioById = async (id) => {
  return await api.get(`/${id}`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}


export const actualizarUsuario = async (id, data) => {
  return await api.put(`/actualizar-usuario/${id}`, data, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}

export const filtrosUsuarios = async () => {
  return await api.get(`/filtros`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}


export const getMisDatos = async () => {
  return await api.get(`/mis-datos`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}

export const actualizarMisDatos = async (data) => {
  return await api.put(`/mis-datos`, data, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`,
      'Content-Type': 'application/json'
    },
  });
}


export const cambiarContrasena = async (data) => {
  return await api.post(`/cambiar-contrasena`, data, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}

export const eliminarUsuario = async (id) => {
  return await api.delete(`/${id}`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });

}

// ===== ENDPOINTS PARA DIRECCIONES DE USUARIOS =====

export const obtenerMisDirecciones = async () => {
  return await api.get(`/mis-direcciones`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}

export const obtenerDireccionPorId = async (id) => {
  return await api.get(`/mis-direcciones/${id}`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}

export const crearDireccion = async (data) => {
  return await api.post(`/mis-direcciones`, data, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`,
      'Content-Type': 'application/json'
    },
  });
}

export const actualizarDireccion = async (id, data) => {
  return await api.put(`/mis-direcciones/${id}`, data, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`,
      'Content-Type': 'application/json'
    },
  });
}

export const eliminarDireccion = async (id) => {
  return await api.delete(`/mis-direcciones/${id}`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}


// ===== ENDPOINTS PARA FAVORITOS DE USUARIOS =====

export const agregarFavoritos = async (data) => {
  return await api.post("/mis-comercios-favoritos", data, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}

export const eliminarComercioFavoritos = async (id) => {
  return await api.delete(`/mis-comercios-favoritos/${id}`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}

export const getMisFavoritos = async () => {
  return await api.get(`/mis-favoritos`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
}
