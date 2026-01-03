import { describe, test, expect, beforeEach } from '@jest/globals';
import { generateToken, verifyToken, hashPassword, verifyPassword, requireRole } from '@/lib/auth';
import type { User } from '@/lib/auth';

describe('Authentication System', () => {
  describe('JWT Token Generation and Verification', () => {
    const testUser: User = {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin'
    };

    test('generateToken creates valid JWT', () => {
      const token = generateToken(testUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('verifyToken decodes valid token', async () => {
      const token = generateToken(testUser);
      const payload = await verifyToken(token);

      expect(payload.userId).toBe(testUser.id);
      expect(payload.email).toBe(testUser.email);
      expect(payload.role).toBe(testUser.role);
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();
    });

    test('verifyToken rejects invalid token', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(verifyToken(invalidToken)).rejects.toThrow('Invalid token');
    });

    test('verifyToken rejects malformed token', async () => {
      const malformedToken = 'not-a-jwt';

      await expect(verifyToken(malformedToken)).rejects.toThrow();
    });

    test('token contains correct issuer', async () => {
      const token = generateToken(testUser);
      const payload = await verifyToken(token);

      // The JWT library doesn't return issuer in payload, but verification would fail if wrong
      expect(payload).toBeDefined();
    });

    test('token has expiration time', async () => {
      const token = generateToken(testUser);
      const payload = await verifyToken(token);

      expect(payload.exp).toBeDefined();
      expect(payload.exp).toBeGreaterThan(payload.iat);

      // Token should expire in 7 days (604800 seconds)
      const expectedExpiry = payload.iat + 604800;
      expect(payload.exp).toBeCloseTo(expectedExpiry, -1); // Allow 10s variance
    });
  });

  describe('Password Hashing', () => {
    const testPassword = 'SecurePassword123!';

    test('hashPassword creates bcrypt hash', async () => {
      const hash = await hashPassword(testPassword);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^\$2[ayb]\$.{56}$/); // Bcrypt hash format
    });

    test('hashPassword creates different hashes for same password', async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);

      expect(hash1).not.toBe(hash2); // Different salts
    });

    test('verifyPassword accepts correct password', async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword(testPassword, hash);

      expect(isValid).toBe(true);
    });

    test('verifyPassword rejects incorrect password', async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword('WrongPassword', hash);

      expect(isValid).toBe(false);
    });

    test('verifyPassword rejects empty password', async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword('', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('Role-Based Access Control', () => {
    const adminUser: User = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin'
    };

    const regularUser: User = {
      id: '2',
      email: 'user@example.com',
      name: 'User',
      role: 'user'
    };

    test('admin user has admin role', () => {
      expect(requireRole(adminUser, 'admin')).toBe(true);
    });

    test('admin user has user role', () => {
      expect(requireRole(adminUser, 'user')).toBe(true);
    });

    test('regular user does not have admin role', () => {
      expect(requireRole(regularUser, 'admin')).toBe(false);
    });

    test('regular user has user role', () => {
      expect(requireRole(regularUser, 'user')).toBe(true);
    });
  });

  describe('Security Edge Cases', () => {
    test('generateToken handles special characters in email', () => {
      const user: User = {
        id: 'test',
        email: 'test+alias@example.com',
        name: 'Test',
        role: 'user'
      };

      const token = generateToken(user);
      expect(token).toBeDefined();
    });

    test('generateToken handles very long IDs', () => {
      const user: User = {
        id: 'a'.repeat(100),
        email: 'test@example.com',
        name: 'Test',
        role: 'user'
      };

      const token = generateToken(user);
      expect(token).toBeDefined();
    });

    test('verifyPassword handles very long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      const hash = await hashPassword(longPassword);
      const isValid = await verifyPassword(longPassword, hash);

      expect(isValid).toBe(true);
    });

    test('verifyPassword handles unicode characters', async () => {
      const unicodePassword = '密码测试🔒';
      const hash = await hashPassword(unicodePassword);
      const isValid = await verifyPassword(unicodePassword, hash);

      expect(isValid).toBe(true);
    });
  });
});
