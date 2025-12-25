import { Point } from './scene';

export interface Timeline {
  keyframes: Keyframe[];
  duration: number;
  fps: number;
}

export interface Keyframe {
  id: string;
  timestamp: number;
  label: string;
  description?: string;
  objectStates: Record<string, ObjectState>;
}

export interface ObjectState {
  position: Point;
  rotation: number;
  properties: Record<string, any>;
  visible: boolean;
}

export interface InterpolationConfig {
  method: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  propertyOverrides?: Record<string, 'linear' | 'step'>;
}
