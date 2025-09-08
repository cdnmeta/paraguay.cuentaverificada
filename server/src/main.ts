import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { URL_BASE, URL_ORIGINS } from '@/utils/constants';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as bodyParser from 'body-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
        const constraints = firstError?.constraints;
        const firstMessage = constraints
          ? Object.values(constraints)[0]
          : 'Error de validación';
        return new BadRequestException(firstMessage);
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
