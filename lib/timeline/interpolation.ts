import { Point } from '@/types/scene';
import { normalizeAngle } from '@/lib/geometry';

/**
 * Linear Interpolation for Timeline Animation
 *
 * Court-safe interpolation between keyframes for incident replay.
 * All interpolation is linear (no physics assumptions).
 */

/**
 * Linear interpolation between two points
 * @param start - Starting point (world coordinates, meters)
 * @param end - Ending point (world coordinates, meters)
 * @param t - Interpolation factor (0 to 1)
 * @returns Interpolated point
 */
export function lerpPoint(start: Point, end: Point, t: number): Point {
  // Clamp t to [0, 1]
  const clamped = Math.max(0, Math.min(1, t));

  return {
    x: start.x + (end.x - start.x) * clamped,
    y: start.y + (end.y - start.y) * clamped
  };
}

/**
 * Linear interpolation for rotation angles with proper wrapping
 * Handles 0°/360° boundary correctly (shortest path)
 *
 * @param start - Starting angle in degrees (0-360)
 * @param end - Ending angle in degrees (0-360)
 * @param t - Interpolation factor (0 to 1)
 * @returns Interpolated angle in degrees (0-360)
 *
 * @example
 * lerpAngle(350, 10, 0.5) // => 0 (crosses 0° boundary via shortest path)
 * lerpAngle(10, 350, 0.5) // => 0 (crosses 0° boundary via shortest path)
 * lerpAngle(90, 270, 0.5) // => 180 (straight line interpolation)
 */
export function lerpAngle(start: number, end: number, t: number): number {
  // Clamp t to [0, 1]
  const clamped = Math.max(0, Math.min(1, t));

  // Normalize both angles to [0, 360)
  const startNorm = normalizeAngle(start);
  const endNorm = normalizeAngle(end);

  // Calculate the shortest angular distance
  let delta = endNorm - startNorm;

  // If delta > 180, go the other way (shorter path)
  if (delta > 180) {
    delta = delta - 360;
  } else if (delta < -180) {
    delta = delta + 360;
  }

  // Interpolate along shortest path
  const interpolated = startNorm + delta * clamped;

  // Normalize result to [0, 360)
  return normalizeAngle(interpolated);
}

/**
 * Linear interpolation for numeric properties
 * @param start - Starting value
 * @param end - Ending value
 * @param t - Interpolation factor (0 to 1)
 * @returns Interpolated value
 */
export function lerpNumber(start: number, end: number, t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return start + (end - start) * clamped;
}

/**
 * Interpolate between two object states
 * Handles position, rotation, and numeric properties
 *
 * @param start - Starting object state
 * @param end - Ending object state
 * @param t - Interpolation factor (0 to 1)
 * @returns Interpolated object state
 */
export function lerpObjectState(
  start: {
    position: Point;
    rotation: number;
    properties: Record<string, any>;
    visible: boolean;
  },
  end: {
    position: Point;
    rotation: number;
    properties: Record<string, any>;
    visible: boolean;
  },
  t: number
): {
  position: Point;
  rotation: number;
  properties: Record<string, any>;
  visible: boolean;
} {
  // Position interpolation
  const position = lerpPoint(start.position, end.position, t);

  // Rotation interpolation (with angle wrapping)
  const rotation = lerpAngle(start.rotation, end.rotation, t);

  // Properties interpolation
  const properties: Record<string, any> = {};

  // Merge all keys from both states
  const allKeys = new Set([
    ...Object.keys(start.properties),
    ...Object.keys(end.properties)
  ]);

  for (const key of allKeys) {
    const startVal = start.properties[key];
    const endVal = end.properties[key];

    // If both are numbers, interpolate
    if (typeof startVal === 'number' && typeof endVal === 'number') {
      properties[key] = lerpNumber(startVal, endVal, t);
    }
    // If one is missing, use whichever exists (step interpolation)
    else if (startVal !== undefined && endVal === undefined) {
      properties[key] = startVal;
    } else if (startVal === undefined && endVal !== undefined) {
      properties[key] = endVal;
    }
    // For other types (strings, booleans), use step interpolation (switch at t=0.5)
    else {
      properties[key] = t < 0.5 ? startVal : endVal;
    }
  }

  // Visibility: step interpolation at t=0.5
  const visible = t < 0.5 ? start.visible : end.visible;

  return {
    position,
    rotation,
    properties,
    visible
  };
}

/**
 * Calculate interpolation factor (t) between two keyframes
 *
 * @param currentTime - Current time in seconds
 * @param startTime - Start keyframe time in seconds
 * @param endTime - End keyframe time in seconds
 * @returns Interpolation factor (0 to 1), clamped
 */
export function calculateInterpolationFactor(
  currentTime: number,
  startTime: number,
  endTime: number
): number {
  if (endTime === startTime) {
    return 0;
  }

  const t = (currentTime - startTime) / (endTime - startTime);
  return Math.max(0, Math.min(1, t));
}

/**
 * Find the two keyframes that surround a given time
 * Returns indices of [startKeyframe, endKeyframe]
 *
 * @param keyframes - Array of keyframes (sorted by timestamp)
 * @param currentTime - Current time in seconds
 * @returns [startIndex, endIndex] or null if before first/after last keyframe
 */
export function findSurroundingKeyframes(
  keyframes: Array<{ timestamp: number }>,
  currentTime: number
): [number, number] | null {
  if (keyframes.length === 0) {
    return null;
  }

  // Before first keyframe
  if (currentTime < keyframes[0].timestamp) {
    return [0, 0];
  }

  // After last keyframe
  if (currentTime >= keyframes[keyframes.length - 1].timestamp) {
    const lastIndex = keyframes.length - 1;
    return [lastIndex, lastIndex];
  }

  // Find surrounding keyframes
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (currentTime >= keyframes[i].timestamp && currentTime < keyframes[i + 1].timestamp) {
      return [i, i + 1];
    }
  }

  // Fallback (shouldn't reach here)
  return null;
}
