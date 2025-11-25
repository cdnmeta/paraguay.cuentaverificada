
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "semaforo-financiero";

/**
 * Obtener el resumen del semáforo financiero del usuario
 * @returns {Promise} - Promesa con los datos del semáforo financiero agrupados por moneda
 */
export const obtenerSemaforoFinanciero = async (params) => {
  
  return await api.get(`/${URL_ENDPOINT}`, {
    
    withCredentials: true,
    params
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
  
  return await api.get(`/${URL_ENDPOINT}/movimientos`, {
    
    withCredentials: true,
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
  
  return await api.post(`/${URL_ENDPOINT}`, data, {
    headers: {
      
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });
};

/**
 * Actualizar un movimiento existente
 * @param {number} id - ID del movimiento
 * @param {Object} data - Datos del movimiento a actualizar
 * @returns {Promise} - Promesa con el movimiento actualizado
 */
export const actualizarMovimientoSemaforo = async (id, data) => {
  
  return await api.put(`/${URL_ENDPOINT}/${id}`, data, {
    headers: {
      
      'Content-Type': 'application/json'
    },
    withCredentials: true
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
  
  return await api.get(`/${URL_ENDPOINT}/estadisticas`, {
    
    withCredentials: true,
    params: filtros
  });
};

export const eliminarMovimientoSemaforo = async (id) => {
  
  return await api.delete(`/${URL_ENDPOINT}/${id}`, {
    
    withCredentials: true
  });
};

export const obtenerMovimientoSemaforo = async (id) => {
  
  return await api.get(`/${URL_ENDPOINT}/${id}`, {
    
    withCredentials: true
  });
};

/**
 * Registrar un nuevo abono para un movimiento
 * @param {Object} abonoData - Datos del abono
 * @param {number} abonoData.monto - Monto del abono
 * @param {string} abonoData.fecha_abono - Fecha del abono (ISO string)
 * @param {number} abonoData.id_moneda - ID de la moneda
 * @param {number} abonoData.id_movimiento - ID del movimiento
 * @returns {Promise} - Promesa con el abono creado
 */
export const registrarAbonoMovimiento = async (abonoData) => {
  
  return await api.post(`/${URL_ENDPOINT}/abonos`, abonoData, {
    headers: {
      
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });
};

/**
 * Obtener abonos de un movimiento específico
 * @param {number} idMovimiento - ID del movimiento
 * @returns {Promise} - Promesa con la lista de abonos
 */
export const obtenerAbonosMovimiento = async (idMovimiento) => {
  
  return await api.get(`/${URL_ENDPOINT}/abonos/${idMovimiento}`, {
    
    withCredentials: true
  });
};

/**
 * Eliminar un abono específico
 * @param {number} idAbono - ID del abono a eliminar
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const eliminarAbono = async (idAbono) => {
  
  return await api.delete(`/${URL_ENDPOINT}/abonos/${idAbono}`, {
    
    withCredentials: true
  });
};
