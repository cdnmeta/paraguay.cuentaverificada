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
import { QueryForUsers } from './dto/query-comercios-users.dto';
import {
  cursorPaginatePrisma,
  getTakeCursorForPrisma,
} from '@/herper/paguinationPrisma';
import { DatabaseService } from '@/database/database.service';
import { sqlListadoComerciosPendientes } from './sql/consultas';
import * as path from 'path';

interface FileSolicitudVerificacion {
  comprobantePago: Express.Multer.File;
}

@Injectable()
export class ComerciosService {
  constructor(
    private readonly prismaService: PrismaService, // Assuming PrismaService is injected for database operations
    private readonly firebaseService: FirebaseService, // Assuming FirebaseService is injected for file storage

    private readonly dbService: DatabaseService, // Assuming DatabaseService is injected for database transactions
  ) {}

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
        select:{
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
}
