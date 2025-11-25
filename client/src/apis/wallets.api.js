
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "wallet";

// Función para obtener las wallets del usuario
export const obtenerWalletsDelUsuario = async () => {
  
  const response = await api.get(`/${URL_ENDPOINT}/mis-wallets`, {
    withCredentials: true,
  });
  return response;
};

// Función para obtener una wallet específica por ID
export const obtenerWalletPorId = async (id) => {
  
  const response = await api.get(`/${URL_ENDPOINT}/mis-wallets/${id}`, {
    withCredentials: true,
  });
  return response;
};

export const solicitarRecargaWallet = async (data) => {
  
  const response = await api.post(`/${URL_ENDPOINT}/solicitar-recarga`, data, {
    
    withCredentials: true,
  });
  return response;
}

export const obtenerListadoSolicitudesRecargas = async () => {
  
  const response = await api.get(`/${URL_ENDPOINT}/listado-solicitudes-recargas`, {
    
    withCredentials: true,
  });
  return response;
}

export const aprobarSolicitudRecarga = async (id, data) => {
  
  const response = await api.put(`/${URL_ENDPOINT}/aprobar-solicitud-recarga/${id}`, data, {
    headers: {
      
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
  return response;
}

export const rechazarSolicitudRecarga = async (id, data) => {
  
  const response = await api.put(`/${URL_ENDPOINT}/rechazo-solicitud-recarga/${id}`, data, {
    headers: {
      
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
  return response;
}

export const obtenerMiMovimientosDeWallet = async (walletId) => {
  
  const response = await api.get(`/${URL_ENDPOINT}/mi-movimiento/${walletId}`, {
    
    withCredentials: true,
  });
  return response;
}

export const rehabilitarSolicitudRecarga = async (id, formData) => {
  
  const response = await api.put(`/${URL_ENDPOINT}/habilitar-solicitud-recarga/${id}`, formData, {
    
    withCredentials: true,
  });
  return response;
}
