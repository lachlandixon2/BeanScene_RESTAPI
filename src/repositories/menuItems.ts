import type { HydratedDocument } from 'mongoose';
import { MenuItem, type MenuItemDocument, type MenuItemTags } from '../models/MenuItem.js';

export interface MenuItemRecord {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  photoUrl?: string;
  allergens: MenuItemTags;
  dietaryRequirements: MenuItemTags;
  availability: boolean;
}

export interface MenuItemRepositoryUpdate {
  name?: string;
  description?: string | null;
  price?: number;
  category?: string;
  photoUrl?: string | null;
  allergens?: MenuItemTags;
  dietaryRequirements?: MenuItemTags;
  availability?: boolean;
}

function toMenuItemRecord(
  menuItem: HydratedDocument<MenuItemDocument>,
): MenuItemRecord {
  return {
    id: menuItem.id,
    name: menuItem.name,
    ...(menuItem.description !== undefined ? { description: menuItem.description } : {}),
    price: menuItem.price,
    category: menuItem.category.toString(),
    ...(menuItem.photoUrl !== undefined ? { photoUrl: menuItem.photoUrl } : {}),
    allergens: {
      tags: [...menuItem.allergens.tags],
      ...(menuItem.allergens.notes !== undefined ? { notes: menuItem.allergens.notes } : {}),
    },
    dietaryRequirements: {
      tags: [...menuItem.dietaryRequirements.tags],
      ...(menuItem.dietaryRequirements.notes !== undefined
        ? { notes: menuItem.dietaryRequirements.notes }
        : {}),
    },
    availability: menuItem.availability,
  };
}

export async function listMenuItems(
  page: number,
  limit: number,
): Promise<{ menuItems: MenuItemRecord[]; total: number }> {
  const [menuItems, total] = await Promise.all([
    MenuItem.find()
      .sort({ name: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    MenuItem.countDocuments(),
  ]);

  return { menuItems: menuItems.map(toMenuItemRecord), total };
}

export async function findMenuItemById(menuItemId: string): Promise<MenuItemRecord | null> {
  const menuItem = await MenuItem.findById(menuItemId);
  return menuItem ? toMenuItemRecord(menuItem) : null;
}

export async function createMenuItem(data: {
  name: string;
  description?: string;
  price: number;
  category: string;
  photoUrl?: string;
  allergens?: MenuItemTags;
  dietaryRequirements?: MenuItemTags;
  availability: boolean;
}): Promise<MenuItemRecord> {
  const menuItem = await MenuItem.create(data);
  return toMenuItemRecord(menuItem);
}

export async function updateMenuItem(
  menuItemId: string,
  updates: MenuItemRepositoryUpdate,
): Promise<MenuItemRecord | null> {
  const setUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) setUpdates.name = updates.name;
  if (updates.price !== undefined) setUpdates.price = updates.price;
  if (updates.category !== undefined) setUpdates.category = updates.category;
  if (updates.allergens !== undefined) setUpdates.allergens = updates.allergens;
  if (updates.dietaryRequirements !== undefined) {
    setUpdates.dietaryRequirements = updates.dietaryRequirements;
  }
  if (updates.availability !== undefined) setUpdates.availability = updates.availability;
  if (typeof updates.description === 'string') setUpdates.description = updates.description;
  if (typeof updates.photoUrl === 'string') setUpdates.photoUrl = updates.photoUrl;

  const unsetUpdates: Record<string, 1> = {};
  if (updates.description === null) unsetUpdates.description = 1;
  if (updates.photoUrl === null) unsetUpdates.photoUrl = 1;

  const menuItem = await MenuItem.findByIdAndUpdate(
    menuItemId,
    {
      ...(Object.keys(setUpdates).length > 0 ? { $set: setUpdates } : {}),
      ...(Object.keys(unsetUpdates).length > 0 ? { $unset: unsetUpdates } : {}),
    },
    { new: true, runValidators: true },
  );
  return menuItem ? toMenuItemRecord(menuItem) : null;
}

export async function deleteMenuItem(menuItemId: string): Promise<boolean> {
  const result = await MenuItem.deleteOne({ _id: menuItemId });
  return result.deletedCount > 0;
}
