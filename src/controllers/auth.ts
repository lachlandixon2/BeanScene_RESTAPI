import type { Request, Response } from 'express';
import { login } from '../services/auth.js';
import { parseWithSchema } from '../validators/common.js';
import { loginSchema } from '../validators/auth.js';

export async function loginController(request: Request, response: Response): Promise<void> {
  const credentials = parseWithSchema(loginSchema, request.body);
  const result = await login(credentials);

  if (!result) {
    response.status(401).json({
      success: false,
      message: 'Invalid email or password',
      errors: [],
    });
    return;
  }

  response.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
}

export function logoutController(_request: Request, response: Response): void {
  response.status(200).json({
    success: true,
    message: 'Logout successful',
    data: {},
  });
}
