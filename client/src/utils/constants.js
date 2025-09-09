
const PRODUCCION = false;

let url_backend = "http://localhost:3000";
let url_backend_api = "http://localhost:3000/api";
  
if(PRODUCCION){
  url_backend = "https://py.cuentaverificada.com";
  url_backend_api = "https://py.cuentaverificada.com/api";
}



export const URL_BASE_BACKEND = url_backend;
export const URL_BASE_BACKEND_API = url_backend_api;
export const TOKEN_CACHE_DURATION = 55 * 60 * 1000; // 55 minutos (tokens de Firebase duran 1 hora)


export const REGEX_CEDULA_IDENTIDAD = /^[1-9]\d{5,7}$/;

export const estadosVerificacionDeComercio = [
  {
    label: "Pendiente de Verificación de Pago",
    className: "bg-yellow-500",
    value: 1,
  },
  {
    label: "Pago Aprobado",
    className: "bg-green-500",
    value: 2,
  },
  {
    label: "Pendiente Verificacion de Comercio",
    className: "bg-yellow-500",
    value: 3,
  },
  {
    label: "Verificado",
    className: "bg-green-500",
    value: 4,
  },
  {
    label: "Comercio Rechazado",
    className: "bg-red-500",
    value: 5,
  },
  {
    label: "Pago Rechazado",
    className: "bg-red-500",
    value: 6,
  },
]