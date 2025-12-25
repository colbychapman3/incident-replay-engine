import { Point } from './scene';

export interface Polygon {
  points: Point[];
  closed: boolean;
}

export interface ForkliftVisionEnvelope {
  visionCone: Polygon;
  blindSpots: Polygon[];
}

export interface MAFISwingEnvelope {
  innerSweep: Polygon;
  outerSweep: Polygon;
  pivotPoint: Point;
}

export interface SpotterLOS {
  visionLines: { start: Point; end: Point }[];
  obstructed: boolean;
  obstructions: string[]; // Object IDs
}

export interface RampClearanceZone {
  rampBounds: Polygon;
  clearanceHeight: number;
  violations: {
    objectId: string;
    objectHeight: number;
    exceedance: number;
  }[];
}

export type OperationalEnvelope =
  | ForkliftVisionEnvelope
  | MAFISwingEnvelope
  | SpotterLOS
  | RampClearanceZone;
