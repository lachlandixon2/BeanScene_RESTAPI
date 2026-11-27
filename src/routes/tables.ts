import { Router } from 'express';
import {
  createTableController,
  deleteTableController,
  getTableController,
  listTablesController,
  patchTableController,
  replaceTableController,
} from '../controllers/tables.js';
import { authenticateStaff } from '../middleware/authenticateStaff.js';
import { requireManager } from '../middleware/requireManager.js';

export const tablesRouter = Router();

tablesRouter.use(authenticateStaff);
tablesRouter.get('/tables', listTablesController);
tablesRouter.get('/tables/:id', getTableController);
tablesRouter.post('/tables', requireManager, createTableController);
tablesRouter.put('/tables/:id', requireManager, replaceTableController);
tablesRouter.patch('/tables/:id', requireManager, patchTableController);
tablesRouter.delete('/tables/:id', requireManager, deleteTableController);
