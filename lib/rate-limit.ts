import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Redis-based rate limiter for production use
 * Uses Upstash Redis for distributed rate limiting across multiple servers
 */

// Initialize Redis client
// In production, UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Rate limiters for different endpoint types
 */

// Export endpoints (CPU-intensive): 5 requests per 60 seconds
export const exportRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: true,
      prefix: '@upstash/ratelimit:export',
    })
  : null;

// Project CRUD endpoints: 30 requests per 60 seconds
export const projectRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '60 s'),
      analytics: true,
      prefix: '@upstash/ratelimit:projects',
    })
  : null;

// General API endpoints: 60 requests per 60 seconds
export const generalRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '60 s'),
      analytics: true,
      prefix: '@upstash/ratelimit:general',
    })
  : null;

/**
 * Get rate limiter for specific route
 */
export function getRateLimiter(pathname: string): Ratelimit | null {
  if (!redis) {
    console.warn('Redis not configured. Rate limiting disabled. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
    return null;
  }

  if (pathname.startsWith('/api/export/')) {
    return exportRateLimiter;
  } else if (pathname.startsWith('/api/projects')) {
    return projectRateLimiter;
  } else {
    return generalRateLimiter;
  }
}

/**
 * Get identifier for rate limiting (IP address with fallbacks)
 */
export function getRateLimitIdentifier(headers: Headers): string {
  // Try multiple headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare

  // x-forwarded-for can be a comma-separated list, take the first IP
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  if (realIp) {
    return realIp;
  }

  // Fallback (should rarely happen in production)
  return 'anonymous';
}
