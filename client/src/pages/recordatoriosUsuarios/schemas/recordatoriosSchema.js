import { z } from "zod";
import { IMAGE_SCHEMA_NO_REQUERIDO } from "@/utils/constants";

// Schema para crear recordatorio
export const schemaCreateRecordatorio = z.object({
  titulo: z
    .string({required_error: "El título es requerido"})
    .min(1, "El título es requerido")
    .max(100, "El título no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres"),
  id_estado: z
    .number()
    .optional()
    .default(1),
  imagenes: z
    .array(IMAGE_SCHEMA_NO_REQUERIDO)
    .optional()
    .default([])
});

// Schema para editar recordatorio (mismos campos)
export const schemaUpdateRecordatorio = schemaCreateRecordatorio;