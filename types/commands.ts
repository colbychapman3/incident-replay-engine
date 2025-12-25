export interface SandboxedCommand {
  action: SceneAction['type'];
  params: Record<string, unknown>;
  userId: string;
  projectId: string;
  timestamp: number;
}

export interface CommandValidationResult {
  ok: boolean;
  command?: SandboxedCommand;
  error?: string;
}

export interface ExecutionResult {
  success: boolean;
  newState?: SceneState;
  error?: string;
  auditLog: AuditEntry;
}

export interface AuditEntry {
  id: string;
  action: string;
  userId: string;
  projectId: string;
  timestamp: number;
  sandboxing: {
    workerID?: string;
    timeout?: number;
    resourceLimits?: {
      memory?: number;
      cpu?: number;
    };
  };
  violations?: {
    type: 'injection' | 'timeout' | 'resource' | 'unauthorized';
    detail: string;
    blocked: boolean;
  }[];
  result: {
    success: boolean;
    error?: string;
    warnings?: string[];
  };
}

// Import from scene types
import type { SceneState, SceneAction } from './scene';
