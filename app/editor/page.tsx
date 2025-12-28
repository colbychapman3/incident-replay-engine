'use client';

import { useEffect } from 'react';
import { SceneProvider, useSceneContext } from '@/context/SceneContext';
import { SceneEditor } from '@/components/canvas/SceneEditor';
import { AssetPalette } from '@/components/ui/AssetPalette';
import { PropertyPanel } from '@/components/ui/PropertyPanel';
import { AssetDefinition } from '@/types/assets';
import { SceneObject } from '@/types/scene';

function EditorContent() {
  const { state, dispatch } = useSceneContext();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      }

      // Ctrl/Cmd + Shift + Z OR Ctrl/Cmd + Y: Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      }

      // Delete/Backspace: Delete selected objects
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedIds.length > 0) {
        e.preventDefault();
        state.selectedIds.forEach(id => {
          dispatch({ type: 'DELETE_OBJECT', payload: { id } });
        });
      }

      // Escape: Clear selection
      if (e.key === 'Escape') {
        e.preventDefault();
        dispatch({ type: 'CLEAR_SELECTION' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedIds, dispatch]);

  // Handle asset selection from palette
  const handleAssetSelect = (asset: AssetDefinition) => {
    // Generate unique ID
    const id = `${asset.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create new scene object at center of canvas
    const newObject: SceneObject = {
      id,
      assetId: asset.id,
      type: asset.type,
      locked: false,
      properties: {
        position: { x: 48, y: 27 }, // Center of 1920x1080 at 20px/m = 48m x 27m
        rotation: 0
      }
    };

    dispatch({ type: 'ADD_OBJECT', payload: newObject });

    // Auto-select the newly created object
    dispatch({ type: 'CLEAR_SELECTION' });
    dispatch({ type: 'SELECT_OBJECT', payload: { id } });
  };

  // Handle property changes from PropertyPanel
  const handlePropertyChange = (id: string, property: string, value: any) => {
    if (property === 'position') {
      dispatch({
        type: 'MOVE_OBJECT',
        payload: { id, position: value }
      });
    } else if (property === 'rotation') {
      dispatch({
        type: 'ROTATE_OBJECT',
        payload: { id, rotation: value }
      });
    } else if (property === 'locked') {
      // Update locked property (need to add UPDATE_OBJECT_PROPERTY action)
      const obj = state.objects.find(o => o.id === id);
      if (obj) {
        const updatedObj = { ...obj, locked: value };
        // For now, delete and re-add (not ideal but works for MVP)
        dispatch({ type: 'DELETE_OBJECT', payload: { id } });
        dispatch({ type: 'ADD_OBJECT', payload: updatedObj });
      }
    }
  };

  // Handle delete from PropertyPanel
  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_OBJECT', payload: { id } });
  };

  const selectedObjects = state.objects.filter(obj =>
    state.selectedIds.includes(obj.id)
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900">
      {/* Left Sidebar: Asset Palette */}
      <AssetPalette onAssetSelect={handleAssetSelect} />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">Incident Replay Engine</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Objects: {state.objects.length}</span>
              <span>•</span>
              <span>Selected: {state.selectedIds.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo/Redo buttons */}
            <button
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={state.undoStack.length === 0}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm rounded transition-colors"
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button
              onClick={() => dispatch({ type: 'REDO' })}
              disabled={state.redoStack.length === 0}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm rounded transition-colors"
              title="Redo (Ctrl+Shift+Z)"
            >
              ↷ Redo
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto">
          <SceneEditor />
        </div>

        {/* Bottom Status Bar */}
        <div className="h-10 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>Keyframe: T{state.currentKeyframe}</span>
            <span>•</span>
            <span>Changes: {state.changeHistory.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Ctrl+Z</kbd>
            <span>Undo</span>
            <span>•</span>
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Del</kbd>
            <span>Delete</span>
            <span>•</span>
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Esc</kbd>
            <span>Deselect</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Property Panel */}
      <PropertyPanel
        selectedObjects={selectedObjects}
        onPropertyChange={handlePropertyChange}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default function EditorPage() {
  return (
    <SceneProvider>
      <EditorContent />
    </SceneProvider>
  );
}
