'use client';

import { Layer, Rect, Text, Group } from 'react-konva';
import { SceneObject } from '@/types/scene';
import { CoordinateSystem, worldToCanvas } from '@/lib/coordinates';

interface ObjectLayerProps {
  objects: SceneObject[];
  selectedIds: string[];
  coordinateSystem: CoordinateSystem;
  onObjectClick?: (id: string) => void;
  onObjectDrag?: (id: string, position: { x: number; y: number }) => void;
}

export function ObjectLayer({
  objects,
  selectedIds,
  coordinateSystem,
  onObjectClick,
  onObjectDrag
}: ObjectLayerProps) {
  return (
    <Layer>
      {objects.map(obj => (
        <ObjectNode
          key={obj.id}
          object={obj}
          selected={selectedIds.includes(obj.id)}
          coordinateSystem={coordinateSystem}
          onClick={() => onObjectClick?.(obj.id)}
          onDrag={(pos) => onObjectDrag?.(obj.id, pos)}
        />
      ))}
    </Layer>
  );
}

interface ObjectNodeProps {
  object: SceneObject;
  selected: boolean;
  coordinateSystem: CoordinateSystem;
  onClick?: () => void;
  onDrag?: (position: { x: number; y: number }) => void;
}

function ObjectNode({
  object,
  selected,
  coordinateSystem,
  onClick,
  onDrag
}: ObjectNodeProps) {
  const position = object.properties.position || { x: 0, y: 0 };
  const rotation = object.properties.rotation || 0;

  // Convert world coordinates to canvas coordinates
  const canvasPos = worldToCanvas(position, coordinateSystem);

  // Placeholder sizes (will be replaced with actual asset metadata)
  const objectSizes = {
    vehicle: { width: 100, height: 60 },
    actor: { width: 20, height: 20 },
    'safety-object': { width: 15, height: 15 }
  };

  const size = objectSizes[object.type];
  const color = object.type === 'vehicle' ? '#4CAF50' :
                object.type === 'actor' ? '#2196F3' : '#FF9800';

  return (
    <Group
      x={canvasPos.x}
      y={canvasPos.y}
      rotation={rotation}
      draggable={!object.locked}
      onClick={onClick}
      onTap={onClick}
      onDragEnd={(e) => {
        const worldX = e.target.x() / coordinateSystem.pixelsPerMeter;
        const worldY = e.target.y() / coordinateSystem.pixelsPerMeter;
        onDrag?.({ x: worldX, y: worldY });
      }}
    >
      {/* Object body */}
      <Rect
        x={-size.width / 2}
        y={-size.height / 2}
        width={size.width}
        height={size.height}
        fill={color}
        stroke={selected ? '#FFD700' : '#000000'}
        strokeWidth={selected ? 3 : 1}
        opacity={0.8}
      />

      {/* Object label */}
      <Text
        x={-size.width / 2}
        y={size.height / 2 + 5}
        text={object.assetId}
        fontSize={12}
        fill="#000000"
        listening={false}
      />

      {/* Lock indicator */}
      {object.locked && (
        <Text
          x={size.width / 2 - 15}
          y={-size.height / 2 - 15}
          text="🔒"
          fontSize={16}
          listening={false}
        />
      )}
    </Group>
  );
}
