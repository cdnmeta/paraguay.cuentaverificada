import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  imports: [PrismaModule, FirebaseModule, DatabaseModule],
  exports: [UsuariosService],
})
export class UsuariosModule {}
