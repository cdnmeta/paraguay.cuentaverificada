import { Module } from '@nestjs/common';
import { ComerciosService } from './comercios.service';
import { ComerciosController } from './comercios.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  controllers: [ComerciosController],
  providers: [ComerciosService],
  imports: [PrismaModule,FirebaseModule,DatabaseModule],
})
export class ComerciosModule {}
