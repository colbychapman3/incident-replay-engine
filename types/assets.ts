import { Point } from './scene';

export interface VehicleAsset {
  id: string;
  type: 'vehicle';
  subtype: 'mafi-truck' | 'mafi-trailer' | 'forklift' | 'pov' | 'gear-wagon' | 'water-van';
  displayName: string;
  dimensions: { width: number; height: number };
  pivotPoint: Point;
  constraints: {
    turningRadius?: number;
    maxSpeed?: number;
    rearWheelSteering?: boolean;
  };
  imagePath: string;
  boundingBox: Point[];
}

export interface ActorAsset {
  id: string;
  type: 'actor';
  role: 'driver' | 'spotter' | 'flagger' | 'header' | 'stevedore' | 'gear-person' | 'water-person' | 'chief-officer' | 'shipmate';
  displayName: string;
  dimensions: { width: number; height: number };
  ppeConfig: {
    hardHat: boolean;
    vest: boolean;
    gloves: boolean;
    steelToes: boolean;
  };
  visionRange: number;
  imagePath: string;
}

export interface SafetyObjectAsset {
  id: string;
  type: 'safety-object';
  subtype: 'cone' | 'tape' | 'sign' | 'arrow' | 'marker';
  displayName: string;
  dimensions: { width: number; height: number };
  imagePath: string;
}

export type Asset = VehicleAsset | ActorAsset | SafetyObjectAsset;
