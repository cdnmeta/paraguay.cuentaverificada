import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { StrategyRegistry } from './strategies/strategy-registry';
import { FcmStrategy } from './strategies/fcm.strategy';
import { INotificationStrategy } from './strategies/notification.strategy';
import { NotificacionesController } from './notificaciones.controller';
import { FirebaseModule } from '@/firebase/firebase.module';
import { EmailModule } from '@/email/email.module';
import { EmailStrategy } from './strategies/email.strategy';
import { DatabaseModule } from '@/database/database.module';


@Module({
  providers: [
    NotificacionesService,
    FcmStrategy,
    EmailStrategy,
    {
      provide: StrategyRegistry,
      useFactory: (fcmStrategy: FcmStrategy,emailStrategy: EmailStrategy) => {
        const strategies: INotificationStrategy[] = [fcmStrategy,emailStrategy];
        return new StrategyRegistry(strategies);},
      inject: [FcmStrategy,EmailStrategy],
    },


  ],
  exports: [NotificacionesService],
  imports: [PrismaModule,FirebaseModule,EmailModule,DatabaseModule],
  controllers: [NotificacionesController],
})
export class NotificacionesModule {}
