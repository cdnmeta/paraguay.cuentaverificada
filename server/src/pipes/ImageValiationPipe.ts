import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import {
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';



@Injectable()
export class ImageFileValidationPipe implements PipeTransform {
  constructor(
    private options: {
      required?: boolean;
      maxSize?: number; // en bytes
      allowedMimeTypes?: string[];
    } = {},
  ) {}

  transform(file: Express.Multer.File) {
    // Si es requerido y no está presente
    if (this.options.required && !file) {
      throw new BadRequestException('El archivo es obligatorio');
    }

    // Si el archivo está presente, hacemos validaciones extra
    if (file) {
      // Valida tipo mime
      if (
        this.options.allowedMimeTypes &&
        !this.options.allowedMimeTypes.includes(file.mimetype)
      ) {
        throw new BadRequestException('Tipo de archivo no permitido');
      }

      // Valida tamaño
      if (
        this.options.maxSize &&
        file.size > this.options.maxSize
      ) {
        throw new BadRequestException('El archivo es demasiado grande');
      }
    }

    return file;
  }
}


type Options = {
  required?: boolean;                 // si quieres que existan archivos
  maxSize?: number;                   // bytes (por archivo)
  fileType?: RegExp | string;         // valida mimetype (no extensión)
};


@Injectable()
export class ParseFilesPipe implements PipeTransform {
  constructor(
    private readonly opts: Options = {},
  ) {}

  async transform(value: any) {
    const {
      required = false,
      maxSize = 2 * 1024 * 1024,                 // 2MB
      fileType = /^image\/(jpeg|png|jpg)$/i,     // mimetypes permitidos
    } = this.opts;

    // `value` puede ser:
    // - Array<Express.Multer.File> (FilesInterceptor)
    // - { campo: Express.Multer.File[] } (FileFieldsInterceptor)
    // - undefined/null
    if (!value) {
      if (required) {
        throw new BadRequestException('Archivos requeridos');
      }
      return value;
    }

    // Pipe de un solo archivo, lo reutilizamos por cada uno:
    const singleFilePipe = new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({
          maxSize,
          message: `El archivo es demasiado grande. Máximo ${Math.round(maxSize / (1024*1024))}MB.`,
        }),
        new FileTypeValidator({ fileType }),
      ],
      fileIsRequired: required,
    });

    const validateOne = async (f?: Express.Multer.File) => singleFilePipe.transform(f);

    if (Array.isArray(value)) {
      await Promise.all(value.map(validateOne));
    } else if (typeof value === 'object') {
      const fields = Object.keys(value);
      for (const k of fields) {
        const arr = value[k] as Express.Multer.File[] | undefined;
        if (!arr || arr.length === 0) {
          if (required) throw new BadRequestException(`Archivo requerido: ${k}`);
          continue;
        }
        await Promise.all(arr.map(validateOne));
      }
    } else {
      // por si algún interceptor devolviera un único archivo (raro en UploadedFiles)
      await validateOne(value as Express.Multer.File);
    }

    return value; // devolvemos lo mismo, ya validado
  }
}


type ValidateOpts = {
  required?: boolean;
  maxSizeMB?: number;
  // mimetype, no extensión
  fileType?: RegExp | string;
  requiredErrorMessage?: string;
};

export function validateImageOrThrow(
  file: Express.Multer.File | undefined,
  { required = false, maxSizeMB = 2, fileType = /^image\/(jpeg|png|jpg)$/i , requiredErrorMessage = "Archivo requerido"}: ValidateOpts = {},
) {
  if (!file) {
    if (required) {
      const messageError = requiredErrorMessage;
      throw new BadRequestException(messageError);
    }
    return; // opcional
  }

  // tamaño
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new BadRequestException(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB.`);
  }

  // mimetype
  const isValid =
    typeof fileType === 'string'
      ? new RegExp(fileType, 'i').test(file.mimetype)
      : fileType.test(file.mimetype);

  if (!isValid) {
    throw new BadRequestException('Tipo de archivo inválido. Solo imágenes (jpeg, jpg, png).');
  }
}



