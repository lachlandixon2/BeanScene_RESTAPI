import { env } from '../config/env.js';
import { Staff } from '../models/Staff.js';
import { hashPassword } from '../utils/password.js';

export async function seedInitialManager(): Promise<void> {
  const email = env.initialManagerEmail.trim().toLowerCase();
  const existingStaff = await Staff.exists({ email });

  if (existingStaff) {
    console.info('An account with the initial manager email already exists; skipping seed.');
    return;
  }

  const passwordHash = await hashPassword(env.initialManagerPassword);
  await Staff.create({
    name: env.initialManagerName,
    email,
    passwordHash,
    role: 'manager',
  });

  console.info('Initial manager account created.');
}
