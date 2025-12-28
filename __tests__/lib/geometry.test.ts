import {
  distance,
  normalizeAngle,
  angleBetween,
  pointInPolygon,
  lineIntersectsPolygon,
  polygonIntersects,
  createArcPolygon,
  createRectanglePolygon
} from '@/lib/geometry';
import { Point } from '@/types/scene';
import { Polygon } from '@/types/envelopes';

describe('geometry utilities', () => {
  describe('distance', () => {
    it('should calculate distance between two points', () => {
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 3, y: 4 };
      expect(distance(a, b)).toBe(5);
    });

    it('should handle zero distance', () => {
      const a: Point = { x: 5, y: 5 };
      const b: Point = { x: 5, y: 5 };
      expect(distance(a, b)).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const a: Point = { x: -3, y: -4 };
      const b: Point = { x: 0, y: 0 };
      expect(distance(a, b)).toBe(5);
    });
  });

  describe('normalizeAngle', () => {
    it('should normalize positive angles', () => {
      expect(normalizeAngle(45)).toBe(45);
      expect(normalizeAngle(360)).toBe(0);
      expect(normalizeAngle(450)).toBe(90);
    });

    it('should normalize negative angles', () => {
      expect(normalizeAngle(-45)).toBe(315);
      expect(normalizeAngle(-360)).toBe(0);
      expect(normalizeAngle(-90)).toBe(270);
    });

    it('should handle wraparound', () => {
      expect(normalizeAngle(350)).toBe(350);
      expect(normalizeAngle(370)).toBe(10);
      expect(normalizeAngle(-10)).toBe(350);
    });
  });

  describe('angleBetween', () => {
    it('should calculate angle from origin', () => {
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 1, y: 0 };
      expect(angleBetween(from, to)).toBe(0);
    });

    it('should calculate 90 degree angle', () => {
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 0, y: 1 };
      expect(angleBetween(from, to)).toBe(90);
    });

    it('should calculate 180 degree angle', () => {
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: -1, y: 0 };
      expect(angleBetween(from, to)).toBe(180);
    });

    it('should calculate 270 degree angle', () => {
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 0, y: -1 };
      expect(angleBetween(from, to)).toBe(270);
    });
  });

  describe('pointInPolygon', () => {
    const square: Polygon = {
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ],
      closed: true
    };

    it('should detect point inside polygon', () => {
      expect(pointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
    });

    it('should detect point outside polygon', () => {
      expect(pointInPolygon({ x: 15, y: 5 }, square)).toBe(false);
      expect(pointInPolygon({ x: -5, y: 5 }, square)).toBe(false);
    });

    it('should handle point on edge', () => {
      expect(pointInPolygon({ x: 0, y: 5 }, square)).toBe(false);
    });
  });

  describe('lineIntersectsPolygon', () => {
    const square: Polygon = {
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ],
      closed: true
    };

    it('should detect line crossing polygon', () => {
      const line = {
        start: { x: -5, y: 5 },
        end: { x: 15, y: 5 }
      };
      expect(lineIntersectsPolygon(line, square)).toBe(true);
    });

    it('should detect line starting inside polygon', () => {
      const line = {
        start: { x: 5, y: 5 },
        end: { x: 15, y: 5 }
      };
      expect(lineIntersectsPolygon(line, square)).toBe(true);
    });

    it('should detect line not intersecting', () => {
      const line = {
        start: { x: -10, y: 5 },
        end: { x: -5, y: 5 }
      };
      expect(lineIntersectsPolygon(line, square)).toBe(false);
    });
  });

  describe('polygonIntersects', () => {
    const square1: Polygon = {
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ],
      closed: true
    };

    it('should detect overlapping polygons', () => {
      const square2: Polygon = {
        points: [
          { x: 5, y: 5 },
          { x: 15, y: 5 },
          { x: 15, y: 15 },
          { x: 5, y: 15 }
        ],
        closed: true
      };
      expect(polygonIntersects(square1, square2)).toBe(true);
    });

    it('should detect non-overlapping polygons', () => {
      const square2: Polygon = {
        points: [
          { x: 20, y: 20 },
          { x: 30, y: 20 },
          { x: 30, y: 30 },
          { x: 20, y: 30 }
        ],
        closed: true
      };
      expect(polygonIntersects(square1, square2)).toBe(false);
    });

    it('should detect touching polygons', () => {
      const square2: Polygon = {
        points: [
          { x: 10, y: 0 },
          { x: 20, y: 0 },
          { x: 20, y: 10 },
          { x: 10, y: 10 }
        ],
        closed: true
      };
      expect(polygonIntersects(square1, square2)).toBe(true);
    });
  });

  describe('createArcPolygon', () => {
    it('should create arc with correct center', () => {
      const center: Point = { x: 10, y: 20 };
      const arc = createArcPolygon(center, 0, 90, 15);

      expect(arc.points[0]).toEqual(center);
      expect(arc.closed).toBe(true);
    });

    it('should create full circle', () => {
      const arc = createArcPolygon({ x: 0, y: 0 }, 0, 360, 10, 8);

      // Should have center + 9 points (8 segments + 1)
      expect(arc.points.length).toBe(10);
    });

    it('should handle angle wraparound', () => {
      const arc = createArcPolygon({ x: 0, y: 0 }, 350, 10, 10, 4);

      expect(arc.points.length).toBeGreaterThan(1);
      expect(arc.closed).toBe(true);
    });
  });

  describe('createRectanglePolygon', () => {
    it('should create unrotated rectangle', () => {
      const rect = createRectanglePolygon({ x: 0, y: 0 }, 10, 6, 0);

      expect(rect.points).toHaveLength(4);
      expect(rect.closed).toBe(true);

      // Check approximate corners
      expect(rect.points[0].x).toBeCloseTo(-5);
      expect(rect.points[0].y).toBeCloseTo(-3);
    });

    it('should rotate rectangle 90 degrees', () => {
      const rect = createRectanglePolygon({ x: 0, y: 0 }, 10, 6, 90);

      expect(rect.points).toHaveLength(4);

      // After 90° rotation, width and height swap
      expect(rect.points[0].x).toBeCloseTo(3);
      expect(rect.points[0].y).toBeCloseTo(-5);
    });

    it('should translate rectangle', () => {
      const rect = createRectanglePolygon({ x: 100, y: 200 }, 10, 6, 0);

      // All points should be offset by center
      expect(rect.points[0].x).toBeCloseTo(95);
      expect(rect.points[0].y).toBeCloseTo(197);
    });
  });
});
