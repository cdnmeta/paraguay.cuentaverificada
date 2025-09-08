export interface ImagenesVerificacionCuenta {
  cedula_frontal: Express.Multer.File[];
  cedula_reverso: Express.Multer.File[]
  selfie_user: Express.Multer.File[];
}
