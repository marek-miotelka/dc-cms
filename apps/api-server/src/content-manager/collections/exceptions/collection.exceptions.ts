import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@api-server/common/exceptions/base.exception';

export class CollectionAlreadyExistsException extends BaseException {
  constructor(slug: string) {
    super(
      `Collection with slug "${slug}" already exists`,
      HttpStatus.CONFLICT,
      'COLLECTION_EXISTS',
      { slug },
    );
  }
}

export class CollectionNotFoundException extends BaseException {
  constructor(identifier: string) {
    super(
      `Collection "${identifier}" not found`,
      HttpStatus.NOT_FOUND,
      'COLLECTION_NOT_FOUND',
      { identifier },
    );
  }
}

export class CollectionRecordNotFoundException extends BaseException {
  constructor(documentId: string, collectionSlug: string) {
    super(
      `Record "${documentId}" not found in collection "${collectionSlug}"`,
      HttpStatus.NOT_FOUND,
      'COLLECTION_RECORD_NOT_FOUND',
      { documentId, collectionSlug },
    );
  }
}

export class CollectionFieldValidationException extends BaseException {
  constructor(message: string, details?: Record<string, any>) {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      'COLLECTION_FIELD_VALIDATION',
      details,
    );
  }
}

export class DuplicateFieldValueException extends BaseException {
  constructor(fieldName: string, value: any) {
    super(
      `Value for field "${fieldName}" already exists`,
      HttpStatus.CONFLICT,
      'DUPLICATE_FIELD_VALUE',
      { fieldName, value },
    );
  }
}

export class CollectionOperationException extends BaseException {
  constructor(operation: string, error: Error) {
    super(
      `Collection operation failed: ${operation}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'COLLECTION_OPERATION_ERROR',
      {
        operation,
        originalError: error.message,
      },
    );
  }
}
