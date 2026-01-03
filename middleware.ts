import { NextRequest, NextResponse } from 'next/server';
import { getRateLimiter, getRateLimitIdentifier } from './lib/rate-limit';

/**
 * Next.js Middleware for security and rate limiting
 * Runs on Edge runtime before API routes
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const rateLimiter = getRateLimiter(pathname);

    if (rateLimiter) {
      const identifier = getRateLimitIdentifier(request.headers);
      const { success, limit, remaining, reset } = await rateLimiter.limit(identifier);

      if (!success) {
        return new NextResponse(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((reset - Date.now()) / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(reset).toISOString()
            }
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());
      return response;
    }

    // If rate limiter not configured (development), allow all requests
    console.warn('Rate limiting disabled: Redis not configured');
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/api/:path*',  // All API routes
  ]
};
