import { useState, useEffect, useRef, useCallback } from 'react';
import { Keyframe, ObjectState } from '@/types/timeline';
import {
  findSurroundingKeyframes,
  calculateInterpolationFactor,
  lerpObjectState
} from '@/lib/timeline/interpolation';

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  duration: number;
}

export interface UseTimelinePlaybackOptions {
  keyframes: Keyframe[];
  fps?: number;
  onTimeUpdate?: (time: number, interpolatedStates: Record<string, ObjectState>) => void;
}

export function useTimelinePlayback({
  keyframes,
  fps = 30,
  onTimeUpdate
}: UseTimelinePlaybackOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 0.5x, 2x

  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Calculate timeline duration (time of last keyframe)
  const duration = keyframes.length > 0
    ? keyframes[keyframes.length - 1].timestamp
    : 0;

  /**
   * Calculate interpolated object states for current time
   */
  const getInterpolatedStates = useCallback((time: number): Record<string, ObjectState> => {
    const surrounding = findSurroundingKeyframes(keyframes, time);

    if (!surrounding) {
      return {};
    }

    const [startIdx, endIdx] = surrounding;
    const startKeyframe = keyframes[startIdx];
    const endKeyframe = keyframes[endIdx];

    // If on exact keyframe or past last keyframe, return that keyframe's states
    if (startIdx === endIdx) {
      return startKeyframe.objectStates;
    }

    // Interpolate between keyframes
    const t = calculateInterpolationFactor(
      time,
      startKeyframe.timestamp,
      endKeyframe.timestamp
    );

    const interpolatedStates: Record<string, ObjectState> = {};

    // Get all object IDs from both keyframes
    const allObjectIds = new Set([
      ...Object.keys(startKeyframe.objectStates),
      ...Object.keys(endKeyframe.objectStates)
    ]);

    for (const objectId of allObjectIds) {
      const startState = startKeyframe.objectStates[objectId];
      const endState = endKeyframe.objectStates[objectId];

      // If object exists in both keyframes, interpolate
      if (startState && endState) {
        interpolatedStates[objectId] = lerpObjectState(startState, endState, t);
      }
      // If object only in start keyframe, use that state
      else if (startState) {
        interpolatedStates[objectId] = startState;
      }
      // If object only in end keyframe, use that state
      else if (endState) {
        interpolatedStates[objectId] = endState;
      }
    }

    return interpolatedStates;
  }, [keyframes]);

  /**
   * Playback animation loop (30 FPS)
   */
  const animate = useCallback((timestamp: number) => {
    if (lastFrameTimeRef.current === 0) {
      lastFrameTimeRef.current = timestamp;
    }

    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // Convert to seconds
    lastFrameTimeRef.current = timestamp;

    setCurrentTime(prevTime => {
      const newTime = prevTime + deltaTime * playbackSpeed;

      // Loop back to start if past duration
      if (newTime >= duration) {
        setIsPlaying(false);
        return duration;
      }

      // Get interpolated states
      const interpolatedStates = getInterpolatedStates(newTime);

      // Notify time update
      if (onTimeUpdate) {
        onTimeUpdate(newTime, interpolatedStates);
      }

      return newTime;
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [playbackSpeed, duration, getInterpolatedStates, onTimeUpdate]);

  /**
   * Start playback
   */
  const play = useCallback(() => {
    if (currentTime >= duration) {
      setCurrentTime(0);
    }
    setIsPlaying(true);
    lastFrameTimeRef.current = 0;
  }, [currentTime, duration]);

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    setIsPlaying(false);
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  /**
   * Stop playback and reset to start
   */
  const stop = useCallback(() => {
    pause();
    setCurrentTime(0);
  }, [pause]);

  /**
   * Seek to specific time
   */
  const seek = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(time, duration));
    setCurrentTime(clampedTime);

    // Update interpolated states for new time
    const interpolatedStates = getInterpolatedStates(clampedTime);
    if (onTimeUpdate) {
      onTimeUpdate(clampedTime, interpolatedStates);
    }
  }, [duration, getInterpolatedStates, onTimeUpdate]);

  /**
   * Step forward/backward by one frame
   */
  const stepForward = useCallback(() => {
    const frameTime = 1 / fps;
    seek(Math.min(currentTime + frameTime, duration));
  }, [currentTime, duration, fps, seek]);

  const stepBackward = useCallback(() => {
    const frameTime = 1 / fps;
    seek(Math.max(currentTime - frameTime, 0));
  }, [currentTime, fps, seek]);

  /**
   * Jump to specific keyframe
   */
  const jumpToKeyframe = useCallback((keyframeIndex: number) => {
    if (keyframeIndex >= 0 && keyframeIndex < keyframes.length) {
      seek(keyframes[keyframeIndex].timestamp);
    }
  }, [keyframes, seek]);

  // Animation loop effect
  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, animate]);

  return {
    // Playback state
    isPlaying,
    currentTime,
    playbackSpeed,
    duration,

    // Playback controls
    play,
    pause,
    stop,
    seek,
    stepForward,
    stepBackward,
    jumpToKeyframe,
    setPlaybackSpeed,

    // Utilities
    getInterpolatedStates
  };
}
