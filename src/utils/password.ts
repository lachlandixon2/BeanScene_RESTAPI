import bcrypt from 'bcryptjs';
import { ValidationError } from './httpErrors.js';

export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(password: string): void {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (!/[A-Za-z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (errors.length > 0) {
    throw new ValidationError('Invalid password', errors.map((message) => ({ message })));
  }
}

export function isValidPassword(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export async function hashPassword(password: string): Promise<string> {
  validatePassword(password);
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
