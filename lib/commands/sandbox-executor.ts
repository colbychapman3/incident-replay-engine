import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import path from 'path';
import { SandboxedCommand, ExecutionResult } from '@/types/commands';
import { validateCommand } from './validator';
import { randomUUID } from 'crypto';

export class CommandSandbox extends EventEmitter {
  private worker: Worker | null = null;
  private readonly TIMEOUT = 5000; // 5 seconds

  constructor() {
    super();
  }

  async executeCommand(
    cmd: SandboxedCommand,
    currentState: any
  ): Promise<ExecutionResult> {
    // Step 1: Validate command
    const validation = validateCommand(cmd);

    if (!validation.ok) {
      return {
        success: false,
        error: validation.error,
        auditLog: {
          id: randomUUID(),
          action: 'command_rejected',
          userId: cmd.userId,
          projectId: cmd.projectId,
          timestamp: Date.now(),
          sandboxing: {
            timeout: this.TIMEOUT
          },
          violations: [{
            type: 'unauthorized',
            detail: validation.error || 'Validation failed',
            blocked: true
          }],
          result: {
            success: false,
            error: validation.error
          }
        }
      };
    }

    // Step 2: Create worker
    const workerPath = path.resolve(__dirname, './command-worker.ts');
    this.worker = new Worker(workerPath);
    const workerId = this.worker.threadId;

    // Step 3: Execute with timeout
    try {
      const result = await this.executeWithTimeout(validation.command!, currentState, workerId);
      return result;
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message,
        auditLog: {
          id: randomUUID(),
          action: 'command_timeout',
          userId: cmd.userId,
          projectId: cmd.projectId,
          timestamp: Date.now(),
          sandboxing: {
            workerID: String(workerId),
            timeout: this.TIMEOUT
          },
          violations: [{
            type: 'timeout',
            detail: (err as Error).message,
            blocked: true
          }],
          result: {
            success: false,
            error: (err as Error).message
          }
        }
      };
    } finally {
      if (this.worker) {
        await this.worker.terminate();
        this.worker = null;
      }
    }
  }

  private executeWithTimeout(
    command: SandboxedCommand,
    state: any,
    workerId: number
  ): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.worker?.terminate();
        reject(new Error('Command execution timeout (5s exceeded)'));
      }, this.TIMEOUT);

      this.worker?.once('message', (result) => {
        clearTimeout(timeout);

        resolve({
          ...result,
          auditLog: {
            id: randomUUID(),
            ...result.auditLog,
            sandboxing: {
              workerID: String(workerId),
              timeout: this.TIMEOUT
            }
          }
        });
      });

      this.worker?.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      // Send command to worker (immutable copy)
      this.worker?.postMessage({
        command,
        state: JSON.parse(JSON.stringify(state))
      });
    });
  }
}
