import { Controller, Get } from '@nestjs/common';
import { MetodosPagoService } from './metodos-pago.service';
import { PrismaService } from '@/prisma/prisma.service';

@Controller('metodos-pago')
export class MetodosPagoController {
  constructor(
    private readonly metodosPagoService: MetodosPagoService,
    private prismaService: PrismaService,
  ) {}

  @Get()
  async getMetodosPago() {
    return this.metodosPagoService.getMetodosPago();
  }
}
