import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SemaforoFinancieroService } from '@/semaforo_financiero/semaforo_financiero.service';
import { AppModule } from '@/app.module';

async function main() {
  // Crear contexto para usar el logger de la app (Winston)
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // cargar el service de SemaforoFinanciero
  const semaforo = app.get(SemaforoFinancieroService);

  try {
    logger.log('Iniciando registro de movimientos fijos del mes anterior...');
    //await semaforo.registrarFijosMensuales();
  } catch (error) {
    logger.error('Error al registrar movimientos fijos del mes anterior', error);
  }


}

main();
