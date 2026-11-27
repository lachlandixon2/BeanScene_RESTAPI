import { z } from 'zod';

const staffFields = {
  name: z.string().trim().min(1),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string(),
  role: z.enum(['staff', 'manager']),
};

export const createStaffSchema = z
  .object({
    name: staffFields.name,
    email: staffFields.email,
    password: staffFields.password,
    role: staffFields.role.optional(),
  })
  .strict();

export const replaceStaffSchema = z
  .object({
    name: staffFields.name,
    email: staffFields.email,
    password: staffFields.password.optional(),
    role: staffFields.role,
  })
  .strict();

export const patchStaffSchema = z
  .object({
    name: staffFields.name.optional(),
    email: staffFields.email.optional(),
    password: staffFields.password.optional(),
    role: staffFields.role.optional(),
  })
  .strict()
  .refine((staff) => Object.keys(staff).length > 0, {
    message: 'At least one staff field must be provided',
  });
