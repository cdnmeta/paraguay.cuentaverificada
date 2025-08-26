import { DatabaseService } from '@/database/database.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { consultaSelectFacturaInfoPago } from './sql/consultas';

@Injectable()
export class FacturasSuscripcionesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly databaseService: DatabaseService, // Assuming you have a DatabaseService for additional database operations
  ) {}

  async getInfoPago(id: number) {
    try {
      const factura = this.prismaService.factura_suscripciones.findFirst({
        where: { id, activo: true },
      });

      if (!factura) {
        throw new NotFoundException('Factura no encontrada');
      }

      const resultfacturainfo = await this.databaseService.query(
        consultaSelectFacturaInfoPago,
        [id],
      );

      if (resultfacturainfo.rows.length === 0) {
        throw new NotFoundException('Información de pago no encontrada');
      }

      return resultfacturainfo.rows[0];
    } catch (error) {
      throw error;
    }
  }
}
