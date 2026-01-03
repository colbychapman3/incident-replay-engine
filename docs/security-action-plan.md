# Security Action Plan - Incident Replay Engine
**Created**: December 28, 2025
**Status**: Ready for Implementation

## Priority 0: CRITICAL - Fix Before ANY Production Use

### 1. Remove JWT Secret Fallback (30 min)
**File**: `/lib/auth.ts:5`

```typescript
// BEFORE (UNSAFE)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-DO-NOT-USE-IN-PRODUCTION';

// AFTER (SAFE)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required');
}
```

**Impact**: Prevents all tokens from being trivially forgeable if env var is missing.

---

### 2. Replace In-Memory Rate Limiter (2 hours)
**File**: `/middleware.ts`

**Install Dependencies**:
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Implementation**:
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Different limiters for different endpoint types
const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '60s'),
  analytics: true,
  prefix: 'ratelimit:api',
});

const exportRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60s'),
  analytics: true,
  prefix: 'ratelimit:export',
});

const projectRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '60s'),
  analytics: true,
  prefix: 'ratelimit:projects',
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    const identifier = getClientIdentifier(request);

    let limiter: Ratelimit;
    let limitName: string;

    if (pathname.startsWith('/api/export/')) {
      limiter = exportRateLimit;
      limitName = 'export';
    } else if (pathname.startsWith('/api/projects')) {
      limiter = projectRateLimit;
      limitName = 'projects';
    } else {
      limiter = apiRateLimit;
      limitName = 'api';
    }

    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.'
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(reset)
          }
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(limit));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(reset));
    return response;
  }

  return NextResponse.next();
}

function getClientIdentifier(request: NextRequest): string {
  // Trust proxy headers only in production with trusted proxy
  if (process.env.NODE_ENV === 'production' && process.env.TRUSTED_PROXY === 'true') {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
  }

  // Fallback: Use authenticated user ID when available
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (token) {
      const { userId } = verifyToken(token);
      return `user:${userId}`;
    }
  } catch {
    // Token invalid, continue to anonymous
  }

  return 'anonymous';
}
```

**Environment Variables**:
```bash
# .env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
TRUSTED_PROXY=true  # Only in production
```

**Impact**: Production-safe rate limiting that works across multiple server instances.

---

### 3. Add Content-Security-Policy Header (30 min)
**File**: `/next.config.ts`

```typescript
// next.config.ts - Add to headers array
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
},
```

**Impact**: Primary defense against XSS attacks.

---

## Priority 1: HIGH - Fix Before Production Deployment

### 4. Add Comprehensive Security Tests (8 hours)

**Create Files**:
- `__tests__/lib/auth.test.ts` (150 lines)
- `__tests__/lib/validation.test.ts` (200 lines)
- `__tests__/middleware/rate-limiting.test.ts` (100 lines)
- `__tests__/api/projects.test.ts` (150 lines)

**Template - Auth Tests**:
```typescript
// __tests__/lib/auth.test.ts
import { generateToken, verifyToken, hashPassword, verifyPassword, extractToken } from '@/lib/auth';
import { NextRequest } from 'next/server';

describe('JWT Authentication', () => {
  const testUser = {
    id: 'test-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as const
  };

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const token = generateToken(testUser);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should include correct claims', () => {
      const token = generateToken(testUser);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.role).toBe(testUser.role);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = generateToken(testUser);
      const decoded = verifyToken(token);
      expect(decoded).toBeTruthy();
    });

    it('should reject tampered token', () => {
      const token = generateToken(testUser);
      const tampered = token.slice(0, -5) + 'XXXXX';

      expect(() => verifyToken(tampered)).toThrow('Invalid token');
    });

    it('should reject token with wrong issuer', () => {
      // Create token with different issuer
      const jwt = require('jsonwebtoken');
      const badToken = jwt.sign(
        { userId: testUser.id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1d', issuer: 'wrong-issuer' }
      );

      expect(() => verifyToken(badToken)).toThrow('Invalid token');
    });
  });

  describe('extractToken', () => {
    it('should extract Bearer token from header', () => {
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'Authorization': 'Bearer test-token-123' }
      });

      expect(extractToken(request)).toBe('test-token-123');
    });

    it('should extract raw token', () => {
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'Authorization': 'raw-token-456' }
      });

      expect(extractToken(request)).toBe('raw-token-456');
    });

    it('should return null for missing header', () => {
      const request = new NextRequest('http://localhost/api/test');
      expect(extractToken(request)).toBeNull();
    });
  });

  describe('Password Hashing', () => {
    const password = 'SecurePassword123!';

    it('should hash password', async () => {
      const hash = await hashPassword(password);
      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2b$')).toBe(true); // bcrypt format
    });

    it('should verify correct password', async () => {
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });
});
```

**Impact**: Confidence in security implementations, catch regressions.

---

### 5. Implement Token Revocation (3 hours)

**File**: `/lib/auth.ts`

```typescript
import { redis } from '@/lib/redis';

