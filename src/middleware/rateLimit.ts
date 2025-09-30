import { NextRequest } from 'next/server';
import { AppError } from '@/utils/errors';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, consider using Redis or similar
const rateLimitStore = new Map<string, RateLimitStore>();

/**
 * Rate Limiting Middleware
 * Limits requests per IP address
 */
export function checkRateLimit(request: NextRequest) {
  const limitPerMinute = parseInt(
    process.env.RATE_LIMIT_PER_MINUTE || '60',
    10
  );

  // Get client IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute

  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= limitPerMinute) {
    const resetIn = Math.ceil((record.resetTime - now) / 1000);
    throw new AppError(
      'RATE_LIMIT_EXCEEDED',
      `Rate limit exceeded. Please try again in ${resetIn} seconds`,
      `Limit: ${limitPerMinute} requests per minute`
    );
  }

  record.count++;
  return true;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime + 60000) {
      // Keep for 1 extra minute
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes