import { z } from 'zod';

export const recordatorioSchema = z.object({
  titulo: z
    .string()
    .min(1, 'El título es requerido')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(255, 'El título no puede tener más de 255 caracteres'),
  
  descripcion: z
    .string()
    .max(1000, 'La descripción no puede tener más de 1000 caracteres'),
  
  fecha_recordatorio: z
    .date({
      required_error: 'La fecha del recordatorio es requerida',
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .refine(
      (date) => date > new Date(),
      {
        message: 'La fecha del recordatorio debe ser posterior a la fecha actual',
      }
    ),
});