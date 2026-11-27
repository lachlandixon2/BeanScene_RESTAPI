import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpErrors.js';

export function notFoundHandler(request: Request, response: Response): void {
  response.status(404).json({
    success: false,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
    errors: [],
  });
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  if (
    error instanceof SyntaxError &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  ) {
    response.status(400).json({
      success: false,
      message: 'Invalid JSON request body',
      errors: [],
    });
    return;
  }

  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    response.status(409).json({
      success: false,
      message: 'Duplicate resource',
      errors: [],
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    success: false,
    message: env.nodeEnv === 'production'
      ? 'Unexpected server error'
      : error instanceof Error
        ? error.message
        : 'Unexpected server error',
    errors: [],
  });
}
