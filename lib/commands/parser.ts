import { SandboxedCommand } from '@/types/commands';

export interface ParseResult {
  success: boolean;
  command?: SandboxedCommand;
  errors?: string[];
  clarifications?: {
    field: string;
    message: string;
    options?: string[];
  }[];
}

export function parseCommand(
  input: string,
  userId: string,
  projectId: string
): ParseResult {
  // Remove extra whitespace
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      success: false,
      errors: ['Empty command']
    };
  }

  // Tokenize
  const tokens = tokenize(trimmed);

  // Detect action
  const action = detectAction(tokens[0]);
  if (!action) {
    return {
      success: false,
      errors: [`Unknown command: "${tokens[0]}". Try: add, move, rotate, delete, show`]
    };
  }

  // Extract parameters
  const params = extractParams(tokens.slice(1), action);

  // Check for missing parameters
  const required = getRequiredParams(action);
  const missing = required.filter(r => !(r in params));

  if (missing.length > 0) {
    return {
      success: false,
      clarifications: missing.map(field => ({
        field,
        message: `Please specify ${field} for this command.`,
        options: getSuggestedValues(action, field)
      }))
    };
  }

  return {
    success: true,
    command: {
      action: action as any,
      params,
      userId,
      projectId,
      timestamp: Date.now()
    }
  };
}

function tokenize(input: string): string[] {
  // Basic tokenization (space-separated)
  // TODO: Handle quoted strings
  return input.split(/\s+/);
}

function detectAction(token: string): string | null {
  const actionMap: Record<string, string> = {
    'add': 'ADD_OBJECT',
    'create': 'ADD_OBJECT',
    'move': 'MOVE_OBJECT',
    'rotate': 'ROTATE_OBJECT',
    'turn': 'ROTATE_OBJECT',
    'delete': 'DELETE_OBJECT',
    'remove': 'DELETE_OBJECT',
    'show': 'TOGGLE_ENVELOPE',
    'hide': 'TOGGLE_ENVELOPE',
    'undo': 'UNDO',
    'redo': 'REDO'
  };

  return actionMap[token.toLowerCase()] || null;
}

function extractParams(tokens: string[], action: string): Record<string, any> {
  // Simplified extraction - would need more sophisticated parsing
  const params: Record<string, any> = {};

  // Example: "truck at 10 20" → { objectType: 'truck', position: { x: 10, y: 20 } }
  if (action === 'ADD_OBJECT') {
    params.objectType = tokens[0];
    if (tokens[1] === 'at' && tokens[2] && tokens[3]) {
      params.position = { x: parseFloat(tokens[2]), y: parseFloat(tokens[3]) };
    }
  }

  return params;
}

function getRequiredParams(action: string): string[] {
  const requirements: Record<string, string[]> = {
    'ADD_OBJECT': ['objectType', 'position'],
    'MOVE_OBJECT': ['objectId', 'position'],
    'ROTATE_OBJECT': ['objectId', 'rotation'],
    'DELETE_OBJECT': ['objectId'],
    'TOGGLE_ENVELOPE': ['envelopeType']
  };

  return requirements[action] || [];
}

function getSuggestedValues(action: string, field: string): string[] | undefined {
  if (action === 'ADD_OBJECT' && field === 'objectType') {
    return ['truck', 'trailer', 'forklift', 'pov', 'spotter', 'cone'];
  }
  return undefined;
}
