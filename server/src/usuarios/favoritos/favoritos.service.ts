import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FavoritosService {
    constructor(private readonly prismaService: PrismaService) {}

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
}
