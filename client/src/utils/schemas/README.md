# Esquemas de Validación de Imágenes

## 📋 Esquemas Disponibles

### Esquemas Básicos

```javascript
import {
  IMAGE_SCHEMA_NO_REQUERIDO,
  IMAGE_SCHEMA_REQUERIDO,
  createImageSchema,
} from "@/utils/constants";
```

### Esquemas Específicos

```javascript
import {
  CEDULA_FRONTAL_SCHEMA,
  CEDULA_REVERSO_SCHEMA,
  SELFIE_SCHEMA,
  LOGO_COMERCIO_SCHEMA,
} from "@/utils/constants";
```

## 🚀 Ejemplos de Uso

### 1. Formulario de Usuario (Básico)

```javascript
const schema = z.object({
  nombre: z.string().min(1),
  // Imágenes opcionales
  cedula_frontal: IMAGE_SCHEMA_NO_REQUERIDO,
  cedula_reverso: IMAGE_SCHEMA_NO_REQUERIDO,
  selfie: IMAGE_SCHEMA_NO_REQUERIDO,
});
```

### 2. Formulario de Usuario (Requeridas)

```javascript
const schema = z.object({
  nombre: z.string().min(1),
  // Imágenes obligatorias
  cedula_frontal: IMAGE_SCHEMA_REQUERIDO,
  cedula_reverso: IMAGE_SCHEMA_REQUERIDO,
  selfie: IMAGE_SCHEMA_REQUERIDO,
});
```

### 3. Esquemas Contextuales

```javascript
import { createUserImageSchemas } from "@/utils/schemas/imageSchemas";

// Para creación (imágenes requeridas)
const createSchema = z.object({
  nombre: z.string().min(1),
  ...createUserImageSchemas(false), // isEdit = false
});

// Para edición (imágenes opcionales)
const editSchema = z.object({
  nombre: z.string().min(1),
  ...createUserImageSchemas(true), // isEdit = true
});
```

### 4. Esquemas Personalizados

```javascript
import { createImageSchema } from "@/utils/constants";

const customSchema = z.object({
  // Avatar pequeño (512KB máximo)
  avatar: createImageSchema({
    required: false,
    maxSizeBytes: 512 * 1024,
    sizeMessage: "El avatar debe ser menor a 512KB",
  }),
  
  // Banner grande (5MB máximo)
  banner: createImageSchema({
    required: false,
    maxSizeBytes: 5 * 1024 * 1024,
    sizeMessage: "El banner debe ser menor a 5MB",
  }),
  
  // Documento oficial (obligatorio, solo JPG/PNG)
  documento: createImageSchema({
    required: true,
    allowedTypes: ['image/jpeg', 'image/png'],
    requiredMessage: "El documento es obligatorio",
    typeMessage: "Solo se permiten archivos JPG y PNG",
  }),
});
```

### 5. Múltiples Imágenes

```javascript
import { MULTIPLE_IMAGES_SCHEMA } from "@/utils/constants";

const galeriaSchema = z.object({
  titulo: z.string(),
  imagenes: MULTIPLE_IMAGES_SCHEMA, // Máximo 5 imágenes
});
```

## 🔧 Configuración de Parámetros

### Función `createImageSchema(options)`

```javascript
const schema = createImageSchema({
  required: false,                    // ¿Es obligatoria?
  maxSizeBytes: 2 * 1024 * 1024,     // Tamaño máximo (2MB)
  allowedTypes: ['image/jpeg'],       // Tipos permitidos
  requiredMessage: "Imagen requerida", // Mensaje si falta
  typeMessage: "Tipo inválido",       // Mensaje tipo incorrecto
  sizeMessage: "Muy pesada",          // Mensaje tamaño excedido
});
```

## 📝 En React Hook Form

### Ejemplo Completo

```jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserImageSchemas } from "@/utils/schemas/imageSchemas";

const FormUsuario = ({ isEdit = false }) => {
  const schema = z.object({
    nombre: z.string().min(1, "Nombre requerido"),
    email: z.string().email("Email inválido"),
    ...createUserImageSchemas(isEdit),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    setValue(fieldName, file);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("nombre")} />
      {errors.nombre && <span>{errors.nombre.message}</span>}
      
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, "cedula_frontal")}
      />
      {errors.cedula_frontal && (
        <span>{errors.cedula_frontal.message}</span>
      )}
    </form>
  );
};
```

## ✅ Ventajas

- ✅ **Reutilizable**: Un esquema para muchos formularios
- ✅ **Consistente**: Mismas validaciones en toda la app
- ✅ **Flexible**: Personalizable según contexto
- ✅ **Mantenible**: Cambios centralizados
- ✅ **Tipado**: Validación de tipos de archivo
- ✅ **Tamaño**: Control de peso de archivos
- ✅ **Mensajes**: Errores claros para el usuario

## 🔄 Migración desde Validación Manual

### Antes ❌
```javascript
cedula_frontal: z.instanceof(File)
  .refine((file) => {
    if (!file) return true;
    return file.size <= MAXIMO_PESO_IMAGENES_BYTES;
  }, { message: "Muy pesada" })
  .refine((file) => {
    if (!file) return true;
    return file.type.startsWith('image/');
  }, { message: "Tipo inválido" }),
```

### Después ✅
```javascript
cedula_frontal: IMAGE_SCHEMA_NO_REQUERIDO,
```
