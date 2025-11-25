
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "usuarios";

// Interceptor para agregar el token de autenticación
export const getUserByDocumento = async (documento) => {
  return await api.get(`/${URL_ENDPOINT}/doc/${documento}`, {
    withCredentials: true,
  });
};


export const getGruposByUsuario = async () => {
  return await api.get(`/${URL_ENDPOINT}/grupos`, {
    
    withCredentials: true,
  });
};

export const getUserByQuery = async (query) => {
  return await api.get(`${URL_ENDPOINT}/query-one`, {
    
    params: query
  });
};

export const agregarUsuarioGrupo = async (data) => {
  return await api.post(`${URL_ENDPOINT}/agregar-grupo`,data ,{
    
  });
};

export const getUsersByQuery = async (query) => {
  return await api.get(`${URL_ENDPOINT}/query-many`, {
    
    params: query,
  });
}

export const asignarGrupos = async (data) => {
  return await api.post(`${URL_ENDPOINT}/asignar-grupos`, data, {
    
  });
}

export const getGruposByUsuarioId = async (id_usuario) => {
  return await api.get(`${URL_ENDPOINT}/grupos/${id_usuario}`, {
    
  });
}

export const crearUsuario = async (data) => {
  return await api.post(`${URL_ENDPOINT}/crear-usuario`, data, {
    
  });
}


export const getUsuarioById = async (id) => {
  return await api.get(`${URL_ENDPOINT}/${id}`, {
    
  });
}


export const actualizarUsuario = async (id, data) => {
  return await api.put(`${URL_ENDPOINT}/actualizar-usuario/${id}`, data, {
    
  });
}

export const filtrosUsuarios = async () => {
  return await api.get(`${URL_ENDPOINT}/filtros`, {
    
  });
}


export const getMisDatos = async () => {
  return await api.get(`${URL_ENDPOINT}/mis-datos`, {
    
  });
}

export const actualizarMisDatos = async (data) => {
  return await api.put(`${URL_ENDPOINT}/mis-datos`, data, {
    headers: {
      
      'Content-Type': 'application/json'
    },
  });
}


export const cambiarContrasena = async (data) => {
  return await api.post(`${URL_ENDPOINT}/cambiar-contrasena`, data, {
    
  });
}

export const eliminarUsuario = async (id) => {
  return await api.delete(`${URL_ENDPOINT}/${id}`, {
    
  });

}

// ===== ENDPOINTS PARA DIRECCIONES DE USUARIOS =====

export const obtenerMisDirecciones = async () => {
  return await api.get(`${URL_ENDPOINT}/mis-direcciones`, {
    
  });
}

export const obtenerDireccionPorId = async (id) => {
  return await api.get(`${URL_ENDPOINT}/mis-direcciones/${id}`, {
    
  });
}

export const crearDireccion = async (data) => {
  return await api.post(`${URL_ENDPOINT}/mis-direcciones`, data, {
    headers: {
      
      'Content-Type': 'application/json'
    },
  });
}

export const actualizarDireccion = async (id, data) => {
  return await api.put(`${URL_ENDPOINT}/mis-direcciones/${id}`, data, {
    headers: {
      
      'Content-Type': 'application/json'
    },
  });
}

export const eliminarDireccion = async (id) => {
  return await api.delete(`${URL_ENDPOINT}/mis-direcciones/${id}`, {
    
  });
}


// ===== ENDPOINTS PARA FAVORITOS DE USUARIOS =====

export const agregarFavoritos = async (data) => {
  return await api.post(`${URL_ENDPOINT}/mis-comercios-favoritos`, data, {
    
  });
}

export const eliminarComercioFavoritos = async (id) => {
  return await api.delete(`${URL_ENDPOINT}/mis-comercios-favoritos/${id}`, {
    
  });
}

export const getMisFavoritos = async () => {
  return await api.get(`${URL_ENDPOINT}/mis-favoritos`, {
    
  });
}
