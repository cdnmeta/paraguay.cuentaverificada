import { Module } from '@nestjs/common';
import { EntidadesBancariasService } from './entidades-bancarias.service';
import { EntidadesBancariasController } from './entidades-bancarias.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  controllers: [EntidadesBancariasController],
  providers: [EntidadesBancariasService],
  imports: [PrismaModule,DatabaseModule]
})
export class EntidadesBancariasModule {}
