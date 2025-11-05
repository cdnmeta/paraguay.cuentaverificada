
import { z } from "zod";


export const PRODUCCION = import.meta.env.MODE === 'production';
export const ENTORNO = import.meta.env.VITE_ENTORNO || 'development';
let url_backend = "http://localhost:3000";
let url_backend_api = "http://localhost:3000/api";

if(ENTORNO === 'production'){
  url_backend = "https://api-py.cuentaverificada.com";
  url_backend_api = "https://api-py.cuentaverificada.com/api";
}else if(ENTORNO === 'test'){
  url_backend = "https://api-py-dev.cuentaverificada.com";
  url_backend_api = "https://api-py-dev.cuentaverificada.com/api";
}else{
  url_backend = "http://localhost:3000";
  url_backend_api = "http://localhost:3000/api";
}

export const NOMBRE_APP = "Cuenta Verificada";

export const TIPO_IMAGENES_PERMITIDAS = ['image/jpeg', 'image/png', 'image/jpg'];
const MB = 1024 * 1024;
const NUMERO_MB = 5;
export const MAXIMO_PESO_IMAGENES_BYTES = NUMERO_MB * MB;

// Esquema para imágenes NO REQUERIDAS (opcionales)
export const IMAGE_SCHEMA_NO_REQUERIDO = z
  .instanceof(File,{message: "El archivo un archivo valido"})
  .optional()
  .nullable()
  .refine((file) => {
    if (!file) return true; // Si no hay archivo, es válido
    return TIPO_IMAGENES_PERMITIDAS.includes(file.type);
  }, {
    message: "Formato de imagen inválido. Solo se permiten PNG, JPG y JPEG.",
  })
  .refine((file) => {
    if (!file) return true; // Si no hay archivo, es válido
    return file.size <= MAXIMO_PESO_IMAGENES_BYTES;
  }, {
    message: `El tamaño de la imagen debe ser menor a ${NUMERO_MB}MB.`,
  });

// Esquema para imágenes REQUERIDAS (obligatorias)
export const IMAGE_SCHEMA_REQUERIDO = z
  .instanceof(File, {
    message: "La imagen es obligatoria.",
  })
  .refine((file) => {
    return TIPO_IMAGENES_PERMITIDAS.includes(file.type);
  }, {
    message: "Formato de imagen inválido. Solo se permiten PNG, JPG y JPEG.",
  })
  .refine((file) => {
    return file.size <= MAXIMO_PESO_IMAGENES_BYTES;
  }, {
    message: `El tamaño de la imagen debe ser menor a ${NUMERO_MB}MB.`,
  });

// Función helper para crear esquemas de imagen personalizados
export const createImageSchema = (options = {}) => {
  const {
    required = false,
    maxSizeBytes = MAXIMO_PESO_IMAGENES_BYTES,
    allowedTypes = TIPO_IMAGENES_PERMITIDAS,
    requiredMessage = "La imagen es obligatoria.",
    typeMessage = "Formato de imagen inválido. Solo se permiten PNG, JPG y JPEG.",
    sizeMessage = `El tamaño de la imagen debe ser menor a ${NUMERO_MB}MB.`,
  } = options;

  let schema = z.instanceof(File);

  if (!required) {
    schema = schema.optional().nullable();
  } else {
    schema = schema.refine(() => true, { message: requiredMessage });
  }

  // Validación de tipo
  schema = schema.refine((file) => {
    if (!required && !file) return true;
    return allowedTypes.includes(file.type);
  }, {
    message: typeMessage,
  });

  // Validación de tamaño
  schema = schema.refine((file) => {
    if (!required && !file) return true;
    return file.size <= maxSizeBytes;
  }, {
    message: sizeMessage,
  });

  return schema;
};

// Esquemas específicos para diferentes casos de uso
export const CEDULA_FRONTAL_SCHEMA = createImageSchema({
  required: true,
  requiredMessage: "La imagen de la cédula frontal es obligatoria.",
});

export const CEDULA_REVERSO_SCHEMA = createImageSchema({
  required: true,
  requiredMessage: "La imagen de la cédula reverso es obligatoria.",
});

export const SELFIE_SCHEMA = createImageSchema({
  required: true,
  requiredMessage: "La selfie es obligatoria.",
});

export const LOGO_COMERCIO_SCHEMA = createImageSchema({
  required: false,
  requiredMessage: "El logo del comercio es opcional.",
});

// Esquema para múltiples imágenes (array)
export const MULTIPLE_IMAGES_SCHEMA = z
  .array(IMAGE_SCHEMA_NO_REQUERIDO)
  .optional()
  .refine((files) => {
    if (!files) return true;
    return files.length <= 5; // Máximo 5 imágenes
  }, {
    message: "Máximo 5 imágenes permitidas.",
  });





export const URL_BASE_BACKEND = url_backend;
export const URL_BASE_BACKEND_API = url_backend_api;
export const TOKEN_CACHE_DURATION = 55 * 60 * 1000; // 55 minutos (tokens de Firebase duran 1 hora)


export const REGEX_CEDULA_IDENTIDAD = /^[1-9]\d{5,7}$/;
export const CANT_MIN_CARACTERES_CONTRASENA = 6;

export const CODIGO_PAIS_BASE = "PY";



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