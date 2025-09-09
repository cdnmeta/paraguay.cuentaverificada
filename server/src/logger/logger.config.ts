import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

export const winstonOptions: WinstonModuleOptions = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  // Transports (consola color + archivos rotativos)
  transports: [
    // Consola con colores y stacktrace
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: combine(
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        colorize({ all: true }),
        printf(({ level, message, timestamp, context, stack }) => {
          const base = `${timestamp} [${context ?? 'App'}] ${level}: ${message}`;
          return stack ? `${base}\n${stack}` : base;
        }),
      ),
    }),

    // Archivo de aplicación (info+)
    new (winston.transports as any).DailyRotateFile({
      level: 'info',
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '14d',
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),

    // Archivo de errores (error)
    new (winston.transports as any).DailyRotateFile({
      level: 'error',
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '30d',
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
  ],

  // Manejo de excepciones no controladas / promesas rechazadas
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
};
