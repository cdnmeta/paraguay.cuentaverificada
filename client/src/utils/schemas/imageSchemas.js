import { z } from "zod";
import {
  TIPO_IMAGENES_PERMITIDAS,
  MAXIMO_PESO_IMAGENES_BYTES,
  IMAGE_SCHEMA_NO_REQUERIDO,
  IMAGE_SCHEMA_REQUERIDO,
  createImageSchema,
} from "@/utils/constants";

/**
 * Esquemas de validación para diferentes contextos de imágenes
 */

// Esquema para formulario de usuario (creación vs edición)
export const createUserImageSchemas = (isEdit = false) => {
  if (isEdit) {
    // En edición, las imágenes son opcionales
    return {
      cedula_frontal: IMAGE_SCHEMA_NO_REQUERIDO,
      cedula_reverso: IMAGE_SCHEMA_NO_REQUERIDO,
      selfie: IMAGE_SCHEMA_NO_REQUERIDO,
    };
  }

  // En creación, las imágenes son obligatorias
  return {
    cedula_frontal: IMAGE_SCHEMA_REQUERIDO,
    cedula_reverso: IMAGE_SCHEMA_REQUERIDO,
    selfie: IMAGE_SCHEMA_REQUERIDO,
  };
};

// Esquema para comercios
export const createComercioImageSchemas = () => ({
  logo: IMAGE_SCHEMA_NO_REQUERIDO,
  banner: IMAGE_SCHEMA_NO_REQUERIDO,
  galeria: z.array(IMAGE_SCHEMA_NO_REQUERIDO).optional(),
});

// Esquema para verificación de comercio
export const createVerificacionComercioSchemas = () => ({
  documento_legal: IMAGE_SCHEMA_REQUERIDO,
  comprobante_domicilio: IMAGE_SCHEMA_REQUERIDO,
  patente_comercial: IMAGE_SCHEMA_NO_REQUERIDO,
});

// Esquema para perfil con validaciones específicas
export const createPerfilImageSchemas = () => ({
  avatar: createImageSchema({
    required: false,
    maxSizeBytes: 1024 * 1024, // 1MB para avatares
    typeMessage: "El avatar debe ser PNG, JPG o JPEG",
    sizeMessage: "El avatar debe ser menor a 1MB",
  }),
  portada: createImageSchema({
    required: false,
    maxSizeBytes: 3 * 1024 * 1024, // 3MB para portadas
    typeMessage: "La portada debe ser PNG, JPG o JPEG",
    sizeMessage: "La portada debe ser menor a 3MB",
  }),
});

// Función helper para crear esquemas dinámicos basados en contexto
export const createContextualImageSchema = (context, options = {}) => {
  const contexts = {
    // Usuario - creación
    'user-create': {
      cedula_frontal: IMAGE_SCHEMA_REQUERIDO,
      cedula_reverso: IMAGE_SCHEMA_REQUERIDO,
      selfie: IMAGE_SCHEMA_REQUERIDO,
    },
    
    // Usuario - edición
    'user-edit': {
      cedula_frontal: IMAGE_SCHEMA_NO_REQUERIDO,
      cedula_reverso: IMAGE_SCHEMA_NO_REQUERIDO,
      selfie: IMAGE_SCHEMA_NO_REQUERIDO,
    },
    
    // Comercio - registro
    'comercio-register': {
      logo: IMAGE_SCHEMA_NO_REQUERIDO,
      documento_legal: IMAGE_SCHEMA_REQUERIDO,
      comprobante_domicilio: IMAGE_SCHEMA_REQUERIDO,
    },
    
    // Perfil público
    'perfil-public': {
      avatar: createImageSchema({
        required: false,
        maxSizeBytes: 1024 * 1024, // 1MB
      }),
    },
  };

  return contexts[context] || {};
};

// Ejemplo de uso con diferentes validaciones por campo
export const ADVANCED_IMAGE_SCHEMAS = {
  // Avatar pequeño
  avatar_small: createImageSchema({
    required: false,
    maxSizeBytes: 512 * 1024, // 512KB
    sizeMessage: "El avatar debe ser menor a 512KB",
  }),
  
  // Banner grande
  banner_large: createImageSchema({
    required: false,
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    sizeMessage: "El banner debe ser menor a 5MB",
  }),
  
  // Documento oficial
  documento_oficial: createImageSchema({
    required: true,
    allowedTypes: ['image/jpeg', 'image/png'], // Solo JPG y PNG
    typeMessage: "Los documentos oficiales solo permiten JPG y PNG",
    requiredMessage: "El documento oficial es obligatorio",
  }),
};

export default {
  createUserImageSchemas,
  createComercioImageSchemas,
  createVerificacionComercioSchemas,
  createPerfilImageSchemas,
  createContextualImageSchema,
  ADVANCED_IMAGE_SCHEMAS,
};
