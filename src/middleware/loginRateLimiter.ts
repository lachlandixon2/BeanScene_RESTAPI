import type { Request, Response, NextFunction } from 'express';

const LOGIN_ATTEMPT_LIMIT = 5;
const WINDOW_DURATION_MS = 15 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;

interface LoginAttemptWindow {
  count: number;
  resetAt: number;
}

const attemptsByIp = new Map<string, LoginAttemptWindow>();
let nextCleanupAt = Date.now() + CLEANUP_INTERVAL_MS;

export function loginRateLimiter(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const now = Date.now();

  if (now >= nextCleanupAt) {
    for (const [ip, window] of attemptsByIp) {
      if (window.resetAt <= now) {
        attemptsByIp.delete(ip);
      }
    }
    nextCleanupAt = now + CLEANUP_INTERVAL_MS;
  }

  const ip = request.ip ?? request.socket.remoteAddress ?? 'unknown';
  let window = attemptsByIp.get(ip);

  if (!window || window.resetAt <= now) {
    window = { count: 0, resetAt: now + WINDOW_DURATION_MS };
    attemptsByIp.set(ip, window);
  }

  response.setHeader('RateLimit-Limit', LOGIN_ATTEMPT_LIMIT);
  response.setHeader('RateLimit-Remaining', Math.max(0, LOGIN_ATTEMPT_LIMIT - window.count - 1));

  if (window.count >= LOGIN_ATTEMPT_LIMIT) {
    response.setHeader('Retry-After', Math.ceil((window.resetAt - now) / 1000));
    response.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
      errors: [],
    });
    return;
  }

  window.count += 1;
  next();
}
