
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "tickets";

export const getTiposTickets = async () => {
  return await api.get(`/${URL_ENDPOINT}/tipos`, {
    
    withCredentials: true,
  });
};

/**
 * Obtener resumen de estadísticas de tickets
 * @returns {Promise} Response con las estadísticas de tickets
 */
export const getResumenMisTickets = async () => {
  return await api.get(`/${URL_ENDPOINT}/resumen-mis-tickets`, {
    
    withCredentials: true,
  });
};

/**
 * Obtener todos los tickets del usuario actual
 * @returns {Promise} Response con la lista de tickets
 */
export const getMisTickets = async () => {
  return await api.get(`/${URL_ENDPOINT}/mis-tickets`, {
    headers: {
      "Content-Type": "application/json"
    },
    withCredentials: true,
  });
};

/**
 * Crear un nuevo ticket
 * @param {FormData|Object} ticketData - Datos del ticket a crear (FormData para archivos o Object para JSON)
 * @returns {Promise} Response con el ticket creado
 */
export const createTicket = async (ticketData) => {
  return await api.post(`/${URL_ENDPOINT}/nuevo`, ticketData, {
    
    withCredentials: true,
  });
};

// abrir un ticket existente
export const abrirTicket = async (id) => {
  return await api.put(
    `${URL_ENDPOINT}/${id}/abrir`,
    {},
    {
      
      withCredentials: true,
    }
  );
};

// Obtener el hilo de mensajes de un ticket con paginación
export const getTicketHilo = async (id, params) => {
  return await api.get(`/${URL_ENDPOINT}/${id}/hilo`, {
    
    withCredentials: true,
    params,
  });
};


// agregar un mensaje al hilo de un ticket
export const clienteAgregarMensajeTicket = async (mensajeData) => {
  return await api.post(`/${URL_ENDPOINT}/mensaje`, mensajeData, {
    
    withCredentials: true,
  });
};

export const soporteAgregarMensajeTicket = async (mensajeData) => {
  return await api.post(`/${URL_ENDPOINT}/soporte/mensaje`, mensajeData, {
    
    withCredentials: true,
  });
}; 


export const getTicketInfoById = async (id) => {
  return await api.get(`/${URL_ENDPOINT}/${id}/info`, {
    
    withCredentials: true,
  });
};

export const cerrarTicket = async (id, data) => {
  return await api.put(
    `/${URL_ENDPOINT}/${id}/cerrar`,
    data,
    {
      
      withCredentials: true,
    }
  );
  
}

export const completarTicket = async (id) => {
  return await api.put(
    `/${URL_ENDPOINT}/${id}/completar`,
    {},
    {
      
      withCredentials: true,
    }
  );
}

export const listadoTicketsSoporte = async (params) => {
  return await api.get(`/${URL_ENDPOINT}/soporte/listado`, {
    
    withCredentials: true,
    params,
  });
};
