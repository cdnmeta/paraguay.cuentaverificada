

export const URL_BASE_BACKEND = "http://localhost:3000";
export const URL_BASE_BACKEND_API = `${URL_BASE_BACKEND}/api`;
export const TOKEN_CACHE_DURATION = 55 * 60 * 1000; // 55 minutos (tokens de Firebase duran 1 hora)

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