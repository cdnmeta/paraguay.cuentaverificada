import { Module } from '@nestjs/common';
import { MetodosPagoService } from './metodos-pago.service';
import { MetodosPagoController } from './metodos-pago.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  controllers: [MetodosPagoController],
  providers: [MetodosPagoService],
  imports:[PrismaModule]
})
export class MetodosPagoModule {}
