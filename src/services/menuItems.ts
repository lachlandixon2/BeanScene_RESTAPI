import {
  createMenuItem as createMenuItemRecord,
  deleteMenuItem as deleteMenuItemRecord,
  findMenuItemById,
  isMenuItemReferencedByOrders,
  listMenuItems as listMenuItemRecords,
  updateMenuItem as updateMenuItemRecord,
  type MenuItemRecord,
  type MenuItemListOptions,
  type MenuItemRepositoryUpdate,
} from '../repositories/menuItems.js';
import { findCategoryById } from '../repositories/categories.js';
import type { MenuItemTags } from '../models/MenuItem.js';
import type { Pagination } from '../types/http.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/httpErrors.js';
import { objectIdSchema, parseWithSchema } from '../validators/common.js';
import type { ListMenuItemsQuery } from '../validators/menuItems.js';

export interface CreateMenuItemInput {
  name: string;
  description?: string;
  price: number;
  category: string;
  photoUrl?: string;
  allergens?: MenuItemTags;
  dietaryRequirements?: MenuItemTags;
  availability: boolean;
}

export interface UpdateMenuItemInput {
  name?: string;
  description?: string | null;
  price?: number;
  category?: string;
  photoUrl?: string | null;
  allergens?: MenuItemTags;
  dietaryRequirements?: MenuItemTags;
  availability?: boolean;
}

export interface PaginatedMenuItems {
  menuItems: MenuItemRecord[];
  pagination: Pagination;
}

function validatePagination(page: number, limit: number): void {
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new ValidationError('Invalid pagination values', [
      { message: 'Page must be a positive integer and limit must be between 1 and 50' },
    ]);
  }
}

async function validateCategory(categoryId: string): Promise<void> {
  parseWithSchema(objectIdSchema, categoryId);
  if (!(await findCategoryById(categoryId))) {
    throw new ValidationError('Invalid menu item category', [
      { field: 'category', message: 'Category does not exist' },
    ]);
  }
}

export async function listMenuItems(query: ListMenuItemsQuery): Promise<PaginatedMenuItems> {
  validatePagination(query.page, query.limit);
  const options: MenuItemListOptions = {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    ...(query.search !== undefined ? { search: query.search } : {}),
    ...(query.category !== undefined ? { category: query.category } : {}),
    ...(query.dietary !== undefined ? { dietary: query.dietary } : {}),
    ...(query.allergen !== undefined ? { allergen: query.allergen } : {}),
    ...(query.availability !== undefined ? { availability: query.availability } : {}),
  };
  const { menuItems, total } = await listMenuItemRecords(options);
  return {
    menuItems,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getMenuItem(menuItemId: string): Promise<MenuItemRecord> {
  parseWithSchema(objectIdSchema, menuItemId);
  const menuItem = await findMenuItemById(menuItemId);
  if (!menuItem) {
    throw new NotFoundError('Menu item not found');
  }
  return menuItem;
}

export async function createMenuItem(input: CreateMenuItemInput): Promise<MenuItemRecord> {
  await validateCategory(input.category);
  return createMenuItemRecord(input);
}

export async function updateMenuItem(
  menuItemId: string,
  input: UpdateMenuItemInput,
  replace = false,
): Promise<MenuItemRecord> {
  parseWithSchema(objectIdSchema, menuItemId);
  if (!(await findMenuItemById(menuItemId))) {
    throw new NotFoundError('Menu item not found');
  }
  if (input.category !== undefined) {
    await validateCategory(input.category);
  }

  const updates: MenuItemRepositoryUpdate = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.price !== undefined) updates.price = input.price;
  if (input.category !== undefined) updates.category = input.category;
  if (input.allergens !== undefined) updates.allergens = input.allergens;
  if (input.dietaryRequirements !== undefined) {
    updates.dietaryRequirements = input.dietaryRequirements;
  }
  if (input.availability !== undefined) updates.availability = input.availability;
  if (input.description !== undefined) updates.description = input.description;
  else if (replace) updates.description = null;
  if (input.photoUrl !== undefined) updates.photoUrl = input.photoUrl;
  else if (replace) updates.photoUrl = null;
  if (replace) {
    if (input.allergens === undefined) updates.allergens = { tags: [] };
    if (input.dietaryRequirements === undefined) updates.dietaryRequirements = { tags: [] };
  }

  if (Object.keys(updates).length === 0) {
    throw new ValidationError('No menu item fields provided for update');
  }

  const updatedMenuItem = await updateMenuItemRecord(menuItemId, updates);
  if (!updatedMenuItem) {
    throw new NotFoundError('Menu item not found');
  }
  return updatedMenuItem;
}

export async function deleteMenuItem(menuItemId: string): Promise<void> {
  parseWithSchema(objectIdSchema, menuItemId);
  if (!(await findMenuItemById(menuItemId))) {
    throw new NotFoundError('Menu item not found');
  }
  if (await isMenuItemReferencedByOrders(menuItemId)) {
    throw new ConflictError('Menu items referenced by orders cannot be deleted');
  }
  if (!(await deleteMenuItemRecord(menuItemId))) {
    throw new NotFoundError('Menu item not found');
  }
}
