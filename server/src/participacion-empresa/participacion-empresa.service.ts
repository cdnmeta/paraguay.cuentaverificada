import { DatabasePromiseService } from '@/database/database-promise.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ParticipacionEmpresaService {
    constructor(private prisma: PrismaService,private dbPromiseService: DatabasePromiseService) {}
    async getMetaInformation() {
        try {
            const metaInformation = await this.prisma.participacion_empresa.findFirst({
                select:{
                    nombre_meta: true,
                    precio_meta: true,
                    saldo_participacion: true,
                    total_participacion: true,
                    total_vendido: true,
                },
                where: {
                   id: 1
                }
            });
            
            if (!metaInformation) {
                return {
                    nombre_meta: '',
                    precio_meta: 0,
                    saldo_participacion: 0,
                    total_participacion: 0,
                    total_vendido: 0,
                };
            }
            
            // Transformar valores null/undefined a valores por defecto
            return {
                nombre_meta: metaInformation.nombre_meta || '',
                precio_meta: Number(metaInformation.precio_meta) || 0,
                saldo_participacion: Number(metaInformation.saldo_participacion) || 0,
                total_participacion: Number(metaInformation.total_participacion) || 0,
                total_vendido: Number(metaInformation.total_vendido) || 0,
            };
        } catch (error) {
            throw error
        }
    }
}
