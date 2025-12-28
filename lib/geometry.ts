import { Point } from '@/types/scene';
import { Polygon } from '@/types/geometry';

/**
 * Calculate Euclidean distance between two points
 */
export function distance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * Calculate angle between two points in degrees (0-360)
 */
export function angleBetween(from: Point, to: Point): number {
  const radians = Math.atan2(to.y - from.y, to.x - from.x);
  const degrees = radians * (180 / Math.PI);
  return normalizeAngle(degrees);
}

/**
 * Check if a point is inside a polygon using ray-casting algorithm
 */
export function pointInPolygon(point: Point, polygon: Polygon): boolean {
  const { points } = polygon;
  let inside = false;

  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x;
    const yi = points[i].y;
    const xj = points[j].x;
    const yj = points[j].y;

    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Check if a line segment intersects with a polygon
 * Uses line-segment intersection tests for each polygon edge
 */
export function lineIntersectsPolygon(
  line: { start: Point; end: Point },
  polygon: Polygon
): boolean {
  const { points } = polygon;

  // Check if either endpoint is inside the polygon
  if (pointInPolygon(line.start, polygon) || pointInPolygon(line.end, polygon)) {
    return true;
  }

  // Check if line intersects any polygon edge
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const edge = { start: points[i], end: points[j] };

    if (lineSegmentsIntersect(line.start, line.end, edge.start, edge.end)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if two line segments intersect
 */
function lineSegmentsIntersect(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): boolean {
  const d1 = direction(p3, p4, p1);
  const d2 = direction(p3, p4, p2);
  const d3 = direction(p1, p2, p3);
  const d4 = direction(p1, p2, p4);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }

  if (d1 === 0 && onSegment(p3, p4, p1)) return true;
  if (d2 === 0 && onSegment(p3, p4, p2)) return true;
  if (d3 === 0 && onSegment(p1, p2, p3)) return true;
  if (d4 === 0 && onSegment(p1, p2, p4)) return true;

  return false;
}

/**
 * Calculate the direction of point c relative to line segment ab
 */
function direction(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

/**
 * Check if point c lies on line segment ab
 */
function onSegment(a: Point, b: Point, c: Point): boolean {
  return Math.min(a.x, b.x) <= c.x && c.x <= Math.max(a.x, b.x) &&
         Math.min(a.y, b.y) <= c.y && c.y <= Math.max(a.y, b.y);
}

/**
 * Check if two polygons intersect using Separating Axis Theorem (SAT)
 */
export function polygonIntersects(a: Polygon, b: Polygon): boolean {
  // Get all edges as normals for both polygons
  const axesA = getPolygonAxes(a);
  const axesB = getPolygonAxes(b);
  const axes = [...axesA, ...axesB];

  // Test each axis
  for (const axis of axes) {
    const projA = projectPolygon(a, axis);
    const projB = projectPolygon(b, axis);

    // If projections don't overlap, polygons don't intersect
    if (projA.max < projB.min || projB.max < projA.min) {
      return false;
    }
  }

  // All axes overlap, polygons intersect
  return true;
}

/**
 * Get perpendicular axes (normals) for polygon edges
 */
function getPolygonAxes(polygon: Polygon): Point[] {
  const { points } = polygon;
  const axes: Point[] = [];

  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const edge = {
      x: points[j].x - points[i].x,
      y: points[j].y - points[i].y
    };

    // Perpendicular (normal)
    const normal = { x: -edge.y, y: edge.x };

    // Normalize
    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
    if (length > 0) {
      axes.push({ x: normal.x / length, y: normal.y / length });
    }
  }

  return axes;
}

/**
 * Project polygon onto axis
 */
function projectPolygon(polygon: Polygon, axis: Point): { min: number; max: number } {
  const { points } = polygon;
  let min = dotProduct(points[0], axis);
  let max = min;

  for (let i = 1; i < points.length; i++) {
    const projection = dotProduct(points[i], axis);
    if (projection < min) min = projection;
    if (projection > max) max = projection;
  }

  return { min, max };
}

/**
 * Calculate dot product of two points (vectors)
 */
function dotProduct(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y;
}

/**
 * Create an arc polygon (pie slice)
 * Used for visibility cones, turning radii, etc.
 */
export function createArcPolygon(
  center: Point,
  startAngle: number,
  endAngle: number,
  radius: number,
  segments: number = 32
): Polygon {
  const points: Point[] = [center];

  // Normalize angles
  const start = normalizeAngle(startAngle);
  const end = normalizeAngle(endAngle);

  // Handle wraparound (e.g., 350° to 10°)
  let angleSpan = end - start;
  if (angleSpan < 0) {
    angleSpan += 360;
  }

  for (let i = 0; i <= segments; i++) {
    const angle = start + (angleSpan * i) / segments;
    const radian = (angle * Math.PI) / 180;

    points.push({
      x: center.x + Math.cos(radian) * radius,
      y: center.y + Math.sin(radian) * radius
    });
  }

  return { points, closed: true };
}

/**
 * Create a rectangle polygon
 */
export function createRectanglePolygon(
  center: Point,
  width: number,
  height: number,
  rotation: number = 0
): Polygon {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // Create rectangle corners (unrotated)
  const corners = [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight }
  ];

  // Rotate and translate
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const points = corners.map(corner => ({
    x: center.x + corner.x * cos - corner.y * sin,
    y: center.y + corner.x * sin + corner.y * cos
  }));

  return { points, closed: true };
}
