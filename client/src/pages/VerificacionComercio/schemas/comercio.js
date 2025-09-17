import { z } from "zod";

export const comercioSchema = z.object({
  razonSocial: z.string().min(3, "Debe tener al menos 3 caracteres").trim(),
  ruc: z
    .string()
    .regex(/^[0-9]+-[0-9]$/, "Formato inválido. Ejemplo: 978783-8")
    .nonempty("El R.U.C. es obligatorio")
    .trim(),
  telefono: z
    .string()
    .min(7, "El teléfono debe tener al menos 7 dígitos")
    .regex(/^0[0-9]{6,11}$/, "Formato de teléfono inválido. Ej: 0983123456")
    .trim(),
  comprobantePago: z
    .any()
    .refine((f) => f?.length, "Archivo obligatorio")
    .refine((f) => f[0]?.size <= 5 * 1024 * 1024, "Máx. 5MB")
    .refine(
      (f) =>
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          f[0]?.type
        ),
      "Formato inválido"
    ),
  codigoVendedor: z.string().trim().optional(),
  dialCode: z.string().min(1, "Debe seleccionar un país"),
  codigoPais: z.string().min(2, "Debe seleccionar un país"),
  aceptaTerminos: z.literal(true, {
    errorMap: () => ({ message: "Debe aceptar los términos" }),
  }),
});

export const comercioUpdateSchema = comercioSchema.omit({
  aceptaTerminos: true,
});

const fileSizeLimit = 5 * 1024 * 1024; // 5MB

const ImageSchema = z
  .instanceof(File, { message: "El archivo es obligatorio" })
  .refine(
    (file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
    { message: "Tipo de archivo inválido" }
  )
  .refine((file) => file.size <= fileSizeLimit, {
    message: "El tamaño del archivo no debe exceder 5MB",
  });

export const comercioVerificacionInformacion = z.object({
  correo_empresa: z.string({ required_error: "Correo requerido" }).trim().email("Correo inválido"),
  url_maps: z
    .string({ required_error: "Url requerida" })
    .trim()
    .url("URL inválida")
    .regex(
      /^https:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.[a-z.]+\/maps|maps\.google\.[a-z.]+\/\?q=|www\.google\.com\/maps)[^\s]*$/i,
      "Debe ser un enlace válido de Google Maps"
    ),
  foto_interior: ImageSchema,
  foto_exterior: ImageSchema,
  factura_servicio: ImageSchema,
  direccion: z.string({ required_error: "Dirección requerida" }).trim().min(5, "Debe tener al menos 5 caracteres"),
});

export const updateComercioVerificacionInformacion = comercioVerificacionInformacion.partial();
