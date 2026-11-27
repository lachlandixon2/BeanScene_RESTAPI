import type { Request, Response } from 'express';
import {
  type CreateMenuItemInput,
  createMenuItem,
  deleteMenuItem,
  getMenuItem,
  listMenuItems,
  updateMenuItem,
  type UpdateMenuItemInput,
} from '../services/menuItems.js';
import { objectIdSchema, parseWithSchema } from '../validators/common.js';
import { listMenuItemsQuerySchema } from '../validators/menuItems.js';
import {
  createMenuItemSchema,
  patchMenuItemSchema,
  replaceMenuItemSchema,
} from '../validators/menuItemMutations.js';
import type { z } from 'zod';
import type { MenuItemTags } from '../models/MenuItem.js';

type ParsedCreateMenuItem = z.infer<typeof createMenuItemSchema>;
type ParsedMenuItemUpdate = z.infer<typeof patchMenuItemSchema>;

function toMenuItemTags(input: { tags: string[]; notes?: string | undefined }): MenuItemTags {
  return {
    tags: input.tags,
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  };
}

function toCreateMenuItemInput(input: ParsedCreateMenuItem): CreateMenuItemInput {
  return {
    name: input.name,
    price: input.price,
    category: input.category,
    availability: input.availability,
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.photoUrl !== undefined ? { photoUrl: input.photoUrl } : {}),
    ...(input.allergens !== undefined ? { allergens: toMenuItemTags(input.allergens) } : {}),
    ...(input.dietaryRequirements !== undefined
      ? { dietaryRequirements: toMenuItemTags(input.dietaryRequirements) }
      : {}),
  };
}

function getMenuItemId(request: Request): string {
  return parseWithSchema(objectIdSchema, request.params.id);
}

function toUpdateMenuItemInput(input: ParsedMenuItemUpdate): UpdateMenuItemInput {
  const updates: UpdateMenuItemInput = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;
  if (input.price !== undefined) updates.price = input.price;
  if (input.category !== undefined) updates.category = input.category;
  if (input.photoUrl !== undefined) updates.photoUrl = input.photoUrl;
  if (input.allergens !== undefined) updates.allergens = toMenuItemTags(input.allergens);
  if (input.dietaryRequirements !== undefined) {
    updates.dietaryRequirements = toMenuItemTags(input.dietaryRequirements);
  }
  if (input.availability !== undefined) updates.availability = input.availability;
  return updates;
}

export async function listMenuItemsController(
  request: Request,
  response: Response,
): Promise<void> {
  const query = parseWithSchema(listMenuItemsQuerySchema, request.query);
  const result = await listMenuItems(query);

  response.status(200).json({
    success: true,
    message: 'Menu items retrieved successfully',
    data: {
      menuItems: result.menuItems,
      pagination: result.pagination,
    },
  });
}

export async function createMenuItemController(
  request: Request,
  response: Response,
): Promise<void> {
  const input = parseWithSchema(createMenuItemSchema, request.body);
  const menuItem = await createMenuItem(toCreateMenuItemInput(input));

  response.status(201).json({
    success: true,
    message: 'Menu item created successfully',
    data: menuItem,
  });
}

export async function getMenuItemController(
  request: Request,
  response: Response,
): Promise<void> {
  const menuItem = await getMenuItem(getMenuItemId(request));

  response.status(200).json({
    success: true,
    message: 'Menu item retrieved successfully',
    data: menuItem,
  });
}

export async function replaceMenuItemController(
  request: Request,
  response: Response,
): Promise<void> {
  const input = toUpdateMenuItemInput(parseWithSchema(replaceMenuItemSchema, request.body));
  const menuItem = await updateMenuItem(getMenuItemId(request), input, true);

  response.status(200).json({
    success: true,
    message: 'Menu item updated successfully',
    data: menuItem,
  });
}

export async function patchMenuItemController(
  request: Request,
  response: Response,
): Promise<void> {
  const input = toUpdateMenuItemInput(parseWithSchema(patchMenuItemSchema, request.body));
  const menuItem = await updateMenuItem(getMenuItemId(request), input);

  response.status(200).json({
    success: true,
    message: 'Menu item updated successfully',
    data: menuItem,
  });
}

export async function deleteMenuItemController(
  request: Request,
  response: Response,
): Promise<void> {
  await deleteMenuItem(getMenuItemId(request));

  response.status(200).json({
    success: true,
    message: 'Menu item deleted successfully',
    data: {},
  });
}
