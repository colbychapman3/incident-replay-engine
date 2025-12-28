/**
 * Geometry type definitions
 */

export interface Point {
  x: number;
  y: number;
}

export interface Polygon {
  points: Point[];
  closed: boolean;
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Circle {
  center: Point;
  radius: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}
