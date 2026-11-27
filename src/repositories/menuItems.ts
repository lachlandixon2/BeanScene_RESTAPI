import { Types, type HydratedDocument } from 'mongoose';
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

export interface MenuItemListOptions {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  dietary?: string;
  allergen?: string;
  availability?: boolean;
  sortBy: 'name' | 'price' | 'category';
  sortOrder: 'asc' | 'desc';
}

interface MenuItemListDocument {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  category: Types.ObjectId;
  photoUrl?: string;
  allergens: MenuItemTags;
  dietaryRequirements: MenuItemTags;
  availability: boolean;
}

function toMenuItemRecord(
  menuItem: HydratedDocument<MenuItemDocument> | MenuItemListDocument,
): MenuItemRecord {
  return {
    id: menuItem._id.toString(),
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

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function listMenuItems(
  query: MenuItemListOptions,
): Promise<{ menuItems: MenuItemRecord[]; total: number }> {
  const filter: {
    $or?: Array<{ name: RegExp } | { description: RegExp }>;
    category?: Types.ObjectId;
    'dietaryRequirements.tags'?: string;
    'allergens.tags'?: string;
    availability?: boolean;
  } = {};
  if (query.search !== undefined) {
    const search = new RegExp(escapeRegularExpression(query.search), 'i');
    filter.$or = [{ name: search }, { description: search }];
  }
  if (query.category !== undefined) filter.category = new Types.ObjectId(query.category);
  if (query.dietary !== undefined) {
    filter['dietaryRequirements.tags'] = query.dietary;
  }
  if (query.allergen !== undefined) filter['allergens.tags'] = query.allergen;
  if (query.availability !== undefined) filter.availability = query.availability;

  const direction: 1 | -1 = query.sortOrder === 'asc' ? 1 : -1;
  const skip = (query.page - 1) * query.limit;
  const sort = query.sortBy === 'price'
    ? { price: direction, _id: 1 as const }
    : { name: direction, _id: 1 as const };

  const menuItemsPromise = query.sortBy === 'category'
    ? MenuItem.aggregate<MenuItemListDocument>([
        { $match: filter },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryForSort',
          },
        },
        { $unwind: '$categoryForSort' },
        { $sort: { 'categoryForSort.name': direction, _id: 1 } },
        { $skip: skip },
        { $limit: query.limit },
        { $project: { categoryForSort: 0 } },
      ])
    : MenuItem.find(filter).sort(sort).skip(skip).limit(query.limit);

  const [menuItems, total] = await Promise.all([
    menuItemsPromise,
    MenuItem.countDocuments(filter),
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
