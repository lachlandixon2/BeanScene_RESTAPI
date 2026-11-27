import { Staff } from '../models/Staff.js';
import { comparePassword } from '../utils/password.js';
import { signJwtToken } from '../utils/jwt.js';
import type { LoginCredentials } from '../validators/auth.js';
import { env } from '../config/env.js';

export async function login(credentials: LoginCredentials): Promise<{
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  staff: {
    id: string;
    name: string;
    email: string;
    role: 'staff' | 'manager';
  };
} | null> {
  const staff = await Staff.findOne({ email: credentials.email }).select('+passwordHash');

  if (!staff || !(await comparePassword(credentials.password, staff.passwordHash))) {
    return null;
  }

  return {
    accessToken: signJwtToken({ staffId: staff.id, role: staff.role }),
    tokenType: 'Bearer',
    expiresIn: env.jwtExpiresIn,
    staff: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
    },
  };
}
