import { parseCommand } from '@/lib/commands/parser';
import { validateCommand } from '@/lib/commands/validator';
import { CommandSandbox } from '@/lib/commands/sandbox-executor';

describe('Command Parser Security', () => {
  const userId = 'test-user';
  const projectId = 'test-project';

  describe('Injection Prevention', () => {
    it('rejects shell metacharacters', () => {
      const malicious = 'Add truck; rm -rf /';
      const result = parseCommand(malicious, userId, projectId);
      expect(result.success).toBe(false);
    });

    it('rejects command chaining attempts', () => {
      const malicious = 'Add truck && ls';
      const result = parseCommand(malicious, userId, projectId);
      expect(result.success).toBe(false);
    });

    it('rejects pipe operators', () => {
      const malicious = 'Add truck | cat /etc/passwd';
      const result = parseCommand(malicious, userId, projectId);
      expect(result.success).toBe(false);
    });

    it('rejects backtick execution', () => {
      const malicious = 'Add truck `whoami`';
      const result = parseCommand(malicious, userId, projectId);
      expect(result.success).toBe(false);
    });
  });

  describe('Validation', () => {
    it('rejects oversized commands', () => {
      const huge = {
        action: 'ADD_OBJECT' as const,
        params: { data: 'x'.repeat(100_000) },
        userId,
        projectId,
        timestamp: Date.now()
      };

      const result = validateCommand(huge);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('rejects unknown actions', () => {
      const invalid = {
        action: 'EXECUTE_ARBITRARY_CODE' as any,
        params: {},
        userId,
        projectId,
        timestamp: Date.now()
      };

      const result = validateCommand(invalid);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Unknown action');
    });

    it('requires user ID', () => {
      const noUser = {
        action: 'ADD_OBJECT' as const,
        params: {},
        userId: '',
        projectId,
        timestamp: Date.now()
      };

      const result = validateCommand(noUser);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('userId');
    });
  });

  describe('Timeout Enforcement', () => {
    it('enforces 5-second timeout', async () => {
      const sandbox = new CommandSandbox();

      const infiniteCommand = {
        action: 'ADD_OBJECT' as const,
        params: { infinite: true },
        userId,
        projectId,
        timestamp: Date.now()
      };

      const start = Date.now();
      const result = await sandbox.executeCommand(infiniteCommand, {});
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThan(4900);
      expect(elapsed).toBeLessThan(6000);
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    }, 10000);
  });
});
