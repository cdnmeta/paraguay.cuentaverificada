export interface ArchivosSolicitudCuenta {
  cedula_frontal: Express.Multer.File[];
}

export interface UsuariosArchivos {
  cedulaFrente: Express.Multer.File;
  cedulaReverso: Express.Multer.File;
  selfie: Express.Multer.File;
}