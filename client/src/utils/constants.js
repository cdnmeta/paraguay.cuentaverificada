
import { z } from "zod";


const PRODUCCION = import.meta.env.MODE === 'production';
let url_backend = "http://localhost:3000";
let url_backend_api = "http://localhost:3000/api";
  
if(PRODUCCION){
  url_backend = "https://py.cuentaverificada.com";
  url_backend_api = "https://py.cuentaverificada.com/api";
}

export const TIPO_IMAGENES_PERMITIDAS = ['image/jpeg', 'image/png', 'image/jpg'];
const MB = 1024 * 1024;
const NUMERO_MB = 2;
export const MAXIMO_PESO_IMAGENES_BYTES = NUMERO_MB * MB;

export const IMAGE_SCHEMA = z
  .instanceof(File)
  .nullable()
  .refine(
    (file) =>{
      if( file?.type && !TIPO_IMAGENES_PERMITIDAS.includes(file?.type)){
        return "Formato imagen invalido. Solo PNG, JPG y JPEG.";
      }
      if (file?.size > MAXIMO_PESO_IMAGENES_BYTES) {
        return `El tamaño de la imagen debe ser menor a ${NUMERO_MB}MB.`;
      }
      return true;
    }
   
  );





export const URL_BASE_BACKEND = url_backend;
export const URL_BASE_BACKEND_API = url_backend_api;
export const TOKEN_CACHE_DURATION = 55 * 60 * 1000; // 55 minutos (tokens de Firebase duran 1 hora)


export const REGEX_CEDULA_IDENTIDAD = /^[1-9]\d{5,7}$/;
export const CANT_MIN_CARACTERES_CONTRASENA = 6;



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