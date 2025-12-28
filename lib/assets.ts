import { AssetDefinition, VehicleAsset, ActorAsset, SafetyObjectAsset } from '@/types/assets';

/**
 * Complete asset library for Incident Replay Engine
 * 6 Vehicles + 9 Actors + 5 Safety Objects = 20 total assets
 */

// ===== VEHICLES (6) =====

export const MAFI_TRUCK: VehicleAsset = {
  id: 'mafi-truck-v1',
  type: 'vehicle',
  name: 'MAFI Truck',
  category: 'vehicle',
  dimensions: {
    length: 7.5, // meters
    width: 2.5,
    height: 3.0
  },
  pivotPoint: { x: 0, y: -2.5 }, // Rear axle
  turningRadius: 12,
  metadata: {
    steering: 'front-wheel',
    articulated: false
  }
};

export const MAFI_TRAILER: VehicleAsset = {
  id: 'mafi-trailer-v1',
  type: 'vehicle',
  name: 'MAFI Trailer',
  category: 'vehicle',
  dimensions: {
    length: 12.0,
    width: 2.5,
    height: 2.0
  },
  pivotPoint: { x: 0, y: 6.0 }, // Front hitch
  turningRadius: 15,
  metadata: {
    articulated: true,
    hitchOffset: 6.0
  }
};

export const FORKLIFT: VehicleAsset = {
  id: 'forklift-v1',
  type: 'vehicle',
  name: 'Forklift',
  category: 'vehicle',
  dimensions: {
    length: 3.0,
    width: 1.5,
    height: 2.5
  },
  pivotPoint: { x: 0, y: -1.0 }, // Rear wheels
  turningRadius: 2.5,
  metadata: {
    steering: 'rear-wheel',
    forkHeight: 0.5, // Default fork height
    maxForkHeight: 4.0,
    visionCone: {
      angle: 120,
      range: 15
    }
  }
};

export const POV: VehicleAsset = {
  id: 'pov-v1',
  type: 'vehicle',
  name: 'POV (Passenger Vehicle)',
  category: 'vehicle',
  dimensions: {
    length: 4.5,
    width: 1.8,
    height: 1.5
  },
  pivotPoint: { x: 0, y: 0 },
  turningRadius: 5.5,
  metadata: {
    steering: 'front-wheel'
  }
};

export const GEAR_WAGON: VehicleAsset = {
  id: 'gear-wagon-v1',
  type: 'vehicle',
  name: 'Gear Wagon',
  category: 'vehicle',
  dimensions: {
    length: 2.0,
    width: 1.0,
    height: 1.2
  },
  pivotPoint: { x: 0, y: 0 },
  turningRadius: 1.5,
  metadata: {
    capacity: '500kg'
  }
};

export const WATER_VAN: VehicleAsset = {
  id: 'water-van-v1',
  type: 'vehicle',
  name: 'Water Van',
  category: 'vehicle',
  dimensions: {
    length: 5.0,
    width: 2.0,
    height: 2.5
  },
  pivotPoint: { x: 0, y: 0 },
  turningRadius: 6.0,
  metadata: {
    steering: 'front-wheel'
  }
};

// ===== ACTORS (9) =====

export const DRIVER: ActorAsset = {
  id: 'driver-v1',
  type: 'actor',
  name: 'Driver',
  category: 'actor',
  role: 'driver',
  ppeColor: '#2196F3', // Blue
  visionRange: 10,
  metadata: {
    responsibilities: ['vehicle operation', 'load awareness']
  }
};

export const SPOTTER: ActorAsset = {
  id: 'spotter-v1',
  type: 'actor',
  name: 'Spotter',
  category: 'actor',
  role: 'spotter',
  ppeColor: '#FFEB3B', // High-vis yellow
  visionRange: 20,
  metadata: {
    responsibilities: ['blind spot coverage', 'hand signals'],
    lineOfSightRequired: true
  }
};

export const FLAGGER: ActorAsset = {
  id: 'flagger-v1',
  type: 'actor',
  name: 'Flagger',
  category: 'actor',
  role: 'flagger',
  ppeColor: '#FF9800', // Orange
  visionRange: 15,
  metadata: {
    responsibilities: ['traffic control', 'stop/go signals']
  }
};

export const HEADER: ActorAsset = {
  id: 'header-v1',
  type: 'actor',
  name: 'Header',
  category: 'actor',
  role: 'header',
  ppeColor: '#4CAF50', // Green
  visionRange: 12,
  metadata: {
    responsibilities: ['team coordination', 'ramp operations']
  }
};

export const STEVEDORE: ActorAsset = {
  id: 'stevedore-v1',
  type: 'actor',
  name: 'Stevedore',
  category: 'actor',
  role: 'stevedore',
  ppeColor: '#9C27B0', // Purple
  visionRange: 10,
  metadata: {
    responsibilities: ['cargo handling', 'lashing']
  }
};

