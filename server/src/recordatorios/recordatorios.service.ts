  import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { PrismaService } from '@/prisma/prisma.service';
  import { FirebaseService } from '@/firebase/firebase.service';
  import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
  import { crearNombreArchivoDesdeMulterFile } from '@/utils/funciones';
  import {
    CreateRecordatorioDto,
    UpdateEstadoDto,
    UpdateRecordatorioDto,
  } from './dto/recordatorios.dto';
  import { TipoRecordatorio } from './emuns/tipos-recordatorios';
  import { QueryMisRecordatoriosDto } from './dto/query-recordatorios.dto';
  import { DatabasePromiseService } from '@/database/database-promise.service';

  @Injectable()
  export class RecordatoriosService {
    constructor(
      private readonly prismaService: PrismaService,
      private readonly firebaseService: FirebaseService,
      private readonly dbPromiseService: DatabasePromiseService,
    ) {}

    /**
     * Registrar un nuevo recordatorio
     */
    async registrarRecordatorio(
      dto: CreateRecordatorioDto,
      imagenes?: Express.Multer.File[],
    ) {
      try {
        // Validar que el usuario existe
        const usuarioExiste = await this.prismaService.usuarios.findFirst({
          where: { id: dto.id_usuario, activo: true },
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
                imagen.mimetype,
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
            fecha_recordatorio: dto.fecha_recordatorio,
            tipo_recordatorio:
              dto.tipo_recordatorio || TipoRecordatorio.DONDE_GUARDE,
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
        const recordatorioExistente =
          await this.prismaService.recordatorios.findUnique({
            where: { id },
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
                imagen.mimetype,
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
          ...nuevasUrlsImagenes,
        ];

        // Actualizar el recordatorio
        const recordatorioActualizado =
          await this.prismaService.recordatorios.update({
            where: { id },
            data: {
              ...dto,
              url_imagen: urlsImagenesActualizadas,
              fecha_actualizacion: new Date(),
            },
            include: {
              usuarios: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  email: true,
                },
              },
            },
          });

        return recordatorioActualizado;
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
          where: { id },
        });

        if (!recordatorio) {
          throw new NotFoundException('Recordatorio no encontrado');
        }

        // Verificar que el usuario autenticado es el propietario del recordatorio
        if (
          usuarioAutenticado &&
          recordatorio.id_usuario !== usuarioAutenticado
        ) {
          throw new BadRequestException(
            'No tienes permisos para eliminar este recordatorio',
          );
        }

        // Soft delete
        await this.prismaService.recordatorios.update({
          where: { id },
          data: {
            activo: false,
            fecha_actualizacion: new Date(),
          },
        });

        return {
          message: 'Recordatorio eliminado exitosamente',
        };
      } catch (error) {
        throw error;
      }
    }

    /**
     * Eliminar recordatorio permanentemente (hard delete)
     */
    async eliminarRecordatorioPermanente(
      id: number,
      usuarioAutenticado?: number,
    ) {
      try {
        const recordatorio = await this.prismaService.recordatorios.findUnique({
          where: { id },
        });

        if (!recordatorio) {
          throw new NotFoundException('Recordatorio no encontrado');
        }

        // Verificar que el usuario autenticado es el propietario del recordatorio
        if (
          usuarioAutenticado &&
          recordatorio.id_usuario !== usuarioAutenticado
        ) {
          throw new BadRequestException(
            'No tienes permisos para eliminar este recordatorio permanentemente',
          );
        }

        // Eliminar imágenes de Firebase
        if (recordatorio.url_imagen && recordatorio.url_imagen.length > 0) {
          for (const urlImagen of recordatorio.url_imagen) {
            try {
              // Extraer el path del archivo de la URL de Firebase
              const fileName = this.extraerNombreArchivoDeUrl(urlImagen);
              if (fileName) {
                await this.firebaseService.eliminarArchivo(
                  `${FIREBASE_STORAGE_FOLDERS.recordatoriosUsuarios}/${fileName}`,
                );
              }
            } catch (error) {
              console.error('Error eliminando imagen de Firebase:', error);
            }
          }
        }

        // Eliminar de la base de datos
        await this.prismaService.recordatorios.delete({
          where: { id },
        });

        return {
          message: 'Recordatorio eliminado permanentemente',
        };
      } catch (error) {
        throw error;
      }
    }

    /**
     * Eliminar imágenes específicas del recordatorio
     */
    async eliminarImagenesRecordatorio(
      id: number,
      urlsAEliminar: string[],
      usuarioAutenticado?: number,
    ) {
      try {
        const recordatorio = await this.prismaService.recordatorios.findUnique({
          where: { id },
        });

        if (!recordatorio) {
          throw new NotFoundException('Recordatorio no encontrado');
        }

        // Verificar que el usuario autenticado es el propietario del recordatorio
        if (
          usuarioAutenticado &&
          recordatorio.id_usuario !== usuarioAutenticado
        ) {
          throw new BadRequestException(
            'No tienes permisos para modificar las imágenes de este recordatorio',
          );
        }

        // Filtrar las URLs que se mantendrán
        const urlsMantenidas = recordatorio.url_imagen.filter(
          (url) => !urlsAEliminar.includes(url),
        );

        // Eliminar imágenes de Firebase
        for (const urlAEliminar of urlsAEliminar) {
          try {
            const fileName = this.extraerNombreArchivoDeUrl(urlAEliminar);
            if (fileName) {
              await this.firebaseService.eliminarArchivo(
                `${FIREBASE_STORAGE_FOLDERS.recordatoriosUsuarios}/${fileName}`,
              );
            }
          } catch (error) {
            console.error('Error eliminando imagen de Firebase:', error);
          }
        }

        // Actualizar el recordatorio con las URLs restantes
        const recordatorioActualizado =
          await this.prismaService.recordatorios.update({
            where: { id },
            data: {
              url_imagen: urlsMantenidas,
              fecha_actualizacion: new Date(),
            },
          });

        return recordatorioActualizado;
      } catch (error) {
        throw error;
      }
    }

    /**
     * Obtener recordatorios por usuario
     */
    async obtenerRecordatoriosPorUsuario(
      id_usuario: number,
      query: QueryMisRecordatoriosDto,
    ) {
      const whereClausule = {
        id_usuario: id_usuario,
      };
      let sql = `SELECT
        R.ID,
        R.TITULO,
        R.DESCRIPCION,
        R.FECHA_CREACION,
        R.FECHA_RECORDATORIO,
        R.ID_ESTADO,
        R.FECHA_CREACION,
        R.OBSERVACION,
        (
          CASE
            WHEN R.ID_ESTADO = 1 THEN 'Pendiente'
            WHEN R.ID_ESTADO = 2 THEN 'Completado'
            WHEN R.ID_ESTADO = 3 THEN 'Archivado'
            WHEN R.FECHA_RECORDATORIO > CURRENT_TIMESTAMP
            AND R.TIPO_RECORDATORIO = 2 THEN 'Vencido'
            ELSE 'Desconocido'
          END
        ) AS DESCRIPCION_ESTADO
      FROM
        RECORDATORIOS R
      WHERE
        R.ID_USUARIO = $(id_usuario)
        AND R.ACTIVO = TRUE`
      try {
        if (query.tipo_recordatorio) {
          whereClausule['tipo_recordatorio'] = query.tipo_recordatorio;
          sql += ` AND R.TIPO_RECORDATORIO = $(tipo_recordatorio)`;
        }
        if (query.fecha_recordatorio) {
          whereClausule['fecha_recordatorio'] = new Date(
            query.fecha_recordatorio,
          );
          sql += ` AND R.FECHA_RECORDATORIO = $(fecha_recordatorio)`;
        }
        sql += ` ORDER BY R.FECHA_CREACION DESC`;

        const recordatorios = await this.dbPromiseService.result(sql, whereClausule);
        return recordatorios.rows;
      } catch (error) {
        throw error;
      }
    }

    async getRecordatoriosHoyPorUsuario(idUsuario: number) {
      try {
        const sql = `SELECT
        R.id,
        R.TITULO,
        R.DESCRIPCION,
        R.FECHA_CREACION,
        R.FECHA_RECORDATORIO
      FROM
        RECORDATORIOS R
      WHERE
        R.TIPO_RECORDATORIO = 2
        AND R.ID_ESTADO = 1
        AND R.FECHA_RECORDATORIO::DATE = CURRENT_DATE
        AND R.ID_USUARIO = $1
        AND R.ACTIVO = TRUE`;
        const recordatorios = await this.dbPromiseService.result(sql, [idUsuario]);
        return recordatorios.rows;
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
                email: true,
              },
            },
          },
        });

        if (!recordatorio) {
          throw new NotFoundException('Recordatorio no encontrado');
        }

        // Verificar que el usuario autenticado es el propietario del recordatorio
        if (
          usuarioAutenticado &&
          recordatorio.id_usuario !== usuarioAutenticado
        ) {
          throw new BadRequestException(
            'No tienes permisos para ver este recordatorio',
          );
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

    async actualizarEstadoRecordatorio(id: number, dto: UpdateEstadoDto) {
      try {
        // Verificar que el recordatorio existe
        const recordatorioExistente =
          await this.prismaService.recordatorios.findFirst({
            where: { id },
          });

        if (!recordatorioExistente) {
          throw new NotFoundException('Recordatorio no encontrado');
        }

        const recordatorio = await this.prismaService.recordatorios.update({
          where: { id },
          data: {
            id_estado: dto.id_estado,
            fecha_actualizacion: new Date(),
            observacion: dto.observacion,
          },
        });

        return recordatorio;
      } catch (error) {}
    }
  }
