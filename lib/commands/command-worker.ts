import { parentPort } from 'worker_threads';

// This runs in isolated Worker thread
parentPort?.on('message', async (msg: { command: any; state: any }) => {
  try {
    // Import reducer dynamically (isolated from main thread)
    const { sceneReducer } = await import('@/context/scene-reducer');

    // Execute command in isolated context
    const newState = sceneReducer(msg.state, msg.command);

    // Validate result
    if (!isValidSceneState(newState)) {
      throw new Error('Invalid state produced by reducer');
    }

    // Return success
    parentPort?.postMessage({
      success: true,
      newState,
      auditLog: {
        action: msg.command.type,
        userId: msg.command.userId,
        timestamp: Date.now(),
        result: { success: true }
      }
    });
  } catch (err) {
    // Return error
    parentPort?.postMessage({
      success: false,
      error: (err as Error).message,
      auditLog: {
        action: 'command_error',
        error: (err as Error).message,
        timestamp: Date.now(),
        result: { success: false, error: (err as Error).message }
      }
    });
  }
});

function isValidSceneState(state: any): boolean {
  // Basic structure validation
  return (
    state &&
    typeof state === 'object' &&
    Array.isArray(state.objects) &&
    typeof state.currentKeyframe === 'number' &&
    Array.isArray(state.selectedIds)
  );
}
