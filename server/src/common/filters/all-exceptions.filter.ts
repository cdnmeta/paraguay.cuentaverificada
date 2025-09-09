import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let context = req.route?.path || req.url;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as any)?.message || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 4xx -> warn | 5xx -> error
    if (status >= 500) {
      this.logger.error(
        `${req.method} ${req.url} -> ${status} ${message}`,
        (exception as any)?.stack,
        context,
      );
    } else {
      this.logger.warn(
        `${req.method} ${req.url} -> ${status} ${message}`,
        context,
      );
    }

    // Respuesta uniforme
    res.status(status).json({
      statusCode: status,
      message,
    });
  }
}
