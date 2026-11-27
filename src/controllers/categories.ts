import type { Request, Response } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
  type UpdateCategoryInput,
} from '../services/categories.js';
import { objectIdSchema, paginationSchema, parseWithSchema } from '../validators/common.js';
import {
  createCategorySchema,
  patchCategorySchema,
  replaceCategorySchema,
} from '../validators/categories.js';

function getCategoryId(request: Request): string {
  return parseWithSchema(objectIdSchema, request.params.id);
}

function toUpdateCategoryInput(input: {
  name?: string | undefined;
  description?: string | undefined;
}): UpdateCategoryInput {
  const updates: UpdateCategoryInput = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;
  return updates;
}

export async function listCategoriesController(
  request: Request,
  response: Response,
): Promise<void> {
  const { page, limit } = parseWithSchema(paginationSchema, request.query);
  const result = await listCategories(page, limit);

  response.status(200).json({
    success: true,
    message: 'Categories retrieved successfully',
    data: {
      categories: result.categories,
      pagination: result.pagination,
    },
  });
}

export async function createCategoryController(
  request: Request,
  response: Response,
): Promise<void> {
  const input = parseWithSchema(createCategorySchema, request.body);
  const category = await createCategory(
    input.description === undefined
      ? { name: input.name }
      : { name: input.name, description: input.description },
  );

  response.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
}

export async function getCategoryController(
  request: Request,
  response: Response,
): Promise<void> {
  const category = await getCategory(getCategoryId(request));

  response.status(200).json({
    success: true,
    message: 'Category retrieved successfully',
    data: category,
  });
}

export async function replaceCategoryController(
  request: Request,
  response: Response,
): Promise<void> {
  const input = toUpdateCategoryInput(parseWithSchema(replaceCategorySchema, request.body));
  const category = await updateCategory(getCategoryId(request), input, true);

  response.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
}

export async function patchCategoryController(
  request: Request,
  response: Response,
): Promise<void> {
  const input = toUpdateCategoryInput(parseWithSchema(patchCategorySchema, request.body));
  const category = await updateCategory(getCategoryId(request), input);

  response.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
}

export async function deleteCategoryController(
  request: Request,
  response: Response,
): Promise<void> {
  await deleteCategory(getCategoryId(request));

  response.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    data: {},
  });
}
