import { Redis } from '@upstash/redis';
import { logger } from './logger';

/**
 * Token Revocation System using Redis
 * Maintains a blacklist of revoked JWT tokens
 */

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const REVOKED_TOKEN_PREFIX = 'revoked:token:';
const REVOKED_USER_PREFIX = 'revoked:user:';

/**
 * Revoke a specific token
 * Token is stored in Redis until its expiration time
 */
export async function revokeToken(
  tokenId: string,
  expiresAt: Date,
  reason: string = 'manual_revocation'
): Promise<boolean> {
  if (!redis) {
    logger.warn('Token revocation not available: Redis not configured');
    return false;
  }

  try {
    // Calculate TTL (time until token expires)
    const ttlSeconds = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);

    if (ttlSeconds <= 0) {
      // Token already expired, no need to revoke
      return true;
    }

    // Store revoked token with expiration
    await redis.setex(
      `${REVOKED_TOKEN_PREFIX}${tokenId}`,
      ttlSeconds,
      JSON.stringify({
        revokedAt: new Date().toISOString(),
        reason
      })
    );

    logger.info(`Token revoked: ${tokenId} (reason: ${reason})`);
    return true;
  } catch (error) {
    logger.error(`Failed to revoke token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Check if a token has been revoked
 */
export async function isTokenRevoked(tokenId: string): Promise<boolean> {
  if (!redis) {
    // If Redis not configured, assume not revoked (fail open in development)
    return false;
  }

  try {
    const result = await redis.get(`${REVOKED_TOKEN_PREFIX}${tokenId}`);
    return result !== null;
  } catch (error) {
    logger.error(`Failed to check token revocation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    // Fail closed on error
    return true;
  }
}

/**
 * Revoke all tokens for a user
 * Useful when user changes password, account compromised, etc.
 */
export async function revokeAllUserTokens(
  userId: string,
  reason: string = 'password_change'
): Promise<boolean> {
  if (!redis) {
    logger.warn('Token revocation not available: Redis not configured');
    return false;
  }

  try {
    // Set a flag for this user (7 days = max token lifetime)
    const ttlSeconds = 7 * 24 * 60 * 60; // 7 days

    await redis.setex(
      `${REVOKED_USER_PREFIX}${userId}`,
      ttlSeconds,
      JSON.stringify({
        revokedAt: new Date().toISOString(),
        reason
      })
    );

    logger.info(`All tokens revoked for user: ${userId} (reason: ${reason})`);
    return true;
  } catch (error) {
    logger.error(`Failed to revoke user tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Check if all tokens for a user have been revoked
 */
export async function areUserTokensRevoked(userId: string): Promise<boolean> {
  if (!redis) {
    return false;
  }

  try {
    const result = await redis.get(`${REVOKED_USER_PREFIX}${userId}`);
    return result !== null;
  } catch (error) {
    logger.error(`Failed to check user token revocation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return true; // Fail closed
  }
}

/**
 * Clear revoked user flag (e.g., after user logs in with new password)
 */
export async function clearUserRevocation(userId: string): Promise<boolean> {
  if (!redis) {
    return false;
  }

  try {
    await redis.del(`${REVOKED_USER_PREFIX}${userId}`);
    logger.info(`User revocation cleared: ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to clear user revocation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Get revocation statistics
 */
export async function getRevocationStats(): Promise<{
  revokedTokens: number;
  revokedUsers: number;
} | null> {
  if (!redis) {
    return null;
  }

  try {
    const tokenKeys = await redis.keys(`${REVOKED_TOKEN_PREFIX}*`);
    const userKeys = await redis.keys(`${REVOKED_USER_PREFIX}*`);

    return {
      revokedTokens: tokenKeys.length,
      revokedUsers: userKeys.length
    };
  } catch (error) {
    logger.error(`Failed to get revocation stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}
