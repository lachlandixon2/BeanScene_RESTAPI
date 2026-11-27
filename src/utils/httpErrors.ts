import type { ApiError } from '../types/http.js';

export class HttpError extends Error {
  readonly statusCode: number;
  readonly errors: ApiError[];

  constructor(statusCode: number, message: string, errors: ApiError[] = []) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, errors: ApiError[] = []) {
    super(400, message, errors);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}
