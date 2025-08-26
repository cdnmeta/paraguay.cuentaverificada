import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetodosPagoService {
    constructor(private readonly prismaService: PrismaService) {}

    async getMetodosPago() {
        try {
            const metodosPago = await this.prismaService.metodo_pagos.findMany({
                select: {
                    id: true,
                    descripcion: true,
                    cod_set: true,
                },
                where: {
                    activo: true
                }
            });
            return metodosPago;
        } catch (error) {
            throw error;
        }
    }
}
