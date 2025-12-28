'use client';

import { Layer, Rect, Text } from 'react-konva';
import { SceneObject } from '@/types/scene';
import { CoordinateSystem, worldToCanvas } from '@/lib/coordinates';

interface UILayerProps {
  selectedObjects: SceneObject[];
  coordinateSystem: CoordinateSystem;
}

export function UILayer({
  selectedObjects,
  coordinateSystem
}: UILayerProps) {
  return (
    <Layer listening={false}>
      {selectedObjects.map(obj => (
        <SelectionBox
          key={obj.id}
          object={obj}
          coordinateSystem={coordinateSystem}
        />
      ))}
    </Layer>
  );
}

interface SelectionBoxProps {
  object: SceneObject;
  coordinateSystem: CoordinateSystem;
}

function SelectionBox({ object, coordinateSystem }: SelectionBoxProps) {
  const position = object.properties.position || { x: 0, y: 0 };
  const rotation = object.properties.rotation || 0;

  const canvasPos = worldToCanvas(position, coordinateSystem);

  // Placeholder sizes
  const objectSizes = {
    vehicle: { width: 100, height: 60 },
    actor: { width: 20, height: 20 },
    'safety-object': { width: 15, height: 15 }
  };

  const size = objectSizes[object.type];
  const padding = 10;

  return (
    <>
      {/* Selection box */}
      <Rect
        x={canvasPos.x - size.width / 2 - padding}
        y={canvasPos.y - size.height / 2 - padding}
        width={size.width + padding * 2}
        height={size.height + padding * 2}
        stroke="#FFD700"
        strokeWidth={2}
        dash={[5, 5]}
        listening={false}
      />

      {/* Corner handles */}
      {[
        { x: -size.width / 2 - padding, y: -size.height / 2 - padding },
        { x: size.width / 2 + padding, y: -size.height / 2 - padding },
        { x: size.width / 2 + padding, y: size.height / 2 + padding },
        { x: -size.width / 2 - padding, y: size.height / 2 + padding }
      ].map((corner, idx) => (
        <Rect
          key={`handle-${idx}`}
          x={canvasPos.x + corner.x - 4}
          y={canvasPos.y + corner.y - 4}
          width={8}
          height={8}
          fill="#FFD700"
          listening={false}
        />
      ))}

      {/* Rotation indicator */}
      <Text
        x={canvasPos.x - 30}
        y={canvasPos.y - size.height / 2 - padding - 20}
        text={`${rotation.toFixed(0)}°`}
        fontSize={12}
        fill="#FFD700"
        fontStyle="bold"
        listening={false}
      />
    </>
  );
}
