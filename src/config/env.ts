import dotenv from 'dotenv';

dotenv.config();

interface Environment {
  port: number;
  nodeEnv: 'development' | 'test' | 'production';
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  initialManagerName: string;
  initialManagerEmail: string;
  initialManagerPassword: string;
  corsAllowedOrigins: string[];
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
if (nodeEnv !== 'development' && nodeEnv !== 'test' && nodeEnv !== 'production') {
  throw new Error('NODE_ENV must be development, test or production');
}

export const env: Environment = {
  port: Number(process.env.PORT ?? '3000'),
  nodeEnv,
  mongodbUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || '15m',
  initialManagerName: required('INITIAL_MANAGER_NAME'),
  initialManagerEmail: required('INITIAL_MANAGER_EMAIL'),
  initialManagerPassword: required('INITIAL_MANAGER_PASSWORD'),
  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
  throw new Error('PORT must be a valid port number');
}
