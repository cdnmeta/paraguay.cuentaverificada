import { Module, forwardRef } from '@nestjs/common';
import { VerificacionCuentaService } from './verificacion-cuenta.service';
import { VerificacionCuentaController } from './verificacion-cuenta.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { DatabaseModule } from '@/database/database.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { AuthModule } from '@/auth/auth.module';
import { EmailModule } from '@/email/email.module';

@Module({
  controllers: [VerificacionCuentaController],
  providers: [VerificacionCuentaService],
  imports: [PrismaModule, DatabaseModule, FirebaseModule, forwardRef(() => AuthModule), EmailModule],
  exports: [VerificacionCuentaService],
})
export class VerificacionCuentaModule {}
