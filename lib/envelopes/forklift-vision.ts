import { Point, Polygon } from '@/types/geometry';
import { ForkliftVisionEnvelope } from '@/types/envelopes';
import { createArcPolygon, normalizeAngle } from '@/lib/geometry';

/**
 * Forklift Visibility Cone & Blind Spot Overlay
 *
 * Vision cone: 120° arc, 15m range from driver position
 * Blind spots: Rear area, fork area, load-obstructed zones
 */

interface ForkliftObject {
  id: string;
  position: Point; // Driver position (world coordinates)
  rotation: number; // Degrees (0 = facing right/east)
  forkHeight?: number; // Meters above ground
  hasLoad?: boolean; // Is forklift carrying a load?
}

export function calculateForkliftVision(forklift: ForkliftObject): ForkliftVisionEnvelope {
  const { position, rotation, forkHeight = 0, hasLoad = false } = forklift;

  // Vision cone: 120° arc centered on heading
  // Driver sits at rear of forklift, looking forward
  const visionStartAngle = normalizeAngle(rotation - 60); // 60° left of heading
  const visionEndAngle = normalizeAngle(rotation + 60); // 60° right of heading
  const visionRange = 15; // meters

  const visionCone = createArcPolygon(
    position,
    visionStartAngle,
    visionEndAngle,
    visionRange,
    24 // segments for smooth arc
  );

  // Blind spots
  const blindSpots: Polygon[] = [];

  // 1. Rear blind spot (180° behind, 3m range)
  const rearBlindStartAngle = normalizeAngle(rotation + 120);
  const rearBlindEndAngle = normalizeAngle(rotation + 240);
  const rearBlindSpot = createArcPolygon(
    position,
    rearBlindStartAngle,
    rearBlindEndAngle,
    3, // 3m rear blind zone
    12
  );
  blindSpots.push(rearBlindSpot);

  // 2. Fork blind spot (directly in front, close range)
  // Forks create blind spot 0-2m in front
  const forkBlindStartAngle = normalizeAngle(rotation - 30);
  const forkBlindEndAngle = normalizeAngle(rotation + 30);
  const forkBlindSpot = createArcPolygon(
    position,
    forkBlindStartAngle,
    forkBlindEndAngle,
    2, // 2m fork blind zone
    8
  );
  blindSpots.push(forkBlindSpot);

  // 3. Load obstruction blind spot (if carrying load)
  if (hasLoad && forkHeight > 1.0) {
    // Load blocks vision 2-8m in front
    const loadBlindStartAngle = normalizeAngle(rotation - 45);
    const loadBlindEndAngle = normalizeAngle(rotation + 45);
    const loadBlindSpot = createArcPolygon(
      position,
      loadBlindStartAngle,
      loadBlindEndAngle,
      8, // 8m load obstruction zone
      12
    );
    blindSpots.push(loadBlindSpot);
  }

  return {
    type: 'forklift-vision' as const,
    objectId: forklift.id,
    visionCone,
    blindSpots,
    forkHeight,
    loadObstructed: hasLoad && forkHeight > 1.0
  };
}
