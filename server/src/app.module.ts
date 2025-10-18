import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { ComerciosModule } from './comercios/comercios.module';
import { FirebaseModule } from './firebase/firebase.module';
import { FirebaseAuthGuard } from './auth/guards/firebase-auth.guard';
import { VerificacionComercioModule } from './verificacion-comercio/verificacion-comercio.module';
import { CotizacionEmpresaModule } from './cotizacion-empresa/cotizacion-empresa.module';
import { MonedasModule } from './monedas/monedas.module';
import { PlanesModule } from './planes/planes.module';
import { PagoSuscripcionesModule } from './pago-suscripciones/pago-suscripciones.module';
import { FacturasSuscripcionesModule } from './facturas-suscripciones/facturas-suscripciones.module';
import { MetodosPagoModule } from './metodos-pago/metodos-pago.module';
import { EntidadesBancariasModule } from './entidades-bancarias/entidades-bancarias.module';
import { DatabaseModule } from './database/database.module';
import { VerificacionCuentaModule } from './verificacion-cuenta/verificacion-cuenta.module';
import { GroupsGuard } from './auth/guards/groups.guard';
import { ParticipantesModule } from './participantes/participantes.module';
import { ParticipacionEmpresaModule } from './participacion-empresa/participacion-empresa.module';
import { WinstonModule } from 'nest-winston';
import { winstonOptions } from './logger/logger.config';
import { RecordatoriosModule } from './recordatorios/recordatorios.module';
import { EmailModule } from './email/email.module';
import { SemaforoFinancieroModule } from './semaforo_financiero/semaforo_financiero.module';
import { EstadosAnimosModule } from './estados-animos/estados-animos.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
     WinstonModule.forRoot(winstonOptions),
    UsuariosModule,
    AuthModule,
    PrismaModule,
    ComerciosModule,
    FirebaseModule,
    VerificacionComercioModule,
    CotizacionEmpresaModule,
    MonedasModule,
    PlanesModule,
    PagoSuscripcionesModule,
    FacturasSuscripcionesModule,
    MetodosPagoModule,
    EntidadesBancariasModule,
    DatabaseModule,
    VerificacionCuentaModule,
    ParticipantesModule,
    ParticipacionEmpresaModule,
    RecordatoriosModule,
    EmailModule,
    SemaforoFinancieroModule,
    EstadosAnimosModule,
    TicketsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: GroupsGuard,
    },
  ]
})
export class AppModule {}
