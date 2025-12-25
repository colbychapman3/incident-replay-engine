import { SandboxedCommand, CommandValidationResult } from '@/types/commands';

const ALLOWED_ACTIONS = [
  'ADD_OBJECT',
  'MOVE_OBJECT',
  'ROTATE_OBJECT',
  'DELETE_OBJECT',
  'SET_KEYFRAME',
  'TOGGLE_ENVELOPE',
  'UNDO',
  'REDO'
] as const;

const MAX_COMMAND_SIZE = 10_000; // 10KB

export function validateCommand(cmd: SandboxedCommand): CommandValidationResult {
  // 1. Action whitelist
  if (!ALLOWED_ACTIONS.includes(cmd.action as any)) {
    return {
      ok: false,
      error: `Unknown action: ${cmd.action}. Allowed: ${ALLOWED_ACTIONS.join(', ')}`
    };
  }

  // 2. Parameter type check
  if (typeof cmd.params !== 'object' || cmd.params === null) {
    return {
      ok: false,
      error: 'Invalid params: must be object'
    };
  }

  // 3. Size limit (prevent DoS)
  const commandSize = JSON.stringify(cmd).length;
  if (commandSize > MAX_COMMAND_SIZE) {
    return {
      ok: false,
      error: `Command too large: ${commandSize} bytes (max ${MAX_COMMAND_SIZE})`
    };
  }

  // 4. User ID required
  if (!cmd.userId || typeof cmd.userId !== 'string') {
    return {
      ok: false,
      error: 'Missing or invalid userId'
    };
  }

  // 5. Project ID required
  if (!cmd.projectId || typeof cmd.projectId !== 'string') {
    return {
      ok: false,
      error: 'Missing or invalid projectId'
    };
  }

  // 6. Timestamp validation
  const now = Date.now();
  if (!cmd.timestamp || cmd.timestamp > now + 60000) {
    // Allow 1 minute clock skew
    return {
      ok: false,
      error: 'Invalid timestamp'
    };
  }

  return { ok: true, command: cmd };
}