export const GEAR_PERSON: ActorAsset = {
  id: 'gear-person-v1',
  type: 'actor',
  name: 'Gear Person',
  category: 'actor',
  role: 'gear-person',
  ppeColor: '#795548', // Brown
  visionRange: 10,
  metadata: {
    responsibilities: ['gear maintenance', 'equipment distribution']
  }
};

export const WATER_PERSON: ActorAsset = {
  id: 'water-person-v1',
  type: 'actor',
  name: 'Water Person',
  category: 'actor',
  role: 'water-person',
  ppeColor: '#00BCD4', // Cyan
  visionRange: 10,
  metadata: {
    responsibilities: ['hydration', 'crew welfare']
  }
};

export const CHIEF_OFFICER: ActorAsset = {
  id: 'chief-officer-v1',
  type: 'actor',
  name: 'Chief Officer',
  category: 'actor',
  role: 'chief-officer',
  ppeColor: '#F44336', // Red
  visionRange: 15,
  metadata: {
    responsibilities: ['safety oversight', 'operations management']
  }
};

export const SHIPMATE: ActorAsset = {
  id: 'shipmate-v1',
  type: 'actor',
  name: 'Shipmate',
  category: 'actor',
  role: 'shipmate',
  ppeColor: '#607D8B', // Blue-grey
  visionRange: 10,
  metadata: {
    responsibilities: ['general operations', 'assistance']
  }
};

// ===== SAFETY OBJECTS (5) =====

export const SAFETY_CONE: SafetyObjectAsset = {
  id: 'safety-cone-v1',
  type: 'safety-object',
  name: 'Safety Cone',
  category: 'safety-object',
  purpose: 'traffic-control',
  dimensions: {
    width: 0.3,
    height: 0.7
  },
  metadata: {
    color: 'orange',
    reflective: true,
    stackable: true
  }
};

export const CAUTION_TAPE: SafetyObjectAsset = {
  id: 'caution-tape-v1',
  type: 'safety-object',
  name: 'Caution Tape',
  category: 'safety-object',
  purpose: 'area-restriction',
  dimensions: {
    width: 0.05,
    height: 1.0 // Height when mounted
  },
  metadata: {
    color: 'yellow-black',
    snapToPoints: true,
    flexible: true
  }
};

export const STOP_SIGN: SafetyObjectAsset = {
  id: 'stop-sign-v1',
  type: 'safety-object',
  name: 'Stop Sign',
  category: 'safety-object',
  purpose: 'traffic-control',
  dimensions: {
    width: 0.6,
    height: 2.0 // Including pole
  },
  metadata: {
    shape: 'octagon',
    reflective: true
  }
};

export const DIRECTIONAL_ARROW: SafetyObjectAsset = {
  id: 'directional-arrow-v1',
  type: 'safety-object',
  name: 'Directional Arrow',
  category: 'safety-object',
  purpose: 'guidance',
  dimensions: {
    width: 0.5,
    height: 1.5
  },
  metadata: {
    rotatable: true,
    reflective: true
  }
};

export const RESTRICTED_ZONE_MARKER: SafetyObjectAsset = {
  id: 'restricted-zone-v1',
  type: 'safety-object',
  name: 'Restricted Zone Marker',
  category: 'safety-object',
  purpose: 'area-restriction',
  dimensions: {
    width: 1.0,
    height: 1.0
  },
  metadata: {
    color: 'red-white',
    areaMarker: true
  }
};

// ===== ASSET REGISTRY =====

export const ALL_ASSETS: AssetDefinition[] = [
  // Vehicles
  MAFI_TRUCK,
  MAFI_TRAILER,
  FORKLIFT,
  POV,
  GEAR_WAGON,
  WATER_VAN,
  // Actors
  DRIVER,
  SPOTTER,
  FLAGGER,
  HEADER,
  STEVEDORE,
  GEAR_PERSON,
  WATER_PERSON,
  CHIEF_OFFICER,
  SHIPMATE,
  // Safety Objects
  SAFETY_CONE,
  CAUTION_TAPE,
  STOP_SIGN,
  DIRECTIONAL_ARROW,
  RESTRICTED_ZONE_MARKER
];

export const VEHICLES = ALL_ASSETS.filter(a => a.type === 'vehicle') as VehicleAsset[];
export const ACTORS = ALL_ASSETS.filter(a => a.type === 'actor') as ActorAsset[];
export const SAFETY_OBJECTS = ALL_ASSETS.filter(a => a.type === 'safety-object') as SafetyObjectAsset[];

export function getAssetById(id: string): AssetDefinition | undefined {
  return ALL_ASSETS.find(asset => asset.id === id);
}

export function getAssetsByType(type: 'vehicle' | 'actor' | 'safety-object'): AssetDefinition[] {
  return ALL_ASSETS.filter(asset => asset.type === type);
}
