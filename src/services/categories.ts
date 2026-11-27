import {
  categoryNameExists,
  createCategory as createCategoryRecord,
  deleteCategory as deleteCategoryRecord,
  findCategoryById,
  isCategoryReferencedByMenuItems,
  listCategories as listCategoryRecords,
  updateCategory as updateCategoryRecord,
  type CategoryRecord,
  type CategoryRepositoryUpdate,
} from '../repositories/categories.js';
import type { Pagination } from '../types/http.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/httpErrors.js';
import { objectIdSchema, parseWithSchema } from '../validators/common.js';

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}

export interface PaginatedCategories {
  categories: CategoryRecord[];
  pagination: Pagination;
}

function validateName(name: string): string {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new ValidationError('Category name must not be empty', [
      { field: 'name', message: 'Name is required' },
    ]);
  }
  return trimmedName;
}

function normaliseDescription(description: string): string | undefined {
  const trimmedDescription = description.trim();
  return trimmedDescription || undefined;
}

function validatePagination(page: number, limit: number): void {
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new ValidationError('Invalid pagination values', [
      { message: 'Page must be a positive integer and limit must be between 1 and 50' },
    ]);
  }
}

export async function listCategories(page: number, limit: number): Promise<PaginatedCategories> {
  validatePagination(page, limit);
  const { categories, total } = await listCategoryRecords(page, limit);
  return {
    categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCategory(categoryId: string): Promise<CategoryRecord> {
  parseWithSchema(objectIdSchema, categoryId);
  const category = await findCategoryById(categoryId);
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  return category;
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryRecord> {
  const name = validateName(input.name);
  const description =
    input.description === undefined ? undefined : normaliseDescription(input.description);

  if (await categoryNameExists(name)) {
    throw new ConflictError('A category with this name already exists');
  }

  return createCategoryRecord({
    name,
    ...(description !== undefined ? { description } : {}),
  });
}

export async function updateCategory(
  categoryId: string,
  input: UpdateCategoryInput,
  replace = false,
): Promise<CategoryRecord> {
  parseWithSchema(objectIdSchema, categoryId);

  const existingCategory = await findCategoryById(categoryId);
  if (!existingCategory) {
    throw new NotFoundError('Category not found');
  }

  const updates: CategoryRepositoryUpdate = {};
  if (input.name !== undefined) {
    updates.name = validateName(input.name);
  }
  if (input.description !== undefined) {
    updates.description = normaliseDescription(input.description) ?? null;
  } else if (replace) {
    updates.description = null;
  }
  if (Object.keys(updates).length === 0) {
    throw new ValidationError('No category fields provided for update');
  }

  if (updates.name && (await categoryNameExists(updates.name, categoryId))) {
    throw new ConflictError('A category with this name already exists');
  }

  const updatedCategory = await updateCategoryRecord(categoryId, updates);
  if (!updatedCategory) {
    throw new NotFoundError('Category not found');
  }
  return updatedCategory;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  parseWithSchema(objectIdSchema, categoryId);

  if (!(await findCategoryById(categoryId))) {
    throw new NotFoundError('Category not found');
  }
  if (await isCategoryReferencedByMenuItems(categoryId)) {
    throw new ConflictError('Categories referenced by menu items cannot be deleted');
  }
  if (!(await deleteCategoryRecord(categoryId))) {
    throw new NotFoundError('Category not found');
  }
}
