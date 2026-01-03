'use client';

import { useEffect, useState } from 'react';
import { SceneProvider, useSceneContext } from '@/context/SceneContext';
import { SceneEditor } from '@/components/canvas/SceneEditor';
import { AssetPalette } from '@/components/ui/AssetPalette';
import { PropertyPanel } from '@/components/ui/PropertyPanel';
import { EnvelopeToggles } from '@/components/ui/EnvelopeToggles';
import { ExportMenu } from '@/components/ui/ExportMenu';
import { Timeline } from '@/components/timeline/Timeline';
import { TimelineControls } from '@/components/timeline/TimelineControls';
import { ProjectWizard } from '@/components/wizard/ProjectWizard';
import { CommandChatbot } from '@/components/chatbot/CommandChatbot';
import { useTimelinePlayback } from '@/hooks/useTimelinePlayback';
import { AssetDefinition } from '@/types/assets';
import { SceneObject, EnvelopeType, Keyframe, ObjectState } from '@/types/scene';
import { Plus, MessageSquare } from 'lucide-react';

function EditorContent() {
  const { state, dispatch } = useSceneContext();
  const [showWizard, setShowWizard] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

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

  // Handle envelope toggle
  const handleEnvelopeToggle = (type: EnvelopeType) => {
    dispatch({ type: 'TOGGLE_ENVELOPE', payload: type });
  };

  // Timeline playback
  const {
    isPlaying,
    currentTime,
    playbackSpeed,
    duration,
    play,
    pause,
    stop,
    seek,
    stepForward,
    stepBackward,
    jumpToKeyframe,
    setPlaybackSpeed
  } = useTimelinePlayback({
    keyframes: state.timeline.keyframes,
    fps: state.timeline.fps,
    onTimeUpdate: (time, interpolatedStates) => {
      dispatch({ type: 'SET_TIME', payload: time });
      dispatch({ type: 'APPLY_INTERPOLATED_STATES', payload: interpolatedStates });
    }
  });

  // Handle add keyframe
  const handleAddKeyframe = (timestamp: number) => {
    const newKeyframe: Keyframe = {
      id: `T${state.timeline.keyframes.length}`,
      timestamp,
      label: `T${state.timeline.keyframes.length}: New event`,
      objectStates: {}
    };

    // Capture current object states at this keyframe
    state.objects.forEach(obj => {
      newKeyframe.objectStates[obj.id] = {
        position: obj.properties.position || { x: 0, y: 0 },
        rotation: obj.properties.rotation || 0,
        properties: obj.properties,
        visible: true
      };
    });

    dispatch({ type: 'ADD_KEYFRAME', payload: newKeyframe });
  };

  // Handle delete keyframe
  const handleDeleteKeyframe = (keyframeId: string) => {
    if (state.timeline.keyframes.length > 1) {
      dispatch({ type: 'DELETE_KEYFRAME', payload: { id: keyframeId } });
    }
  };

  // Handle wizard completion
  const handleWizardComplete = async (wizardData: any) => {
    // TODO: Send wizard data to API to create project
    console.log('Project wizard completed:', wizardData);
    // For now, just close the wizard
    setShowWizard(false);
    // In production, this would create a project in the database
  };

  // Handle chatbot commands
  const handleChatbotCommand = async (command: string): Promise<{ success: boolean; message: string }> => {
    // Parse and execute command
    console.log('Executing command:', command);
    // TODO: Integrate with command parser from lib/commands/parser.ts
    return {
      success: true,
      message: `Command received: ${command}`
    };
  };

  // Handle PNG export
  const handleExportPNG = () => {
    // TODO: Get canvas reference and export
    console.log('Exporting PNG...');
    // Would call canvas.toDataURL() and trigger download
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    // TODO: Call PDF export API
    console.log('Exporting PDF...');
    // Would call /api/export/pdf with project data
  };

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
            {/* New Project button */}
            <button
              onClick={() => setShowWizard(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center gap-2"
              title="New Project"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>

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

            {/* Chatbot toggle */}
            <button
              onClick={() => setShowChatbot(!showChatbot)}
              className={`px-3 py-1.5 text-white text-sm rounded transition-colors flex items-center gap-2 ${
                showChatbot ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title="Command Chatbot"
            >
              <MessageSquare className="w-4 h-4" />
              Chatbot
            </button>

            {/* Export menu */}
            <ExportMenu
              projectName="Current Project"
              onExportPNG={handleExportPNG}
              onExportPDF={handleExportPDF}
            />
          </div>
        </div>

        {/* Envelope Toggles */}
        <EnvelopeToggles
          visibility={state.envelopeVisibility}
          onToggle={handleEnvelopeToggle}
        />

        {/* Canvas */}
        <div className="flex-1 overflow-auto">
          <SceneEditor />
        </div>

        {/* Timeline Controls */}
        <TimelineControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          playbackSpeed={playbackSpeed}
          onPlay={play}
          onPause={pause}
          onStop={stop}
          onStepBackward={stepBackward}
          onStepForward={stepForward}
          onSpeedChange={setPlaybackSpeed}
        />

        {/* Timeline Scrubber */}
        <Timeline
          keyframes={state.timeline.keyframes}
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
          onAddKeyframe={handleAddKeyframe}
          onDeleteKeyframe={handleDeleteKeyframe}
          onJumpToKeyframe={jumpToKeyframe}
        />
      </div>

      {/* Right Sidebar: Property Panel */}
      <PropertyPanel
        selectedObjects={selectedObjects}
        onPropertyChange={handlePropertyChange}
        onDelete={handleDelete}
      />

      {/* Project Wizard Modal */}
      {showWizard && (
        <ProjectWizard
          onComplete={handleWizardComplete}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {/* Command Chatbot Panel */}
      {showChatbot && (
        <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 shadow-2xl z-30">
          <CommandChatbot
            onCommand={handleChatbotCommand}
            initialMode="command"
          />
        </div>
      )}
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
