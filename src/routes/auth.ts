import { Router } from 'express';
import { loginController, logoutController } from '../controllers/auth.js';
import { loginRateLimiter } from '../middleware/loginRateLimiter.js';

export const authRouter = Router();

authRouter.post('/auth/login', loginRateLimiter, loginController);
authRouter.post('/auth/logout', logoutController);
