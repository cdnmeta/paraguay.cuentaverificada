import { DatabasePromiseService } from '@/database/database-promise.service';
import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FavoritosService {
    constructor(private readonly prismaService: PrismaService, private readonly dbPromise: DatabasePromiseService) {}

    async agregarFavorito(usuarioId: number, comercioId: number) {
        try {

            const favExiste = await this.prismaService.usuarios_comercios_fav.findFirst({
                where: {
                    id_usuario: usuarioId,
                    id_comercio: comercioId,
                },
            });

            if (favExiste) {
                throw new BadRequestException('El comercio ya está en favoritos.');
            }

            return await this.prismaService.usuarios_comercios_fav.create({
                data: {
                    id_usuario: usuarioId,
                    id_comercio: comercioId,
                },
            });
        } catch (error) {
            throw error;
        }
    }

    async eliminarFavorito(usuarioId: number, comercioId: number) {
        try {
            const favExiste = await this.prismaService.usuarios_comercios_fav.findFirst({
                where: {
                    id_usuario: usuarioId,
                    id_comercio: comercioId,
                },
            });

            if (!favExiste) {
                throw new NotFoundException('El comercio no está en favoritos.');
            }

            return await this.prismaService.usuarios_comercios_fav.delete({
                where: {
                    idx_usuario_comercio_fav: {
                        id_usuario: usuarioId,
                        id_comercio: comercioId,
                    },
                },
            });
        } catch (error) {
            throw error;
        }
    }

    async obtenerFavoritosPorUsuario(id_usuario: number) {
    try {
      const favoritos = `WITH
        COMERCIOS_FAVORITOS AS (
          SELECT
            COM.ID,
            COM.RAZON_SOCIAL AS DESCRIPCION,
            USFAV.FECHA_CREACION,
            USFAV.ID_USUARIO,
            1 AS TIPO,
            'comercio' AS TIPO_DESCRIPCION
          FROM
            COMERCIO COM
            JOIN USUARIOS_COMERCIOS_FAV USFAV ON USFAV.ID_COMERCIO = COM.ID
          WHERE
            COM.ACTIVO = TRUE
        ),
        FAVORITOS AS (
          SELECT
            *
          FROM
            COMERCIOS_FAVORITOS
        )
      SELECT
        FAV.ID,
        FAV.DESCRIPCION,
        FAV.FECHA_CREACION,
        FAV.TIPO,
        FAV.ID_USUARIO,
        FAV.TIPO_DESCRIPCION
      FROM
        FAVORITOS FAV
      WHERE
        FAV.ID_USUARIO = $1`
      const result = await this.dbPromise.result(favoritos, [id_usuario]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}
