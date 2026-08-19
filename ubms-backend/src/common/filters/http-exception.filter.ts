import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Serverda kutilmagan xatolik yuz berdi';
    let field: string | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = Array.isArray(res.message) ? res.message.join(', ') : res.message || res.error || message;
        code = res.code || HttpStatus[status] || 'ERROR';
        field = res.field;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Capture 500 Server Errors in Sentry APM
    if (status >= 500) {
      this.logger.error(`[500 Error] ${request?.method} ${request?.url}: ${message}`, exception instanceof Error ? exception.stack : '');
      try {
        Sentry.captureException(exception, {
          extra: {
            url: request?.url,
            method: request?.method,
            ip: request?.ip,
            body: request?.body,
          },
        });
      } catch (sentryErr) {
        // Sentry failure should never crash the request flow
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: {
        code,
        message,
        ...(field ? { field } : {}),
      },
    });
  }
}
