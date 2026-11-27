import jwt from 'jsonwebtoken';
import type {
  JwtPayload as JsonWebTokenPayload,
  SignOptions,
} from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { StaffRole } from '../models/Staff.js';

export interface AccessTokenPayload extends JsonWebTokenPayload {
  staffId: string;
  role: StaffRole;
}

export function signJwtToken(payload: Omit<AccessTokenPayload, keyof JsonWebTokenPayload>): string {
  const options = {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions;

  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyJwtToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (
    typeof decoded === 'string' ||
    typeof decoded.staffId !== 'string' ||
    (decoded.role !== 'staff' && decoded.role !== 'manager')
  ) {
    throw new jwt.JsonWebTokenError('Invalid JWT payload');
  }

  return decoded as AccessTokenPayload;
}
