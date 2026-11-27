import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.corsAllowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origin is not allowed by CORS'));
      },
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/v1', healthRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
