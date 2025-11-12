import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { SolicitudesRecargaService } from './solicitudes-recarga/solicitudes-recarga.service';
import { DatabaseModule } from '@/database/database.module';
import { Auth } from 'firebase-admin/lib/auth/auth';
import { AuthModule } from '@/auth/auth.module';

@Module({
  controllers: [WalletController],
  providers: [WalletService, SolicitudesRecargaService],
  imports: [PrismaModule,FirebaseModule,DatabaseModule,AuthModule],
})
export class WalletModule {}
