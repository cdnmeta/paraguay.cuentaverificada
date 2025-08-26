import { Module } from '@nestjs/common';
import { CotizacionEmpresaService } from './cotizacion-empresa.service';
import { CotizacionEmpresaController } from './cotizacion-empresa.controller';
import { DatabaseModule } from '@/database/database.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  controllers: [CotizacionEmpresaController],
  providers: [CotizacionEmpresaService],
  exports:[CotizacionEmpresaService],
  imports: [DatabaseModule, PrismaModule],
})
export class CotizacionEmpresaModule {}
