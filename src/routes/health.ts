import { Router, type Request, type Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: 'Bean Scene REST API is running',
    data: {
      service: 'Bean Scene REST API',
      status: 'ok',
    },
  });
});
