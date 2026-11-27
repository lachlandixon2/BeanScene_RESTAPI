import { Router } from 'express';
import {
  createStaffController,
  deleteStaffController,
  getStaffController,
  listStaffController,
  patchStaffController,
  replaceStaffController,
} from '../controllers/staff.js';
import { authenticateStaff } from '../middleware/authenticateStaff.js';
import { requireManager } from '../middleware/requireManager.js';

export const staffRouter = Router();

staffRouter.use(authenticateStaff, requireManager);
staffRouter.get('/staff', listStaffController);
staffRouter.post('/staff', createStaffController);
staffRouter.get('/staff/:id', getStaffController);
staffRouter.put('/staff/:id', replaceStaffController);
staffRouter.patch('/staff/:id', patchStaffController);
staffRouter.delete('/staff/:id', deleteStaffController);
