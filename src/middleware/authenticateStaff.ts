import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verifyJwtToken } from '../utils/jwt.js';
import { HttpError } from '../utils/httpErrors.js';

export function authenticateStaff(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const authorization = request.get('authorization');
  const [scheme, token, ...extraParts] = authorization?.trim().split(/\s+/) ?? [];

  if (
    scheme?.toLowerCase() !== 'bearer' ||
    !token ||
    extraParts.length > 0
  ) {
    next(new HttpError(401, 'Authentication required'));
    return;
  }

  try {
    const { staffId, role } = verifyJwtToken(token);
    request.authenticatedStaff = { staffId, role };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new HttpError(401, 'Invalid or expired authentication token'));
      return;
    }

    next(error);
  }
}
