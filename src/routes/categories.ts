import { Router } from 'express';
import {
  createCategoryController,
  deleteCategoryController,
  getCategoryController,
  listCategoriesController,
  patchCategoryController,
  replaceCategoryController,
} from '../controllers/categories.js';
import { authenticateStaff } from '../middleware/authenticateStaff.js';
import { requireManager } from '../middleware/requireManager.js';

export const categoriesRouter = Router();

categoriesRouter.use(authenticateStaff);
categoriesRouter.get('/categories', listCategoriesController);
categoriesRouter.get('/categories/:id', getCategoryController);
categoriesRouter.post('/categories', requireManager, createCategoryController);
categoriesRouter.put('/categories/:id', requireManager, replaceCategoryController);
categoriesRouter.patch('/categories/:id', requireManager, patchCategoryController);
categoriesRouter.delete('/categories/:id', requireManager, deleteCategoryController);
