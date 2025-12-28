import { Point, Polygon } from '@/types/geometry';
import { RampClearanceEnvelope } from '@/types/envelopes';
import { pointInPolygon } from '@/lib/geometry';

/**
 * Ramp Clearance Height Zones
 *
 * Detects when vehicle height exceeds ramp clearance
 * Purple dashed boundary with red violation markers
 */

interface RampObject {
  id: string;
  position: Point;
  boundary: Polygon; // Ramp area
  clearanceHeight: number; // Maximum allowed height in meters (e.g., 3.5m)
}

interface VehicleObject {
  id: string;
  position: Point;
  height: number; // Vehicle height in meters
  boundingBox?: Polygon;
}

interface RampClearanceInput {
  ramp: RampObject;
  vehicles: VehicleObject[];
}

export function calculateRampClearance(input: RampClearanceInput): RampClearanceEnvelope {
  const { ramp, vehicles } = input;

  const violations: RampClearanceEnvelope['violations'] = [];

  // Check each vehicle
  for (const vehicle of vehicles) {
    // Check if vehicle is within ramp boundary
    const isOnRamp = pointInPolygon(vehicle.position, ramp.boundary);

    if (isOnRamp) {
      // Check if vehicle height exceeds clearance
      if (vehicle.height > ramp.clearanceHeight) {
        const exceedance = vehicle.height - ramp.clearanceHeight;

        violations.push({
          vehicleId: vehicle.id,
          vehicleHeight: vehicle.height,
          exceedance,
          position: vehicle.position
        });
      }
    }
  }

  return {
    type: 'ramp-clearance' as const,
    rampId: ramp.id,
    clearanceHeight: ramp.clearanceHeight,
    boundary: ramp.boundary,
    violations
  };
}

/**
 * Calculate clearance for all ramps in scene
 */
export function calculateAllRampClearances(
  ramps: RampObject[],
  vehicles: VehicleObject[]
): RampClearanceEnvelope[] {
  return ramps.map(ramp => calculateRampClearance({ ramp, vehicles }));
}
