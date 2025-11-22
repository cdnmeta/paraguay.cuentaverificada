import { Module } from '@nestjs/common';
import { RecordatoriosService } from './recordatorios.service';
import { RecordatoriosController } from './recordatorios.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [PrismaModule, FirebaseModule,DatabaseModule],
  controllers: [RecordatoriosController],
  providers: [RecordatoriosService],
  exports: [RecordatoriosService],
})
export class RecordatoriosModule {}
