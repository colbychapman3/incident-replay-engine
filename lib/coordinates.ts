import { Point } from '@/types/scene';

export interface CoordinateSystem {
  pixelsPerMeter: number;
  origin: Point;
  bounds: { width: number; height: number };
}

export function worldToCanvas(point: Point, system: CoordinateSystem): Point {
  return {
    x: point.x * system.pixelsPerMeter,
    y: point.y * system.pixelsPerMeter
  };
}

export function canvasToWorld(point: Point, system: CoordinateSystem): Point {
  return {
    x: point.x / system.pixelsPerMeter,
    y: point.y / system.pixelsPerMeter
  };
}
