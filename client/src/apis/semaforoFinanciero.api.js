import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "semaforo-financiero";

// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`,
});

/**
 * Obtener el resumen del semáforo financiero del usuario
 * @returns {Promise} - Promesa con los datos del semáforo financiero agrupados por moneda
 */
export const obtenerSemaforoFinanciero = async () => {
  return await api.get(``, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
};

/**
 * Obtener movimientos filtrados del semáforo financiero
 * @param {Object} filtros - Filtros opcionales para la consulta
 * @param {number} filtros.tipo_movimiento - Tipo de movimiento (1-6)
 * @param {number} filtros.id_estado - Estado del movimiento (1-3)
 * @param {number} filtros.id_moneda - ID de la moneda
 * @param {string} filtros.fecha_desde - Fecha desde (YYYY-MM-DD)
 * @param {string} filtros.fecha_hasta - Fecha hasta (YYYY-MM-DD)
 * @returns {Promise} - Promesa con los movimientos filtrados
 */
export const obtenerMovimientosFiltrados = async (filtros = {}) => {
  return await api.get(`/movimientos`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
    params: filtros
  });
};

/**
 * Crear un nuevo movimiento del semáforo financiero
 * @param {Object} data - Datos del movimiento
 * @param {string} data.titulo - Título del movimiento
 * @param {number} data.tipo_movimiento - Tipo de movimiento (1-6)
 * @param {number} data.id_estado - Estado del movimiento (1-3)
 * @param {number} data.monto - Monto del movimiento
 * @param {number} data.id_moneda - ID de la moneda
 * @param {string} data.observacion - Observación (opcional)
 * @param {number} data.id_usuario - ID del usuario
 * @returns {Promise} - Promesa con el movimiento creado
 */
export const crearMovimientoSemaforo = async (data) => {
  return await api.post(``, data, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`,
      'Content-Type': 'application/json'
    },
  });
};

/**
 * Actualizar un movimiento existente
 * @param {number} id - ID del movimiento
 * @param {Object} data - Datos del movimiento a actualizar
 * @returns {Promise} - Promesa con el movimiento actualizado
 */
export const actualizarMovimientoSemaforo = async (id, data) => {
  return await api.put(`/${id}`, data, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`,
      'Content-Type': 'application/json'
    },
  });
};


/**
 * Obtener estadísticas del semáforo financiero
 * @param {Object} filtros - Filtros opcionales
 * @param {string} filtros.periodo - Periodo de estadísticas (mes, año)
 * @param {number} filtros.id_moneda - ID de la moneda
 * @returns {Promise} - Promesa con las estadísticas
 */
export const obtenerEstadisticas = async (filtros = {}) => {
  return await api.get(`/estadisticas`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
    params: filtros
  });
};

export const eliminarMovimientoSemaforo = async (id) => {
  return await api.delete(`/${id}`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
};

export const obtenerMovimientoSemaforo = async (id) => {
  return await api.get(`/${id}`, {
    headers: {
      'Authorization': `Bearer ${await getIdToken()}`
    },
  });
};
