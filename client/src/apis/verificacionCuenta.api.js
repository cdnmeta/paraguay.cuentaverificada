import { URL_BASE_BACKEND_API } from "@/utils/constants";
import { getIdToken } from "@/utils/funciones";
import axios from "axios";

const URL_ENDPOINT = "verificacion-cuenta";

// Cache del token con expiración


// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`,
});



export const verificarToken = async (token) => {
  const response = await api.post("/verificar-token", token);
  return response;
};

export const regenerarToken = async (data) => {
  const response = await api.post("/regenerar-token", data);
  return response;
};

export const crearSolicitudCuenta = async (data) => {
  return await api.post(`/solicitud-cuenta`, data);
};

export const getSolicitudesCuenta = async () => {
        const response = await api.get(`/listado-solicitudes-verificador`,{
            headers:{
                "Authorization": `Bearer ${await getIdToken()}`
            }
        });
        return response;
}

export const getSolicitudesCuentaAll = async () => {
    const response = await api.get(`/listado-solitudes`, {
        headers: {
            "Authorization": `Bearer ${await getIdToken()}`
        }
    });
    return response;
}

export const getSolicitudesCuentaById = async (id) => {
    const response = await api.get(`/${id}`, {
        headers: {
            "Authorization": `Bearer ${await getIdToken()}`
        }
    });
    return response;
};

export const actualizarDatosSolicitud = async (id, data) => {
    const response = await api.put(`/${id}`, data, {
        headers: {
            "Authorization": `Bearer ${await getIdToken()}`
        }
    });
    return response;
};

export const aprobarCuenta = async (data) => {
    const response = await api.post(`/aprobar`, data, {
        headers: {
            "Authorization": `Bearer ${await getIdToken()}`
        }
    });
    return response;
};

export const rechazarSolicitud = async (data) => {
    const response = await api.post(`/rechazar`, data, {
        headers: {
            "Authorization": `Bearer ${await getIdToken()}`
        }
    });
    return response;
};


export const generarTokenSolicitudById = async (id) => {
    const response = await api.get(`/generar-token-solicitud/${id}`, {
        headers: {
            "Authorization": `Bearer ${await getIdToken()}`
        }
    });
    return response;
};

export const validarCodigoSolicitud = async (data) => {
    const response = await api.post(`/validar-codigo-solicitud`, data);
    return response;
};

export const enviarCodigoVerificacion = async (data) => {
    const response = await api.post(`/enviar-codigo-verificacion`, data);
    return response;
};