import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: any = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'object') {
        responseBody = {
          ...responseBody,
          ...response,
          statusCode,
        };
      } else {
        responseBody.message = response;
      }
    } else if (exception instanceof Error) {
      responseBody.message = exception.message;
      responseBody.error = 'Internal Server Error';
    } else {
      responseBody.message = 'An unexpected error occurred';
      responseBody.error = 'Internal Server Error';
    }

    // Log the error
    this.logger.error(
      `Error processing request: ${responseBody.message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // In production, don't send stack traces
    if (process.env.NODE_ENV === 'production') {
      delete responseBody.stack;
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}
