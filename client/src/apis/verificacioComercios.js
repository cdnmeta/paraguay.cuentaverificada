
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "verificacion-comercio";

// Cache del token con expiración
const getConfig = async (isForm = false) => {
  
  const headers = {};
  if (isForm) {
    headers["Content-Type"] = "multipart/form-data";
  }
  return { headers, withCredentials: true }; // Usa token cacheado
};

export const updateSeguimientoSolicitudComercio = async (id, data) => {
  const config = await getConfig();
  return api.put(`/${URL_ENDPOINT}/seguimiento-verificacion-comercio/${id}`, data, config);
};

export const solicitarVerificacionComercio = async (data) => {
  const config = await getConfig(true);
  return api.post(`/${URL_ENDPOINT}/solicitar-verificacion`, data, config);
};

export const updateSolicitudComercio = async (id, data) => {
  const config = await getConfig(true);
  return api.put(`/${URL_ENDPOINT}/solicitar-verificacion/${id}`, data, config);
};

export const rechazarPagoSolicitudComercio = async (data) => {
  const config = await getConfig();
  return api.post(`/${URL_ENDPOINT}/rechazo-pago-verificacion/`, data, config);
};

export const getComerciosAprovar = async () => {
  const config = await getConfig();
  return api.get(`/${URL_ENDPOINT}/listado-comercios-aprobar`, config);
};

export const rechazarComercio = async (data) => {
  const config = await getConfig();
  return api.post(`/${URL_ENDPOINT}/rechazar-comercio`, data, config);
};

export const verificarInformacionComercio = async (data) => {
  const config = await getConfig();
  return api.post(`/${URL_ENDPOINT}/verificar-informacion/`, data, config);
};

export const actualizarVerificacionComercio = async (id, data) => {
  const config = await getConfig();
  return api.put(`/${URL_ENDPOINT}/verificar-informacion/${id}`, data, config);
};

export const verificarComercio = async (data) => {
  const config = await getConfig();
  return api.post(`/${URL_ENDPOINT}/verificar-comercio`, data, config);
};
