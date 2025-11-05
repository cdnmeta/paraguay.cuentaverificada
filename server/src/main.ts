import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { ENTORNO, PRODUCCION, URL_BASE, URL_ORIGINS } from '@/utils/constants';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

  // Usa winston como logger de Nest
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Configuraciones de middleware
  // Permite confiar en proxies como Nginx (esto es lo importante)
  app.set('trust proxy', 'loopback');

  

  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.enableCors({
    origin: URL_ORIGINS,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // <-- Esto permite que los string 'false', '0', etc. se conviertan automáticamente
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        console.log("error validacion", errors[0])
        const constraints = firstError?.constraints;
        const firstMessage = constraints
          ? Object.values(constraints)[0]
          : 'Error de validación';
        return new BadRequestException(firstMessage);
      },
    }),
  );
  

  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Iniciando servidor en modo ${ENTORNO}`);
}
bootstrap();
