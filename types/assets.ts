import { Point } from './scene';

export interface VehicleAsset {
  id: string;
  type: 'vehicle';
  name: string;
  category: 'vehicle';
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  pivotPoint: Point;
  turningRadius: number;
  metadata?: Record<string, any>;
}

export interface ActorAsset {
  id: string;
  type: 'actor';
  name: string;
  category: 'actor';
  role: 'driver' | 'spotter' | 'flagger' | 'header' | 'stevedore' | 'gear-person' | 'water-person' | 'chief-officer' | 'shipmate';
  ppeColor: string;
  visionRange: number;
  metadata?: Record<string, any>;
}

export interface SafetyObjectAsset {
  id: string;
  type: 'safety-object';
  name: string;
  category: 'safety-object';
  purpose: 'traffic-control' | 'area-restriction' | 'guidance';
  dimensions: {
    width: number;
    height: number;
  };
  metadata?: Record<string, any>;
}

export type AssetDefinition = VehicleAsset | ActorAsset | SafetyObjectAsset;
