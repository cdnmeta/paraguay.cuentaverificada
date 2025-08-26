// utils/multer-options.ts
import { diskStorage } from 'multer';
import { getStorageFolderPath } from './constants';
import { extname } from 'path';
import { generarUUIDHASH } from './security';
import { existsSync, mkdirSync } from 'fs';

export function getMulterOptions(folder: string, isPublic = true) {
  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dest = getStorageFolderPath(folder, isPublic);
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true }); // crea si no existe
        }
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const ext = extname(file.originalname);

        const idHash = generarUUIDHASH().slice(0, 12); // Shorten the hash for filename
        const filename = `${idHash}${ext}`;
        // 💡 Guardamos el folder en el archivo para usarlo después
        (file as any).relativePath = `${folder}/${filename}`;
        cb(null, filename);
      },
    }),
  };
}
