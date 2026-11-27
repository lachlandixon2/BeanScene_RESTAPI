import { z } from 'zod';

const categoryFields = {
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
};

export const createCategorySchema = z
  .object({
    name: categoryFields.name,
    description: categoryFields.description,
  })
  .strict();

export const replaceCategorySchema = z
  .object({
    name: categoryFields.name,
    description: categoryFields.description,
  })
  .strict();

export const patchCategorySchema = z
  .object({
    name: categoryFields.name.optional(),
    description: categoryFields.description,
  })
  .strict()
  .refine((category) => Object.keys(category).length > 0, {
    message: 'At least one category field must be provided',
  });
