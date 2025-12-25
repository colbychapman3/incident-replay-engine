import { Point } from '@/types/scene';
import { Polygon } from '@/types/envelopes';

export function distance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function lineIntersectsPolygon(
  line: { start: Point; end: Point },
  polygon: Polygon
): boolean {
  // TODO: Implement ray-casting algorithm
  return false;
}

export function polygonIntersects(a: Polygon, b: Polygon): boolean {
  // TODO: Implement SAT (Separating Axis Theorem)
  return false;
}

export function createArcPolygon(
  center: Point,
  startAngle: number,
  endAngle: number,
  radius: number,
  segments: number = 32
): Polygon {
  const points: Point[] = [center];

  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / segments);
    const radian = (angle * Math.PI) / 180;

    points.push({
      x: center.x + Math.cos(radian) * radius,
      y: center.y + Math.sin(radian) * radius
    });
  }

  return { points, closed: true };
}
