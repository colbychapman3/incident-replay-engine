import { describe, test, expect } from '@jest/globals';
import { getRateLimitIdentifier } from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  describe('getRateLimitIdentifier', () => {
    test('extracts IP from x-forwarded-for header', () => {
      const headers = new Headers({
        'x-forwarded-for': '192.168.1.100'
      });

      const identifier = getRateLimitIdentifier(headers);
      expect(identifier).toBe('192.168.1.100');
    });

    test('uses first IP from comma-separated x-forwarded-for', () => {
      const headers = new Headers({
        'x-forwarded-for': '192.168.1.100, 10.0.0.1, 172.16.0.1'
      });

      const identifier = getRateLimitIdentifier(headers);
      expect(identifier).toBe('192.168.1.100');
    });

    test('falls back to cf-connecting-ip when available', () => {
      const headers = new Headers({
        'cf-connecting-ip': '203.0.113.5'
      });

      const identifier = getRateLimitIdentifier(headers);
      expect(identifier).toBe('203.0.113.5');
    });

    test('falls back to x-real-ip when available', () => {
      const headers = new Headers({
        'x-real-ip': '198.51.100.42'
      });

      const identifier = getRateLimitIdentifier(headers);
      expect(identifier).toBe('198.51.100.42');
    });

    test('prefers x-forwarded-for over other headers', () => {
      const headers = new Headers({
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '10.0.0.1',
        'cf-connecting-ip': '172.16.0.1'
      });

      const identifier = getRateLimitIdentifier(headers);
      expect(identifier).toBe('192.168.1.1');
    });

    test('returns anonymous when no IP headers present', () => {
      const headers = new Headers({});

      const identifier = getRateLimitIdentifier(headers);
      expect(identifier).toBe('anonymous');
    });

    test('trims whitespace from IP addresses', () => {
      const headers = new Headers({
        'x-forwarded-for': '  192.168.1.100  ,  10.0.0.1  '
      });

      const identifier = getRateLimitIdentifier(headers);
      expect(identifier).toBe('192.168.1.100');
    });

    test('handles IPv6 addresses', () => {
      const headers = new Headers({
        'x-forwarded-for': '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
      });

      const identifier = getRateLimitIdentifier(headers);
      expect(identifier).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    });

    test('handles IPv4-mapped IPv6 addresses', () => {
      const headers = new Headers({
        'x-forwarded-for': '::ffff:192.168.1.1'
      });

      const identifier = getRateLimitIdentifier(headers);
      expect(identifier).toBe('::ffff:192.168.1.1');
    });
  });

  describe('Security - IP Spoofing Prevention', () => {
    test('only uses first IP from x-forwarded-for chain', () => {
      // Attacker can add their own IPs to the chain, but first IP is most trustworthy
      const headers = new Headers({
        'x-forwarded-for': '203.0.113.5, 198.51.100.42, 192.0.2.1'
      });

      const identifier = getRateLimitIdentifier(headers);
      expect(identifier).toBe('203.0.113.5'); // Client IP (most trustworthy)
    });

    test('ignores empty string in headers', () => {
      const headers = new Headers({
        'x-forwarded-for': ''
      });

      const identifier = getRateLimitIdentifier(headers);
      expect(identifier).toBe('anonymous');
    });

    test('handles malformed IP addresses gracefully', () => {
      const headers = new Headers({
        'x-forwarded-for': 'not-an-ip'
      });

      // Should still return the value (validation happens elsewhere)
      const identifier = getRateLimitIdentifier(headers);
      expect(identifier).toBe('not-an-ip');
    });
  });
});
