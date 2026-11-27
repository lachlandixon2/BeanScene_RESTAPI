import mongoose, { Types, type HydratedDocument } from 'mongoose';
import { Category, type CategoryDocument } from '../models/Category.js';

export interface CategoryRecord {
  id: string;
  name: string;
  description?: string;
}

export interface CategoryRepositoryUpdate {
  name?: string;
  description?: string | null;
}

function toCategoryRecord(category: HydratedDocument<CategoryDocument>): CategoryRecord {
  return {
    id: category.id,
    name: category.name,
    ...(category.description !== undefined ? { description: category.description } : {}),
  };
}

export async function listCategories(
  page: number,
  limit: number,
): Promise<{ categories: CategoryRecord[]; total: number }> {
  const [categories, total] = await Promise.all([
    Category.find()
      .sort({ name: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Category.countDocuments(),
  ]);

  return { categories: categories.map(toCategoryRecord), total };
}

export async function findCategoryById(categoryId: string): Promise<CategoryRecord | null> {
  const category = await Category.findById(categoryId);
  return category ? toCategoryRecord(category) : null;
}

export async function categoryNameExists(
  name: string,
  exceptCategoryId?: string,
): Promise<boolean> {
  const query = exceptCategoryId
    ? { name, _id: { $ne: new Types.ObjectId(exceptCategoryId) } }
    : { name };
  return (await Category.exists(query)) !== null;
}

export async function createCategory(data: {
  name: string;
  description?: string;
}): Promise<CategoryRecord> {
  const category = await Category.create(data);
  return toCategoryRecord(category);
}

export async function updateCategory(
  categoryId: string,
  updates: CategoryRepositoryUpdate,
): Promise<CategoryRecord | null> {
  const setUpdates: { name?: string; description?: string } = {};
  if (updates.name !== undefined) setUpdates.name = updates.name;
  if (typeof updates.description === 'string') {
    setUpdates.description = updates.description;
  }

  const category = await Category.findByIdAndUpdate(
    categoryId,
    {
      $set: setUpdates,
      ...(updates.description === null ? { $unset: { description: 1 } } : {}),
    },
    { new: true, runValidators: true },
  );
  return category ? toCategoryRecord(category) : null;
}

export async function isCategoryReferencedByMenuItems(categoryId: string): Promise<boolean> {
  const menuItem = await mongoose.connection
    .collection('menuitems')
    .findOne({ category: new Types.ObjectId(categoryId) }, { projection: { _id: 1 } });
  return menuItem !== null;
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
  const result = await Category.deleteOne({ _id: categoryId });
  return result.deletedCount > 0;
}