/**
 * Revoke JWT token (add to blacklist)
 * Token remains invalid until its natural expiry
 */
export async function revokeToken(token: string): Promise<void> {
  try {
    const decoded = verifyToken(token);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);

    if (ttl > 0) {
      // Store in Redis with TTL matching token expiry
      await redis.setex(`revoked:${token}`, ttl, '1');
    }
  } catch (error) {
    // Token already invalid, no need to revoke
  }
}

/**
 * Check if token has been revoked
 */
export async function isTokenRevoked(token: string): Promise<boolean> {
  const revoked = await redis.get(`revoked:${token}`);
  return revoked === '1';
}

/**
 * Get authenticated user from request
 * Now checks revocation status
 */
export async function getAuthUser(request: NextRequest): Promise<User> {
  const token = extractToken(request);

  if (!token) {
    throw new Error('No authentication token provided');
  }

  // Check revocation BEFORE verifying (performance optimization)
  if (await isTokenRevoked(token)) {
    throw new Error('Token has been revoked');
  }

  const payload = verifyToken(token);

  return {
    id: payload.userId,
    email: payload.email,
    name: '', // TODO: Fetch from database
    role: payload.role
  };
}
```

**Create Logout Endpoint**:
```typescript
// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, revokeToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 400 }
      );
    }

    await revokeToken(token);

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
```

**Impact**: Ability to invalidate compromised tokens, implement proper logout.

---

### 6. Add HSTS Header (15 min)

**File**: `/next.config.ts`

```typescript
// Only add in production with HTTPS
{
  key: 'Strict-Transport-Security',
  value: process.env.NODE_ENV === 'production'
    ? 'max-age=31536000; includeSubDomains; preload'
    : 'max-age=0' // Disable in development
},
```

**Impact**: Prevents SSL stripping attacks in production.

---

### 7. Fix IP Spoofing Vulnerability (Included in #2 above)

Already addressed in the Redis rate limiter implementation.

---

### 8. Implement Refresh Token Flow (4 hours)

**File**: `/lib/auth.ts`

```typescript
const ACCESS_TOKEN_EXPIRY = '15m';  // Short-lived
const REFRESH_TOKEN_EXPIRY = '7d';  // Long-lived

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;  // Unique ID for this refresh token
  iat: number;
  exp: number;
}

export function generateAccessToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'incident-replay-engine'
  });
}

export function generateRefreshToken(userId: string): string {
  const tokenId = crypto.randomUUID();
  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    userId,
    tokenId
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'incident-replay-engine'
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'incident-replay-engine'
  }) as RefreshTokenPayload;
}
```

**Create Refresh Endpoint**:
```typescript
// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken, isTokenRevoked, revokeToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      );
    }

    // Check revocation
    if (await isTokenRevoked(refreshToken)) {
      return NextResponse.json(
        { error: 'Refresh token revoked' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Revoke old refresh token (rotation)
    await revokeToken(refreshToken);

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user.id);

    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900 // 15 minutes in seconds
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 401 }
    );
  }
}
```

**Impact**: Better security with short-lived access tokens, improved UX with automatic refresh.

---

### 9. Implement Structured Logging (2 hours)

**Install Dependency**:
```bash
npm install winston
```

**Create Logger**:
```typescript
// lib/logger.ts
import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'incident-replay-engine',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Security event logging
export function logSecurityEvent(
  event: 'login' | 'logout' | 'failed_auth' | 'token_refresh' | 'token_revoked' | 'password_change' | 'account_locked',
  metadata: {
    userId?: string;
    email?: string;
    ip?: string;
    userAgent?: string;
    reason?: string;
  }
) {
  logger.info('Security event', {
    event,
    timestamp: new Date().toISOString(),
    ...metadata
  });
}

