import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MonedasService {
    constructor(private readonly prismaService: PrismaService) {}

    async getMonedas(){
        try {
            const monedas = await this.prismaService.monedas.findMany({
                select:{
                    id: true,
                    nombre: true,
                    sigla_iso: true,
                    simbolo: true
                },
                where: {
                    activo: true
                }
            })
            return monedas;
        } catch (error) {
            throw error
        }
    }
}
