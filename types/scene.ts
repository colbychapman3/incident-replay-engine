export interface Point {
  x: number;
  y: number;
}

export interface SceneState {
  currentKeyframe: number;
  objects: SceneObject[];
  selectedIds: string[];
  envelopeVisibility: EnvelopeVisibilityConfig;
  changeHistory: ChangeRecord[];
  timeline: Timeline;
  undoStack: SceneSnapshot[];
  redoStack: SceneSnapshot[];
}

export interface SceneSnapshot {
  objects: SceneObject[];
  selectedIds: string[];
  currentKeyframe: number;
  envelopeVisibility: EnvelopeVisibilityConfig;
}

export interface SceneObject {
  id: string;
  assetId: string;
  type: 'vehicle' | 'actor' | 'safety-object';
  locked: boolean;
  properties: Record<string, any>;
}

export type SceneAction =
  | { type: 'ADD_OBJECT'; payload: SceneObject }
  | { type: 'MOVE_OBJECT'; payload: { id: string; position: Point } }
  | { type: 'ROTATE_OBJECT'; payload: { id: string; rotation: number } }
  | { type: 'DELETE_OBJECT'; payload: { id: string } }
  | { type: 'SET_KEYFRAME'; payload: number }
  | { type: 'TOGGLE_ENVELOPE'; payload: EnvelopeType }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export interface EnvelopeVisibilityConfig {
  forkliftVision: boolean;
  mafiSwing: boolean;
  spotterLOS: boolean;
  rampClearance: boolean;
}

export interface ChangeRecord {
  id: string;
  action: string;
  timestamp: number;
  oldValue: any;
  newValue: any;
}

export type EnvelopeType = 'forkliftVision' | 'mafiSwing' | 'spotterLOS' | 'rampClearance';

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
