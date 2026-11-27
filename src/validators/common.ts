import { z } from 'zod';
import { ValidationError } from '../utils/httpErrors.js';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB object identifier');

export function parseWithSchema<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ValidationError(
      'Invalid request data',
      result.error.issues.map((issue) => ({
        ...(issue.path.length > 0 ? { field: issue.path.join('.') } : {}),
        message: issue.message,
      })),
    );
  }
  return result.data;
}
