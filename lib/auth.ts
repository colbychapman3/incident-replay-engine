import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';

// CRITICAL: JWT_SECRET must be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Application cannot start without it.');
}

// Type assertion: JWT_SECRET is guaranteed to be defined after the check above
const SECRET: string = JWT_SECRET;
const TOKEN_EXPIRY = '7d'; // 7 days

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  iat: number;
  exp: number;
}

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(user: User): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, SECRET, {
    expiresIn: TOKEN_EXPIRY,
    issuer: 'incident-replay-engine'
  });
}

/**
 * Verify and decode JWT token
 * @throws Error if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const decoded = jwt.verify(token, SECRET, {
      issuer: 'incident-replay-engine'
    }) as JWTPayload;

    // Check if token has been revoked (only if Redis is configured)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const { isTokenRevoked, areUserTokensRevoked } = await import('./token-revocation');

      // Generate token ID from JWT (use jti if available, or hash of token)
      const tokenId = (decoded as any).jti || token.substring(0, 16);

      if (await isTokenRevoked(tokenId)) {
        throw new Error('Token has been revoked');
      }

      if (await areUserTokensRevoked(decoded.userId)) {
        throw new Error('All user tokens have been revoked');
      }
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof Error && error.message.includes('revoked')) {
      throw error;
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Extract JWT token from request Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return null;
  }

  // Support both "Bearer <token>" and raw token
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
}

/**
 * Get authenticated user from request
 * @throws Error if no valid token found
 */
export async function getAuthUser(request: NextRequest): Promise<User> {
  const token = extractToken(request);

  if (!token) {
    throw new Error('No authentication token provided');
  }

  const payload = await verifyToken(token);

  return {
    id: payload.userId,
    email: payload.email,
    name: '', // TODO: Fetch from database
    role: payload.role
  };
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Check if user has required role
 */
export function requireRole(user: User, requiredRole: 'admin' | 'user'): boolean {
  if (requiredRole === 'admin') {
    return user.role === 'admin';
  }
  return true; // All authenticated users have 'user' role
}

/**
 * Development-only: Create a test token
 */
export function createDevToken(): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Dev tokens not allowed in production');
  }

  const testUser: User = {
    id: 'dev-user-id',
    email: 'dev@example.com',
    name: 'Dev User',
    role: 'admin'
  };

  return generateToken(testUser);
}
