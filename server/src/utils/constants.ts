import { join } from 'path';


export const PRODUCCION = process.env.NODE_ENV === 'production';
export const ENTORNO = process.env.NODE_ENV || 'development';
export const NOMBRE_APP = 'Hola Yo Soy';
const baseDir = PRODUCCION ? 'dist' : 'src';

const url_origins_dev = ['http://localhost:5173']
const url_origins_prod = ['https://cuenta-verificada-py.pages.dev', 'https://paraguay.cuentaverificada.com']


export const URL_BASE = PRODUCCION
  ? 'https://holayosoy.com'
  : 'http://localhost:3000';

export const URL_ORIGINS = PRODUCCION ? url_origins_prod : url_origins_dev;

export const PATH_EMAIL_TEMPLATES_EJS = join(process.cwd(), baseDir, 'templates', 'emails');

export const NOMBRE_CARPETA_PUBLIC = 'public';

export const URL_PUBLIC = URL_BASE + `/${NOMBRE_CARPETA_PUBLIC}`; // ajustá según serveRoot

export const URL_BASE_API = URL_BASE;

export const PUBLIC_DIR = join(process.cwd(), '..', '..', `${NOMBRE_CARPETA_PUBLIC}`);
export const UPLOADS_DIR = join(process.cwd(), '..', '..', 'uploads');

export const AVATARS_FOLDER = 'avatars';
export const CEDULAS_FOLDER = 'cedulas';

/**
 * Devuelve la ruta de la carpeta de almacenamiento según si es pública o privada.
 *
 * @param folder - Nombre de la carpeta de destino dentro del directorio de almacenamiento.
 * @param isPublic - Indica si la carpeta es pública (`true`) o privada (`false`).
 * @returns La ruta absoluta a la carpeta de almacenamiento correspondiente.
 *
 * @remarks
 * - `PUBLIC_DIR`: Directorio raíz donde se almacenan los archivos públicos.
 * - `UPLOADS_DIR`: Directorio raíz donde se almacenan los archivos privados/subidos.
 */
export const getStorageFolderPath = (folder: string, isPublic: boolean): string => {
  return isPublic ? join(PUBLIC_DIR, folder) : join(UPLOADS_DIR, folder);
}; 

export const CANT_HORAS_EXP_TOKEN_SOLICITUD_CUENTA = 1;

export enum GruposSistema {
  DEPARTAMENTO_LEGAL = 1,
  VERIFICADOR = 2,
  VENDEDOR = 3,
  PARTICIPANTE = 4,
  AGENTE_SOPORTE = 5,
}
