import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  InternalServerErrorException 
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { crearNombreArchivoDesdeMulterFile } from '@/utils/funciones';
import { CreateRecordatorioDto, UpdateEstadoDto, UpdateRecordatorioDto } from './dto/recordatorios.dto';

@Injectable()
export class RecordatoriosService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Registrar un nuevo recordatorio
   */
  async registrarRecordatorio(
    dto: CreateRecordatorioDto,
    imagenes?: Express.Multer.File[]
  ) {
    try {
      // Validar que el usuario existe
      const usuarioExiste = await this.prismaService.usuarios.findFirst({
        where: { id: dto.id_usuario, activo: true }
      });

      if (!usuarioExiste) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Subir imágenes a Firebase si existen
      const urlsImagenes: string[] = [];
      
      if (imagenes && imagenes.length > 0) {
        for (const imagen of imagenes) {
          try {
            const nombreArchivo = crearNombreArchivoDesdeMulterFile(imagen);
            const rutaArchivo = `${FIREBASE_STORAGE_FOLDERS.recordatoriosUsuarios}/${nombreArchivo}`;
            
            const urlImagen = await this.firebaseService.subirArchivoPrivado(
              imagen.buffer,
              rutaArchivo,
              imagen.mimetype
            );
            
            urlsImagenes.push(urlImagen);
          } catch (error) {
            console.error('Error subiendo imagen:', error);
            // Continúa con las demás imágenes
          }
        }
      }

      // Crear el recordatorio
      const recordatorio = await this.prismaService.recordatorios.create({
        data: {
          titulo: dto.titulo,
          descripcion: dto.descripcion,
          id_estado: dto.id_estado || 1,
          id_usuario: dto.id_usuario,
          url_imagen: urlsImagenes,
        },
      });

      return recordatorio;

    } catch (error) {
      // Si hubo error, intentar limpiar las imágenes subidas
      // (esto es opcional, podrías implementar un job de limpieza)
      throw error;
    }
  }

  /**
   * Actualizar un recordatorio existente
   */
  async actualizarRecordatorio(
    id: number,
    dto: UpdateRecordatorioDto,
    nuevasImagenes?: Express.Multer.File[],
  ) {
    try {
      // Verificar que el recordatorio existe
      const recordatorioExistente = await this.prismaService.recordatorios.findUnique({
        where: { id }
      });

      if (!recordatorioExistente) {
        throw new NotFoundException('Recordatorio no encontrado');
      }


      // Subir nuevas imágenes si existen
      const nuevasUrlsImagenes: string[] = [];
      
      if (nuevasImagenes && nuevasImagenes.length > 0) {
        for (const imagen of nuevasImagenes) {
          try {
            const nombreArchivo = crearNombreArchivoDesdeMulterFile(imagen);
            const rutaArchivo = `${FIREBASE_STORAGE_FOLDERS.recordatoriosUsuarios}/${nombreArchivo}`;
            
            const urlImagen = await this.firebaseService.subirArchivoPrivado(
              imagen.buffer,
              rutaArchivo,
              imagen.mimetype
            );
            
            nuevasUrlsImagenes.push(urlImagen);
          } catch (error) {
            console.error('Error subiendo nueva imagen:', error);
          }
        }
      }

      // Combinar URLs existentes con nuevas
      const urlsImagenesActualizadas = [
        ...recordatorioExistente.url_imagen,
        ...nuevasUrlsImagenes
      ];

      // Actualizar el recordatorio
      const recordatorioActualizado = await this.prismaService.recordatorios.update({
        where: { id },
        data: {
          ...dto,
          url_imagen: urlsImagenesActualizadas,
          fecha_actualizacion: new Date()
        },
        include: {
          usuarios: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true
            }
          }
        }
      });

      return recordatorioActualizado

    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar un recordatorio (soft delete)
   */
  async eliminarRecordatorio(id: number, usuarioAutenticado?: number) {
    try {
      const recordatorio = await this.prismaService.recordatorios.findUnique({
        where: { id }
      });

      if (!recordatorio) {
        throw new NotFoundException('Recordatorio no encontrado');
      }

      // Verificar que el usuario autenticado es el propietario del recordatorio
      if (usuarioAutenticado && recordatorio.id_usuario !== usuarioAutenticado) {
        throw new BadRequestException('No tienes permisos para eliminar este recordatorio');
      }

      // Soft delete
      await this.prismaService.recordatorios.update({
        where: { id },
        data: {
          activo: false,
          fecha_actualizacion: new Date()
        }
      });

      return {
        message: 'Recordatorio eliminado exitosamente'
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar recordatorio permanentemente (hard delete)
   */
  async eliminarRecordatorioPermanente(id: number, usuarioAutenticado?: number) {
    try {
      const recordatorio = await this.prismaService.recordatorios.findUnique({
        where: { id }
      });

      if (!recordatorio) {
        throw new NotFoundException('Recordatorio no encontrado');
      }

      // Verificar que el usuario autenticado es el propietario del recordatorio
      if (usuarioAutenticado && recordatorio.id_usuario !== usuarioAutenticado) {
        throw new BadRequestException('No tienes permisos para eliminar este recordatorio permanentemente');
      }

      // Eliminar imágenes de Firebase
      if (recordatorio.url_imagen && recordatorio.url_imagen.length > 0) {
        for (const urlImagen of recordatorio.url_imagen) {
          try {
            // Extraer el path del archivo de la URL de Firebase
            const fileName = this.extraerNombreArchivoDeUrl(urlImagen);
            if (fileName) {
              await this.firebaseService.eliminarArchivo(`${FIREBASE_STORAGE_FOLDERS.recordatoriosUsuarios}/${fileName}`);
            }
          } catch (error) {
            console.error('Error eliminando imagen de Firebase:', error);
          }
        }
      }

      // Eliminar de la base de datos
      await this.prismaService.recordatorios.delete({
        where: { id }
      });

      return {
        message: 'Recordatorio eliminado permanentemente'
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar imágenes específicas del recordatorio
   */
  async eliminarImagenesRecordatorio(id: number, urlsAEliminar: string[], usuarioAutenticado?: number) {
    try {
      const recordatorio = await this.prismaService.recordatorios.findUnique({
        where: { id }
      });

      if (!recordatorio) {
        throw new NotFoundException('Recordatorio no encontrado');
      }

      // Verificar que el usuario autenticado es el propietario del recordatorio
      if (usuarioAutenticado && recordatorio.id_usuario !== usuarioAutenticado) {
        throw new BadRequestException('No tienes permisos para modificar las imágenes de este recordatorio');
      }

      // Filtrar las URLs que se mantendrán
      const urlsMantenidas = recordatorio.url_imagen.filter(
        url => !urlsAEliminar.includes(url)
      );

      // Eliminar imágenes de Firebase
      for (const urlAEliminar of urlsAEliminar) {
        try {
          const fileName = this.extraerNombreArchivoDeUrl(urlAEliminar);
          if (fileName) {
            await this.firebaseService.eliminarArchivo(`${FIREBASE_STORAGE_FOLDERS.recordatoriosUsuarios}/${fileName}`);
          }
        } catch (error) {
          console.error('Error eliminando imagen de Firebase:', error);
        }
      }

      // Actualizar el recordatorio con las URLs restantes
      const recordatorioActualizado = await this.prismaService.recordatorios.update({
        where: { id },
        data: {
          url_imagen: urlsMantenidas,
          fecha_actualizacion: new Date()
        }
      });

      return recordatorioActualizado;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener recordatorios por usuario
   */
  async obtenerRecordatoriosPorUsuario(idUsuario: number) {
    try {
      const recordatorios = await this.prismaService.recordatorios.findMany({
        where: {
          id_usuario: idUsuario,
          activo: true
        },
        orderBy: {
          fecha_creacion: 'desc'
        }
      });

      return recordatorios;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener un recordatorio por ID
   */
  async obtenerRecordatorioPorId(id: number, usuarioAutenticado?: number) {
    try {
      const recordatorio = await this.prismaService.recordatorios.findUnique({
        where: { id },
        include: {
          usuarios: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true
            }
          }
        }
      });

      if (!recordatorio) {
        throw new NotFoundException('Recordatorio no encontrado');
      }

      // Verificar que el usuario autenticado es el propietario del recordatorio
      if (usuarioAutenticado && recordatorio.id_usuario !== usuarioAutenticado) {
        throw new BadRequestException('No tienes permisos para ver este recordatorio');
      }

      return recordatorio;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Método auxiliar para extraer nombre de archivo de URL de Firebase
   */
  private extraerNombreArchivoDeUrl(url: string): string | null {
    try {
      // Las URLs de Firebase tienen formato: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Ffilename?alt=media&token=...
      const matches = url.match(/o\/(.+?)\?/);
      if (matches && matches[1]) {
        // Decodificar URL y obtener solo el nombre del archivo
        const fullPath = decodeURIComponent(matches[1]);
        return fullPath.split('/').pop() || null;
      }
      return null;
    } catch (error) {
      console.error('Error extrayendo nombre de archivo:', error);
      return null;
    }
  }


  async  actualizarEstadoRecordatorio(id: number, dto: UpdateEstadoDto) {
    try {
      // Verificar que el recordatorio existe
      const recordatorioExistente = await this.prismaService.recordatorios.findFirst({
        where: { id }
      });

      if (!recordatorioExistente) {
        throw new NotFoundException('Recordatorio no encontrado');
      }

      const recordatorio = await this.prismaService.recordatorios.update({
        where: { id },
        data: {
          id_estado: dto.id_estado,
          fecha_actualizacion: new Date()
        }
      });

      return recordatorio;

    } catch (error) {
      
    }
  }
}
