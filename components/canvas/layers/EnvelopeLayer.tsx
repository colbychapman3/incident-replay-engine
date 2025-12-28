'use client';

import { Layer, Line } from 'react-konva';
import { SceneObject, EnvelopeVisibilityConfig } from '@/types/scene';
import { CoordinateSystem, worldToCanvas } from '@/lib/coordinates';
import { createArcPolygon } from '@/lib/geometry';

interface EnvelopeLayerProps {
  objects: SceneObject[];
  envelopeVisibility: EnvelopeVisibilityConfig;
  coordinateSystem: CoordinateSystem;
}

export function EnvelopeLayer({
  objects,
  envelopeVisibility,
  coordinateSystem
}: EnvelopeLayerProps) {
  return (
    <Layer listening={false}>
      {objects.map(obj => (
        <EnvelopeOverlays
          key={obj.id}
          object={obj}
          visibility={envelopeVisibility}
          coordinateSystem={coordinateSystem}
        />
      ))}
    </Layer>
  );
}

interface EnvelopeOverlaysProps {
  object: SceneObject;
  visibility: EnvelopeVisibilityConfig;
  coordinateSystem: CoordinateSystem;
}

function EnvelopeOverlays({
  object,
  visibility,
  coordinateSystem
}: EnvelopeOverlaysProps) {
  const position = object.properties.position || { x: 0, y: 0 };
  const rotation = object.properties.rotation || 0;

  // Forklift vision cone (120 degrees, 15m range)
  if (object.assetId.includes('forklift') && visibility.forkliftVision) {
    const visionCone = createArcPolygon(
      position,
      rotation - 60, // Start 60 degrees left of facing
      rotation + 60, // End 60 degrees right of facing
      15, // 15 meter range
      24 // Segments for smoothness
    );

    // Convert to canvas coordinates
    const canvasPoints = visionCone.points.flatMap(p => {
      const canvas = worldToCanvas(p, coordinateSystem);
      return [canvas.x, canvas.y];
    });

    return (
      <Line
        points={canvasPoints}
        fill="rgba(76, 175, 80, 0.2)"
        stroke="rgba(76, 175, 80, 0.5)"
        strokeWidth={2}
        closed
        listening={false}
      />
    );
  }

  // MAFI swing envelope (placeholder - will be enhanced)
  if (object.assetId.includes('mafi') && visibility.mafiSwing) {
    const swingCone = createArcPolygon(
      position,
      rotation - 45,
      rotation + 45,
      12, // MAFI trailer length
      16
    );

    const canvasPoints = swingCone.points.flatMap(p => {
      const canvas = worldToCanvas(p, coordinateSystem);
      return [canvas.x, canvas.y];
    });

    return (
      <Line
        points={canvasPoints}
        fill="rgba(255, 152, 0, 0.15)"
        stroke="rgba(255, 152, 0, 0.4)"
        strokeWidth={2}
        dash={[5, 5]}
        closed
        listening={false}
      />
    );
  }

  // Spotter line-of-sight (for actor type)
  if (object.type === 'actor' && object.properties.role === 'spotter' && visibility.spotterLOS) {
    // Placeholder for spotter LOS - will implement ray-casting
    const losCone = createArcPolygon(
      position,
      rotation - 90,
      rotation + 90,
      20, // Spotter vision range
      16
    );

    const canvasPoints = losCone.points.flatMap(p => {
      const canvas = worldToCanvas(p, coordinateSystem);
      return [canvas.x, canvas.y];
    });

    return (
      <Line
        points={canvasPoints}
        fill="rgba(33, 150, 243, 0.1)"
        stroke="rgba(33, 150, 243, 0.3)"
        strokeWidth={1}
        dash={[3, 3]}
        closed
        listening={false}
      />
    );
  }

  return null;
}
