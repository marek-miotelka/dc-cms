import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly code?: string,
    public readonly details?: Record<string, any>,
  ) {
    super(
      {
        statusCode: status,
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}
