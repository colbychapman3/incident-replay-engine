import { Point, Polygon } from './geometry';

/**
 * Envelope type definitions for Phase 3
 * All calculations use world coordinates (meters)
 */

// Forklift Vision Envelope
export interface ForkliftVisionEnvelope {
  type: 'forklift-vision';
  objectId: string;
  visionCone: Polygon; // 120° arc, 15m range
  blindSpots: Polygon[]; // Rear, forks, load-obstructed areas
  forkHeight: number; // Meters above ground
  loadObstructed: boolean; // True if load blocks vision
}

// MAFI Trailer Swing Envelope
export interface MafiSwingEnvelope {
  type: 'mafi-swing';
  truckId: string;
  trailerId: string;
  articulationAngle: number; // Degrees (-45 to +45)
  innerSweep: Polygon; // Inner arc during turn
  outerSweep: Polygon; // Outer arc during turn
  pivotPoint: Point; // Rear axle of truck
  turningRadius: number; // Meters
}

// Spotter Line-of-Sight Envelope
export interface SpotterLOSEnvelope {
  type: 'spotter-los';
  spotterId: string;
  targetId: string;
  sightLine: {
    start: Point;
    end: Point;
    obstructed: boolean;
    obstructionPoints: Point[]; // Points where line is blocked
  };
  clearRange: number; // Unobstructed distance in meters
}

// Ramp Clearance Envelope
export interface RampClearanceEnvelope {
  type: 'ramp-clearance';
  rampId: string;
  clearanceHeight: number; // Meters
  boundary: Polygon; // Ramp boundary
  violations: Array<{
    vehicleId: string;
    vehicleHeight: number;
    exceedance: number; // Meters exceeding limit (e.g., +0.7m)
    position: Point;
  }>;
}

// Union type for all envelopes
export type OperationalEnvelope =
  | ForkliftVisionEnvelope
  | MafiSwingEnvelope
  | SpotterLOSEnvelope
  | RampClearanceEnvelope;

// Envelope calculation inputs
export interface EnvelopeCalculationContext {
  objects: Array<{
    id: string;
    assetId: string;
    type: 'vehicle' | 'actor' | 'safety-object';
    position: Point;
    rotation: number;
    properties: Record<string, any>;
  }>;
  visibility: {
    forkliftVision: boolean;
    mafiSwing: boolean;
    spotterLOS: boolean;
    rampClearance: boolean;
  };
}
