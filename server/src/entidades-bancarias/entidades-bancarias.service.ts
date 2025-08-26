import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EntidadesBancariasService {
  constructor(private readonly prismaService: PrismaService) {}

  async getEntidadesBancarias() {
    try {
        return this.prismaService.entidades_bancarias.findMany({
      select: {
        id: true,
        nombre: true,
        // Agrega aquí los campos que necesites
      },
      where: { activo: true },
    });
    } catch (error) {
        throw error
    }
  }
}
