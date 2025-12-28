import { Point, Polygon } from '@/types/geometry';
import { SpotterLOSEnvelope } from '@/types/envelopes';
import { distance, lineIntersectsPolygon } from '@/lib/geometry';

/**
 * Spotter Line-of-Sight Indicators
 *
 * Ray-casting from spotter to target with obstruction detection
 * Green solid line = clear, Red dashed line = obstructed
 */

interface SpotterObject {
  id: string;
  position: Point;
  visionRange: number; // From asset definition
}

interface TargetObject {
  id: string;
  position: Point;
  boundingBox?: Polygon; // Object's bounding polygon
}

interface ObstacleObject {
  id: string;
  position: Point;
  boundingBox: Polygon; // Obstacle's bounding polygon
}

interface SpotterLOSInput {
  spotter: SpotterObject;
  target: TargetObject;
  obstacles: ObstacleObject[]; // All other objects that could obstruct view
}

export function calculateSpotterLOS(input: SpotterLOSInput): SpotterLOSEnvelope {
  const { spotter, target, obstacles } = input;

  const start = spotter.position;
  const end = target.position;
  const totalDistance = distance(start, end);

  // Check if target is within spotter's vision range
  const inRange = totalDistance <= spotter.visionRange;

  // Ray-cast from spotter to target
  const sightLine = {
    start: start,
    end: end
  };

  let obstructed = false;
  const obstructionPoints: Point[] = [];

  if (inRange) {
    // Check each obstacle for intersection
    for (const obstacle of obstacles) {
      // Skip if obstacle is the spotter or target
      if (obstacle.id === spotter.id || obstacle.id === target.id) {
        continue;
      }

      // Check if sight line intersects obstacle bounding box
      if (lineIntersectsPolygon(sightLine, obstacle.boundingBox)) {
        obstructed = true;
        // Mark obstruction point (use obstacle center for simplicity)
        obstructionPoints.push(obstacle.position);
      }
    }
  } else {
    // Target out of range counts as obstructed
    obstructed = true;
  }

  const clearRange = obstructed
    ? (obstructionPoints.length > 0
        ? distance(start, obstructionPoints[0])
        : 0)
    : totalDistance;

  return {
    type: 'spotter-los' as const,
    spotterId: spotter.id,
    targetId: target.id,
    sightLine: {
      start,
      end,
      obstructed,
      obstructionPoints
    },
    clearRange
  };
}

/**
 * Calculate all LOS envelopes for all spotters in scene
 */
export function calculateAllSpotterLOS(
  spotters: SpotterObject[],
  targets: TargetObject[],
  obstacles: ObstacleObject[]
): SpotterLOSEnvelope[] {
  const envelopes: SpotterLOSEnvelope[] = [];

  for (const spotter of spotters) {
    for (const target of targets) {
      // Skip if spotter is looking at themselves
      if (spotter.id === target.id) continue;

      const envelope = calculateSpotterLOS({
        spotter,
        target,
        obstacles: obstacles.filter(o => o.id !== spotter.id && o.id !== target.id)
      });

      envelopes.push(envelope);
    }
  }

  return envelopes;
}
