import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateComercioDto } from './dto/create-comercio.dto';
import { UpdateComercioDto } from './dto/update-comercio.dto';
import {
  SolicitudVerificacionRegistrarComercioDto,
  UpdateSeguimientoAprobacionComercioDto,
  UpdateSolicitudComercioDto,
} from './dto/solicitud-verficacion.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  crearNombreArchivoDesdeMulterFile,
  crearSlug,
} from '@/utils/funciones';
import { FirebaseService } from '@/firebase/firebase.service';
import {
  QueryForUsers,
  QueryManyComercios,
} from './dto/query-comercios-users.dto';
import {
  cursorPaginatePrisma,
  getTakeCursorForPrisma,
} from '@/herper/paguinationPrisma';
import { DatabaseService } from '@/database/database.service';
import {
  sqlListadoComercios,
  sqlListadoComerciosPendientes,
} from './sql/consultas';
import * as path from 'path';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { FilesVerificacionComercio } from './types/archivos-comercios';

interface FileSolicitudVerificacion {
  comprobantePago: Express.Multer.File;
}

@Injectable()
export class ComerciosService {
  constructor(
    private readonly prismaService: PrismaService, // Assuming PrismaService is injected for database operations
    private readonly firebaseService: FirebaseService, // Assuming FirebaseService is injected for file storage

    private readonly dbService: DatabaseService, // Assuming DatabaseService is injected for database transactions
    private readonly databasePromiseService: DatabasePromiseService,
  ) {}



  async updateComercio(
    id: number,
    data: UpdateComercioDto,
    files?: FilesVerificacionComercio,
  ) {
    try {
      const comercio = await this.prismaService.comercio.findFirst({
        where: {
          AND: [{ id: id }, { activo: true }],
        },
      });

      if (!comercio) throw new NotFoundException('Comercio no encontrado');

      if (comercio.estado !== 5)
        throw new BadRequestException(
          'El comercio no está en estado de Comercio Rechazado',
        );

      const pathImagenes: Record<string, string> = {};
      if (files) {
        // subir imagenes a firebase
        const nombreFotoInterior = path.basename(comercio.foto_interior || '');
        const nombreFotoExterior = path.basename(comercio.foto_exterior || '');
        const nombrefacturaServicio = path.basename(
          comercio.imagen_factura_servicio || '',
        );
        const nombreCedulaFrontal = path.basename(
          comercio.cedula_frontal || '',
        );
        const nombreCedulaReverso = path.basename(
          comercio.cedula_reverso || '',
        );
        await Promise.all(
          Object.entries(files).map(async ([key, file]) => {
            let nombreArchivoComprobante = '';

            // obtener nombre del archivo o generar uno nuevo
            switch (key) {
              case 'foto_interior':
                nombreArchivoComprobante =
                  nombreFotoInterior || crearNombreArchivoDesdeMulterFile(file);
                break;
              case 'foto_exterior':
                nombreArchivoComprobante =
                  nombreFotoExterior || crearNombreArchivoDesdeMulterFile(file);
                break;
              case 'imagen_factura_servicio':
                nombreArchivoComprobante =
                  nombrefacturaServicio ||
                  crearNombreArchivoDesdeMulterFile(file);
                break;
            }

            if (file) {
              const rutaArchivo = `${FIREBASE_STORAGE_FOLDERS.comprobantes}/${nombreArchivoComprobante}`;
              const urlPathComprobante =
                await this.firebaseService.subirArchivoPrivado(
                  file.buffer,
                  rutaArchivo,
                  file.mimetype,
                );
              pathImagenes[key] = rutaArchivo;
            }
          }),
        );
      }

      const fecha = new Date();

      const updatedComercio = await this.prismaService.$transaction(
        async (prisma) => {
          const comercioActualizado = await prisma.comercio.update({
            where: { id },
            data: {
              estado: data.id_estado || 1,
              foto_interior: pathImagenes.foto_interior,
              foto_exterior: pathImagenes.foto_exterior,
              imagen_factura_servicio: pathImagenes.imagen_factura_servicio,
              id_usuario_actualizacion: data.id_usuario_modificacion,
              fecha_actualizacion: fecha,
              urlmaps: data.url_maps,
              correo_empresa: data.email,
            },
          });

          return comercioActualizado;
        },
      );

      return updatedComercio;
    } catch (error) {
      console.error('Error al actualizar información de comercio:', error);
      throw error;
    }
  }

  async getOpcionesFiltroComercios() {
    try {
      const estados = await this.prismaService.estados_comercios.findMany({
        select: {
          id: true,
          descripcion: true,
        },
      });
      return { estados };
    } catch (error) {
      throw error;
    }
  }

  async findAllForUsers(userId: number, query?: QueryForUsers) {
    try {
      const { take, cursor } = getTakeCursorForPrisma(query);

      const clausulaWhere: any = {
        id_usuario: userId,
        activo: true,
      };

      if (query?.estado) {
        clausulaWhere.estado = { in: query.estado };
      }

      console.log(clausulaWhere);

      const comercios = await cursorPaginatePrisma(
        this.prismaService.comercio,
        {
          select: {
            razon_social: true,
            telefono: true,
            estado: true,
            id: true,
            eslogan: true,
            direccion: true,
            ruc: true,
            slug: true,
            motivo_rechazo: true,
            fecha_actualizacion_estado: true,
            estados_comercios: {
              select: {
                id: true,
                descripcion: true,
              },
            },
          },
          where: clausulaWhere,
          take,
          cursor,
          orderBy: { id: 'desc' },
        },
      );
      return comercios;
    } catch (error) {
      console.error('Error al obtener comercios para el usuario:', error);
      throw error;
    }
  }

  async getComerciosAprovacionPagos() {
    try {
      const comercios = await this.dbService.query(
        sqlListadoComerciosPendientes,
      );
      return comercios.rows;
    } catch (error) {
      throw error;
    }
  }

  async findOneUser(id: number, id_usuario: number) {
    try {
      const comercio = await this.prismaService.comercio.findFirst({
        where: { id, id_usuario },
        include: {
          estados_comercios: true,
        },
      });

      if (!comercio) throw new NotFoundException('Comercio no encontrado');

      return comercio;
    } catch (error) {}
  }

  async buscarComercios(query: any) {
    try {
      const comercios = await this.prismaService.comercio.findMany({
        select: {
          id: true,
          razon_social: true,
          ruc: true,
          estado: true,
        },
        where: {
          OR: [
            { razon_social: { contains: query.razon_social } },
            { ruc: { contains: query.ruc } },
          ],
        },
      });
      return comercios;
    } catch (error) {
      throw error;
    }
  }

  async getComerciosByMany(query: QueryManyComercios) {
    try {
      const whereClausule: any = {};
      let sql = sqlListadoComercios;

      sql += ' WHERE c.activo = true ';

      if (query.ruc) {
        sql += ' AND c.ruc = $(ruc) ';
        whereClausule.ruc = query.ruc;
      }

      if (query.razon_social) {
        sql += ' AND c.razon_social ILIKE $(razon_social) ';
        whereClausule.razon_social = `%${query.razon_social}%`;
      }

      if (query.id_estado_comercio) {
        sql += ' AND c.estado = $(id_estado_comercio) ';
        whereClausule.id_estado_comercio = query.id_estado_comercio;
      }
      const comercios = await this.databasePromiseService.result(
        sql,
        whereClausule,
      );
      return comercios.rows;
    } catch (error) {
      throw error;
    }
  }
}
