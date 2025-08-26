import { Module } from '@nestjs/common';
import { MonedasService } from './monedas.service';
import { MonedasController } from './monedas.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  controllers: [MonedasController],
  providers: [MonedasService],
  imports: [PrismaModule], // Add any necessary modules here, e.g., PrismaModule, DatabaseModule
})
export class MonedasModule {}