// API request logging
export function logAPIRequest(
  method: string,
  path: string,
  metadata: {
    userId?: string;
    statusCode?: number;
    duration?: number;
    error?: string;
  }
) {
  const level = metadata.statusCode && metadata.statusCode >= 500 ? 'error' : 'info';

  logger.log(level, 'API request', {
    method,
    path,
    timestamp: new Date().toISOString(),
    ...metadata
  });
}
```

**Update Routes**:
```typescript
// app/api/projects/route.ts (example)
import { logger, logAPIRequest } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const start = Date.now();
  let userId: string | undefined;
  let statusCode = 200;

  try {
    const user = await getAuthUser(req);
    userId = user.id;

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      // ...
    });

    logAPIRequest('GET', '/api/projects', { userId, statusCode, duration: Date.now() - start });
    return NextResponse.json(projects);

  } catch (error) {
    statusCode = error instanceof Error && error.message.includes('authentication') ? 401 : 500;

    logAPIRequest('GET', '/api/projects', {
      userId,
      statusCode,
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown'
    });

    // ... error response
  }
}
```

**Create logs directory**:
```bash
mkdir -p logs
echo "logs/" >> .gitignore
```

**Impact**: Production-ready logging, security audit trail, easier debugging.

---

### 10. Add Authorization Checks (2 hours)

**Create Middleware**:
```typescript
// lib/auth-middleware.ts
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function requireProjectOwnership(
  request: NextRequest,
  projectId: string
): Promise<{ authorized: true; userId: string } | { authorized: false; error: string; status: number }> {
  try {
    const user = await getAuthUser(request);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true }
    });

    if (!project) {
      return { authorized: false, error: 'Project not found', status: 404 };
    }

    if (project.userId !== user.id) {
      return { authorized: false, error: 'Forbidden: You do not own this project', status: 403 };
    }

    return { authorized: true, userId: user.id };
  } catch (error) {
    return {
      authorized: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
      status: 401
    };
  }
}

export async function requireRole(
  request: NextRequest,
  requiredRole: 'admin' | 'user'
): Promise<{ authorized: true; userId: string } | { authorized: false; error: string; status: number }> {
  try {
    const user = await getAuthUser(request);

    if (requiredRole === 'admin' && user.role !== 'admin') {
      return { authorized: false, error: 'Forbidden: Admin role required', status: 403 };
    }

    return { authorized: true, userId: user.id };
  } catch (error) {
    return {
      authorized: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
      status: 401
    };
  }
}
```

**Use in Routes**:
```typescript
// app/api/projects/[id]/route.ts (when implemented)
import { requireProjectOwnership } from '@/lib/auth-middleware';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await requireProjectOwnership(req, params.id);

  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status }
    );
  }

  // User is authenticated and owns the project
  const userId = authCheck.userId;

  // ... proceed with update
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await requireProjectOwnership(req, params.id);

  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status }
    );
  }

  await prisma.project.delete({
    where: { id: params.id }
  });

  return NextResponse.json({ success: true });
}
```

**Impact**: Prevent unauthorized access to other users' projects.

---

## Priority 2: MEDIUM - Important Improvements

### 11. Export Polygon Type (15 min)

**File**: `/types/geometry.ts` or `/types/envelopes.ts`

```typescript
// types/geometry.ts
import { Point } from './scene';

