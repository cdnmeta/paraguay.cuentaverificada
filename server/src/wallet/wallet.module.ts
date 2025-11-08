import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { SolicitudesRecargaService } from './solicitudes-recarga/solicitudes-recarga.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, SolicitudesRecargaService],
  imports: [PrismaModule,FirebaseModule],
})
export class WalletModule {}
