import { z } from 'zod';
import { objectIdSchema, paginationSchema } from './common.js';

export const listMenuItemsQuerySchema = paginationSchema
  .extend({
    search: z.string().trim().min(1).optional(),
    category: objectIdSchema.optional(),
    dietary: z.string().trim().min(1).optional(),
    allergen: z.string().trim().min(1).optional(),
    availability: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
    sortBy: z.enum(['name', 'price', 'category']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  })
  .strict();

export type ListMenuItemsQuery = z.infer<typeof listMenuItemsQuerySchema>;
