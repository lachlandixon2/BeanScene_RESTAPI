import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpErrors.js';

export function requireManager(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  if (!request.authenticatedStaff) {
    next(new HttpError(401, 'Authentication required'));
    return;
  }

  if (request.authenticatedStaff.role !== 'manager') {
    next(new HttpError(403, 'Manager privileges required'));
    return;
  }

  next();
}
