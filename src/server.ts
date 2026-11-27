import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function start(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`Bean Scene REST API listening on port ${env.port}`);
  });

  const shutdown = (signal: string): void => {
    console.log(`Received ${signal}; shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error: unknown) => {
  console.error('Application startup failed:', error);
  process.exit(1);
});
