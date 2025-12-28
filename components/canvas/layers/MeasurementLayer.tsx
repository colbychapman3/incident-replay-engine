'use client';

import { Layer, Line, Text } from 'react-konva';
import { Point } from '@/types/scene';
import { CoordinateSystem, worldToCanvas } from '@/lib/coordinates';
import { distance } from '@/lib/geometry';

interface MeasurementLayerProps {
  measurementPoints: Point[];
  coordinateSystem: CoordinateSystem;
}

export function MeasurementLayer({
  measurementPoints,
  coordinateSystem
}: MeasurementLayerProps) {
  if (measurementPoints.length < 2) {
    return <Layer listening={false} />;
  }

  const measurements = [];

  for (let i = 0; i < measurementPoints.length - 1; i++) {
    const start = measurementPoints[i];
    const end = measurementPoints[i + 1];

    // Calculate distance in world coordinates (meters)
    const dist = distance(start, end);

    // Convert to canvas coordinates
    const canvasStart = worldToCanvas(start, coordinateSystem);
    const canvasEnd = worldToCanvas(end, coordinateSystem);

    // Midpoint for label
    const midpoint = {
      x: (canvasStart.x + canvasEnd.x) / 2,
      y: (canvasStart.y + canvasEnd.y) / 2
    };

    measurements.push(
      <Line
        key={`line-${i}`}
        points={[canvasStart.x, canvasStart.y, canvasEnd.x, canvasEnd.y]}
        stroke="#FF5722"
        strokeWidth={2}
        dash={[10, 5]}
        listening={false}
      />
    );

    measurements.push(
      <Text
        key={`label-${i}`}
        x={midpoint.x - 20}
        y={midpoint.y - 20}
        text={`${dist.toFixed(2)}m`}
        fontSize={14}
        fill="#FF5722"
        fontStyle="bold"
        listening={false}
      />
    );
  }

  return <Layer listening={false}>{measurements}</Layer>;
}
