import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlanesService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.planes.findMany({
            select:{
                nombre: true,
                precio: true,
                id: true,
                renovacion_plan: true,
                renovacion_valor: true,
                tipo_iva: true,
                descripcion: true
            }
        });
    }
}
