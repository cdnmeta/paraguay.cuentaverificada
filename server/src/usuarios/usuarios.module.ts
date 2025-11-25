import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { DatabaseModule } from '@/database/database.module';
import { VendedoresController } from './vendedores-empresa/vendedores-empresa.controller';
import { VendedoresEmpresaService } from './vendedores-empresa/vendedores-empresa.service';
import { FavoritosService } from './favoritos/favoritos.service';
import { SoporteService } from './soporte/soporte.service';
import { NotificacionesModule } from '@/notificaciones/notificaciones.module';


@Module({
  controllers: [UsuariosController, VendedoresController],
  providers: [UsuariosService, VendedoresEmpresaService, FavoritosService, SoporteService],
  imports: [PrismaModule, FirebaseModule, DatabaseModule, NotificacionesModule ],
  exports: [UsuariosService],
})
export class UsuariosModule {}
