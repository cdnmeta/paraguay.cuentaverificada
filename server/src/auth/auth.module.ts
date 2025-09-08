import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '@/database/database.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { VerificacionCuentaModule } from '@/verificacion-cuenta/verificacion-cuenta.module';

@Module({
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    FirebaseModule,
    PrismaModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        global: true,
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
    UsuariosModule,
    forwardRef(() => VerificacionCuentaModule),
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
