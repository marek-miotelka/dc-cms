import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class DatabaseOperationException extends BaseException {
  constructor(operation: string, error: Error) {
    super(
      `Database operation failed: ${operation}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'DATABASE_ERROR',
      {
        operation,
        originalError: error.message,
      },
    );
  }
}

export class RecordNotFoundException extends BaseException {
  constructor(entity: string, identifier: string | number) {
    super(
      `${entity} with identifier "${identifier}" not found`,
      HttpStatus.NOT_FOUND,
      'RECORD_NOT_FOUND',
      { entity, identifier },
    );
  }
}

export class DuplicateRecordException extends BaseException {
  constructor(entity: string, field: string, value: string) {
    super(
      `${entity} with ${field} "${value}" already exists`,
      HttpStatus.CONFLICT,
      'DUPLICATE_RECORD',
      { entity, field, value },
    );
  }
}

export class ValidationException extends BaseException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', details);
  }
}