export interface Polygon {
  points: Point[];
  closed: boolean;
}
```

Then update imports in test file:
```typescript
// __tests__/lib/geometry.test.ts
import { Polygon } from '@/types/geometry';
```

---

### 12. Custom Error Classes (1 hour)

**File**: `/lib/errors.ts` (new file)

```typescript
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class ValidationError extends Error {
  constructor(message: string, public errors: string[]) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class RateLimitError extends Error {
  constructor(message: string, public retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}
```

**Update lib/auth.ts**:
```typescript
import { AuthenticationError } from './errors';

export async function getAuthUser(request: NextRequest): Promise<User> {
  const token = extractToken(request);
  if (!token) {
    throw new AuthenticationError('No authentication token provided');
  }

  if (await isTokenRevoked(token)) {
    throw new AuthenticationError('Token has been revoked');
  }

  const payload = verifyToken(token);
  // ...
}
```

**Update API routes**:
```typescript
import { AuthenticationError, AuthorizationError, ValidationError } from '@/lib/errors';

try {
  // ...
} catch (error) {
  if (error instanceof AuthenticationError) {
    return NextResponse.json({ error: 'Unauthorized', message: error.message }, { status: 401 });
  }
  if (error instanceof AuthorizationError) {
    return NextResponse.json({ error: 'Forbidden', message: error.message }, { status: 403 });
  }
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: 'Validation failed', errors: error.errors }, { status: 400 });
  }
  // ...
}
```

---

### 13. Validate PNG Magic Bytes (30 min)

**File**: `/app/api/export/png/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const body = await request.json();
    const validation = safeValidateRequest(ExportPNGSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const { canvasDataURL, filename } = validation.data;

    // Extract and decode base64
    try {
      const base64Data = canvasDataURL.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Verify buffer size (defense in depth)
      if (buffer.length > 15 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image too large after decoding (max 15MB)' },
          { status: 413 }
        );
      }

      // Verify PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
      const pngMagicBytes = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
      for (let i = 0; i < pngMagicBytes.length; i++) {
        if (buffer[i] !== pngMagicBytes[i]) {
          return NextResponse.json(
            { error: 'Invalid PNG data (magic bytes mismatch)' },
            { status: 400 }
          );
        }
      }

      const safeFilename = filename || 'incident-snapshot';

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${safeFilename}.png"`,
          'Content-Length': buffer.length.toString()
        }
      });
    } catch (decodeError) {
      return NextResponse.json(
        { error: 'Failed to decode image data' },
        { status: 400 }
      );
    }
  } catch (error) {
    // ... existing error handling
  }
}
```

---

### 14. Complete User Data Fetching (30 min)

**File**: `/lib/auth.ts`

```typescript
export async function getAuthUser(request: NextRequest): Promise<User> {
  const token = extractToken(request);

  if (!token) {
    throw new AuthenticationError('No authentication token provided');
  }

  if (await isTokenRevoked(token)) {
    throw new AuthenticationError('Token has been revoked');
  }

  const payload = verifyToken(token);

  // Fetch complete user data from database
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      // Note: Don't fetch password hash
    }
  });

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  return {
    ...user,
    role: payload.role // Use role from token (cached)
  };
}
```

---

## Summary

### Total Implementation Time
- **P0 (Critical)**: ~3 hours
- **P1 (High)**: ~22 hours
- **P2 (Medium)**: ~3 hours
- **TOTAL**: ~28 hours (~3.5 days)

### Execution Order
1. **Day 1**: P0 fixes (3 hours) + Start P1 tests (5 hours) = 8 hours
2. **Day 2**: Complete P1 tests + Token revocation + Logging (8 hours)
3. **Day 3**: Refresh tokens + Authorization + HSTS (8 hours)
4. **Day 4**: P2 improvements + Final testing (4 hours)

### Deployment Checklist
- [ ] All P0 fixes implemented
- [ ] Security tests passing (90%+ coverage)
- [ ] Environment variables set:
  - `JWT_SECRET` (256-bit random)
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
  - `DATABASE_URL` (with SSL)
  - `TRUSTED_PROXY=true`
  - `NODE_ENV=production`
- [ ] HTTPS enabled
- [ ] Rate limiting tested
- [ ] Token revocation tested
- [ ] Logging configured
- [ ] Error monitoring set up (Sentry, etc.)

### Post-Deployment
- Monitor logs for security events
- Review rate limit analytics
- Set up alerts for:
  - Failed authentication attempts (>5/min)
  - Rate limit violations (>100/hour)
  - Server errors (>10/hour)
  - Token revocations (unusual patterns)

---

**Document Status**: Ready for implementation
**Next Step**: Begin with Priority 0 fixes
