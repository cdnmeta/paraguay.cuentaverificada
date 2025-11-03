import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TipoEstadosService {
    constructor(private readonly prismaService: PrismaService) {}

    async getDataTipoEstados() {
        try {
            const tiposEstados = await this.prismaService.tipo_estado_animo.findMany({
                where: {
                    activo: true,
                },
            });
            return tiposEstados;
        } catch (error) {
            throw error;
        }
    }
}
