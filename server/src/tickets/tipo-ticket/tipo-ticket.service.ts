import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TipoTicketService {
    constructor(
        private readonly prismaService: PrismaService
    ) {}
    async getTiposTickets() {
        try {
            const tipos = await this.prismaService.tipo_ticket.findMany();
            return tipos;
        } catch (error) {
            throw error;
        }
    }
}
