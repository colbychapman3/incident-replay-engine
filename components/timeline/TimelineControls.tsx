'use client';

import React from 'react';
import { Play, Pause, StopCircle, SkipBack, SkipForward, Gauge } from 'lucide-react';

export interface TimelineControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onSpeedChange: (speed: number) => void;
}

export function TimelineControls({
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  onPlay,
  onPause,
  onStop,
  onStepBackward,
  onStepForward,
  onSpeedChange
}: TimelineControlsProps) {
  const speeds = [0.25, 0.5, 1, 2, 4];

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-800 border-b border-gray-700">
      {/* Playback controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onStepBackward}
          className="p-2 rounded hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          title="Step backward (1 frame)"
          disabled={isPlaying}
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {!isPlaying ? (
          <button
            onClick={onPlay}
            className="p-2 rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
            title="Play"
          >
            <Play className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onPause}
            className="p-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
            title="Pause"
          >
            <Pause className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={onStop}
          className="p-2 rounded hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          title="Stop and reset"
        >
          <StopCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onStepForward}
          className="p-2 rounded hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          title="Step forward (1 frame)"
          disabled={isPlaying}
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Time display */}
      <div className="text-sm font-mono text-gray-300">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      {/* Playback speed */}
      <div className="flex items-center gap-2 ml-auto">
        <Gauge className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">Speed:</span>
        <div className="flex gap-1">
          {speeds.map(speed => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                playbackSpeed === speed
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}
