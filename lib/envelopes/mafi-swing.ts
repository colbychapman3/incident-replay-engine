import { Point, Polygon } from '@/types/geometry';
import { MafiSwingEnvelope } from '@/types/envelopes';
import { createArcPolygon, distance } from '@/lib/geometry';

/**
 * MAFI Trailer Swing Envelope During Turns
 *
 * Calculates inner/outer sweep path during articulated turns
 * Pivot point: Rear axle of truck
 */

interface MafiTruckTrailerPair {
  truckId: string;
  trailerId: string;
  truckPosition: Point; // Rear axle position
  truckRotation: number; // Heading in degrees
  trailerPosition: Point;
  trailerRotation: number;
  articulationAngle: number; // Angle between truck and trailer (-45 to +45)
  trailerLength: number; // Length of trailer in meters
  trailerWidth: number; // Width of trailer in meters
}

export function calculateMafiSwing(pair: MafiTruckTrailerPair): MafiSwingEnvelope {
  const {
    truckId,
    trailerId,
    truckPosition,
    truckRotation,
    articulationAngle,
    trailerLength = 12.0,
    trailerWidth = 2.5
  } = pair;

  // Pivot point is the rear axle of the truck
  const pivotPoint = truckPosition;

  // Calculate turning radius based on articulation
  // Turning radius increases with articulation angle
  const articulationRad = (Math.abs(articulationAngle) * Math.PI) / 180;
  const turningRadius = articulationRad > 0.01
    ? trailerLength / Math.sin(articulationRad)
    : 1000; // Straight line = very large radius

  // Inner sweep: closest point to pivot (inner rear corner of trailer)
  const innerRadius = turningRadius - trailerWidth / 2;

  // Outer sweep: farthest point from pivot (outer rear corner of trailer)
  const outerRadius = Math.sqrt(
    Math.pow(turningRadius + trailerWidth / 2, 2) + Math.pow(trailerLength, 2)
  );

  // Calculate sweep arc based on articulation direction
  const sweepAngleRange = 90; // Show 90° of potential sweep
  let startAngle: number;
  let endAngle: number;

  if (articulationAngle > 0) {
    // Turning right
    startAngle = truckRotation;
    endAngle = truckRotation + sweepAngleRange;
  } else if (articulationAngle < 0) {
    // Turning left
    startAngle = truckRotation - sweepAngleRange;
    endAngle = truckRotation;
  } else {
    // Straight (no swing)
    startAngle = truckRotation - 15;
    endAngle = truckRotation + 15;
  }

  // Create inner and outer sweep polygons
  const innerSweep = createArcPolygon(
    pivotPoint,
    startAngle,
    endAngle,
    innerRadius,
    24
  );

  const outerSweep = createArcPolygon(
    pivotPoint,
    startAngle,
    endAngle,
    outerRadius,
    24
  );

  return {
    type: 'mafi-swing' as const,
    truckId,
    trailerId,
    articulationAngle,
    innerSweep,
    outerSweep,
    pivotPoint,
    turningRadius
  };
}
