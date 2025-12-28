'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Keyframe } from '@/types/timeline';
import { Plus, X, Edit2 } from 'lucide-react';

export interface TimelineProps {
  keyframes: Keyframe[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onAddKeyframe?: (timestamp: number) => void;
  onDeleteKeyframe?: (keyframeId: string) => void;
  onJumpToKeyframe?: (index: number) => void;
}

export function Timeline({
  keyframes,
  currentTime,
  duration,
  onSeek,
  onAddKeyframe,
  onDeleteKeyframe,
  onJumpToKeyframe
}: TimelineProps) {
  const scrubberRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredKeyframe, setHoveredKeyframe] = useState<string | null>(null);

  /**
   * Convert pixel position to time (seconds)
   */
  const pixelToTime = useCallback((pixelX: number): number => {
    if (!scrubberRef.current) return 0;

    const rect = scrubberRef.current.getBoundingClientRect();
    const relativeX = pixelX - rect.left;
    const progress = Math.max(0, Math.min(1, relativeX / rect.width));

    return progress * duration;
  }, [duration]);

  /**
   * Convert time to pixel position
   */
  const timeToPixel = useCallback((time: number): number => {
    if (!scrubberRef.current) return 0;

    const rect = scrubberRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, time / duration));

    return progress * rect.width;
  }, [duration]);

  /**
   * Handle scrubber click/drag
   */
  const handleScrubberMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    const time = pixelToTime(e.clientX);
    onSeek(time);
  }, [pixelToTime, onSeek]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const time = pixelToTime(e.clientX);
      onSeek(time);
    }
  }, [isDragging, pixelToTime, onSeek]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  /**
   * Handle double-click to add keyframe
   */
  const handleScrubberDoubleClick = useCallback((e: React.MouseEvent) => {
    if (onAddKeyframe) {
      const time = pixelToTime(e.clientX);
      onAddKeyframe(time);
    }
  }, [pixelToTime, onAddKeyframe]);

  /**
   * Handle keyframe click (jump to keyframe)
   */
  const handleKeyframeClick = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onJumpToKeyframe) {
      onJumpToKeyframe(index);
    }
  }, [onJumpToKeyframe]);

  /**
   * Handle keyframe delete
   */
  const handleKeyframeDelete = useCallback((keyframeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteKeyframe) {
      onDeleteKeyframe(keyframeId);
    }
  }, [onDeleteKeyframe]);

  // Calculate current time indicator position
  const currentTimePosition = timeToPixel(currentTime);

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      {/* Timeline scrubber */}
      <div className="relative">
        {/* Scrubber bar */}
        <div
          ref={scrubberRef}
          className="h-12 bg-gray-700 rounded cursor-pointer relative"
          onMouseDown={handleScrubberMouseDown}
          onDoubleClick={handleScrubberDoubleClick}
        >
          {/* Time markers (every 5 seconds) */}
          {Array.from({ length: Math.floor(duration / 5) + 1 }, (_, i) => i * 5).map(time => {
            const position = timeToPixel(time);
            return (
              <div
                key={time}
                className="absolute top-0 h-full border-l border-gray-600"
                style={{ left: `${position}px` }}
              >
                <span className="absolute top-0 left-1 text-xs text-gray-400">
                  {Math.floor(time)}s
                </span>
              </div>
            );
          })}

          {/* Keyframe markers */}
          {keyframes.map((keyframe, index) => {
            const position = timeToPixel(keyframe.timestamp);
            const isHovered = hoveredKeyframe === keyframe.id;

            return (
              <div
                key={keyframe.id}
                className="absolute top-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${position}px` }}
                onClick={(e) => handleKeyframeClick(index, e)}
                onMouseEnter={() => setHoveredKeyframe(keyframe.id)}
                onMouseLeave={() => setHoveredKeyframe(null)}
              >
                {/* Keyframe diamond */}
                <div
                  className={`w-4 h-4 rotate-45 transition-colors ${
                    isHovered
                      ? 'bg-blue-500 border-blue-300'
                      : 'bg-blue-600 border-blue-400'
                  } border-2`}
                />

                {/* Keyframe label (on hover) */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
                    {keyframe.label}
                    <button
                      onClick={(e) => handleKeyframeDelete(keyframe.id, e)}
                      className="ml-2 text-red-400 hover:text-red-300"
                      title="Delete keyframe"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Current time indicator */}
          <div
            className="absolute top-0 h-full w-0.5 bg-red-500 pointer-events-none"
            style={{ left: `${currentTimePosition}px` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45" />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-2 text-xs text-gray-400">
          Click to seek • Double-click to add keyframe • Hover keyframe to delete
        </div>
      </div>
    </div>
  );
}
