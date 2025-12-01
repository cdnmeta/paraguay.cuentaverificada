import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { PlanesTipoRepartir } from "../types/planes-tipo-repartir";

@Injectable()
export class PlanesTiposRepartirService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async getPlanesTiposRepartir() {
    try {
      const tiposRepartir = await this.prismaService.planes_tipo_repartir.findMany({
        select: {
            id: true,
            descripcion: true,
        },
        where: {
          activo: true,
        },
        orderBy: {
          id: 'asc',
        },
      });
      return tiposRepartir;
    } catch (error) {
      throw error;
    }
  }

}