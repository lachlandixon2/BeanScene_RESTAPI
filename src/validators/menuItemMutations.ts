import { z } from 'zod';
import { objectIdSchema } from './common.js';

const menuItemTagsSchema = z
  .object({
    tags: z.array(z.string().trim().min(1)).default([]),
    notes: z.string().trim().optional(),
  })
  .strict();

const menuItemFields = {
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.number().finite().min(0),
  category: objectIdSchema,
  photoUrl: z.string().trim().url(),
  allergens: menuItemTagsSchema,
  dietaryRequirements: menuItemTagsSchema,
  availability: z.boolean(),
};

export const createMenuItemSchema = z
  .object({
    name: menuItemFields.name,
    description: menuItemFields.description.optional(),
    price: menuItemFields.price,
    category: menuItemFields.category,
    photoUrl: menuItemFields.photoUrl.optional(),
    allergens: menuItemFields.allergens.optional(),
    dietaryRequirements: menuItemFields.dietaryRequirements.optional(),
    availability: menuItemFields.availability,
  })
  .strict();

export const replaceMenuItemSchema = z
  .object({
    name: menuItemFields.name,
    description: menuItemFields.description.optional(),
    price: menuItemFields.price,
    category: menuItemFields.category,
    photoUrl: menuItemFields.photoUrl.optional(),
    allergens: menuItemFields.allergens.optional(),
    dietaryRequirements: menuItemFields.dietaryRequirements.optional(),
    availability: menuItemFields.availability,
  })
  .strict();

export const patchMenuItemSchema = z
  .object({
    name: menuItemFields.name.optional(),
    description: menuItemFields.description.nullable().optional(),
    price: menuItemFields.price.optional(),
    category: menuItemFields.category.optional(),
    photoUrl: menuItemFields.photoUrl.nullable().optional(),
    allergens: menuItemFields.allergens.optional(),
    dietaryRequirements: menuItemFields.dietaryRequirements.optional(),
    availability: menuItemFields.availability.optional(),
  })
  .strict()
  .refine((menuItem) => Object.keys(menuItem).length > 0, {
    message: 'At least one menu item field must be provided',
  });
