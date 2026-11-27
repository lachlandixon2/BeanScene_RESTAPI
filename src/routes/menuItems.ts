import { Router } from 'express';
import {
  createMenuItemController,
  deleteMenuItemController,
  getMenuItemController,
  listMenuItemsController,
  patchMenuItemController,
  replaceMenuItemController,
} from '../controllers/menuItems.js';
import { authenticateStaff } from '../middleware/authenticateStaff.js';
import { requireManager } from '../middleware/requireManager.js';

export const menuItemsRouter = Router();

menuItemsRouter.use(authenticateStaff);
menuItemsRouter.get('/menu-items', listMenuItemsController);
menuItemsRouter.get('/menu-items/:id', getMenuItemController);
menuItemsRouter.post('/menu-items', requireManager, createMenuItemController);
menuItemsRouter.put('/menu-items/:id', requireManager, replaceMenuItemController);
menuItemsRouter.patch('/menu-items/:id', requireManager, patchMenuItemController);
menuItemsRouter.delete('/menu-items/:id', requireManager, deleteMenuItemController);
