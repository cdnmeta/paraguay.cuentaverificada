
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "verificacion-cuenta";

// Cache del token con expiración

const getAuthConfig = async (opts = {}) => {
  
  return {
    
    withCredentials: true,
    ...opts,
  };
};

export const verificarToken = async (token) => {
  const response = await api.post(`/${URL_ENDPOINT}/verificar-token`, token);
  return response;
};

export const regenerarToken = async (data) => {
  const response = await api.post(`/${URL_ENDPOINT}/regenerar-token`, data);
  return response;
};

export const crearSolicitudCuenta = async (data) => {
  return await api.post(`/${URL_ENDPOINT}/solicitud-cuenta`, data);
};

export const getSolicitudesCuenta = async (params) => {
  const config = await getAuthConfig({ params });
  const response = await api.get(`/${URL_ENDPOINT}/listado-solicitudes-verificador`, config);
  return response;
};

export const getSolicitudesCuentaAll = async (params) => {
  const config = await getAuthConfig({ params });
  const response = await api.get(`/${URL_ENDPOINT}/listado-solitudes`, config);
  return response;
};

export const getSolicitudesCuentaById = async (id) => {
  const config = await getAuthConfig();
  const response = await api.get(`/${URL_ENDPOINT}/${id}`, config);
  return response;
};

export const actualizarDatosSolicitud = async (id, data) => {
  const config = await getAuthConfig();
  const response = await api.put(`/${URL_ENDPOINT}/${id}`, data, config);
  return response;
};

export const aprobarCuenta = async (data) => {
  const config = await getAuthConfig();
  const response = await api.post(`/${URL_ENDPOINT}/aprobar`, data, config);
  return response;
};

export const rechazarSolicitud = async (data) => {
  const config = await getAuthConfig();
  const response = await api.post(`/${URL_ENDPOINT}/rechazar`, data, config);
  return response;
};

export const generarTokenSolicitudById = async (id) => {
  const config = await getAuthConfig();
  const response = await api.get(`/${URL_ENDPOINT}/generar-token-solicitud/${id}`, config);
  return response;
};

export const validarCodigoSolicitud = async (data) => {
  const response = await api.post(`/${URL_ENDPOINT}/validar-codigo-solicitud`, data);
  return response;
};

export const enviarCodigoVerificacion = async (data) => {
  const response = await api.post(`/${URL_ENDPOINT}/enviar-codigo-verificacion`, data);
  return response;
};

export const getResumenSolicitudesCuenta = async (query) => {
  const config = await getAuthConfig({ params: query });
  const response = await api.get(`/${URL_ENDPOINT}/resumen-solicitudes-cuenta`, config);
  return response;
};

export const getResumenSolicitudesCuentaVerificador = async (query) => {
  const config = await getAuthConfig({ params: query });
  const response = await api.get(`/${URL_ENDPOINT}/resumen-solicitudes-verificador`, config);
  return response;
};

export const solicitarVerificacionCuentausuario = async () => {
  const config = await getAuthConfig();
  const response = await api.post(`/${URL_ENDPOINT}/usuario/solicitud`, {}, config);
  return response;
};
