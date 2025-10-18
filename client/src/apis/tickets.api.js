import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "tickets";

// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`,
});

export const getTiposTickets = async () => {
  return await api.get("/tipos", {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
};

/**
 * Obtener resumen de estadísticas de tickets
 * @returns {Promise} Response con las estadísticas de tickets
 */
export const getResumenMisTickets = async () => {
  return await api.get("/resumen-mis-tickets", {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
};

/**
 * Obtener todos los tickets del usuario actual
 * @returns {Promise} Response con la lista de tickets
 */
export const getMisTickets = async () => {
  return await api.get("/mis-tickets", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
};

/**
 * Crear un nuevo ticket
 * @param {FormData|Object} ticketData - Datos del ticket a crear (FormData para archivos o Object para JSON)
 * @returns {Promise} Response con el ticket creado
 */
export const createTicket = async (ticketData) => {
  return await api.post("/nuevo", ticketData, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
};

// abrir un ticket existente
export const abrirTicket = async (id) => {
  return await api.put(
    `/${id}/abrir`,
    {},
    {
      headers: {
        Authorization: `Bearer ${await getIdToken()}`,
      },
    }
  );
};

// Obtener el hilo de mensajes de un ticket con paginación
export const getTicketHilo = async (id, params) => {
  return await api.get(`/${id}/hilo`, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
    params,
  });
};


// agregar un mensaje al hilo de un ticket
export const clienteAgregarMensajeTicket = async (mensajeData) => {
  return await api.post(`/mensaje`, mensajeData, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
};

export const soporteAgregarMensajeTicket = async (mensajeData) => {
  return await api.post(`/soporte/mensaje`, mensajeData, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
}; 


export const getTicketInfoById = async (id) => {
  return await api.get(`/${id}/info`, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
};

export const cerrarTicket = async (id, data) => {
  return await api.put(
    `/${id}/cerrar`,
    data,
    {
      headers: {
        Authorization: `Bearer ${await getIdToken()}`,
      },
    }
  );
  
}

export const completarTicket = async (id) => {
  return await api.put(
    `/${id}/completar`,
    {},
    {
      headers: {
        Authorization: `Bearer ${await getIdToken()}`,
      },
    }
  );
}

export const listadoTicketsSoporte = async (params) => {
  return await api.get(`/soporte/listado`, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
    params,
  });
};
