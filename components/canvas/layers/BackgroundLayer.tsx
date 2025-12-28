'use client';

import { Layer, Line, Rect } from 'react-konva';
import { CoordinateSystem } from '@/lib/coordinates';

interface BackgroundLayerProps {
  coordinateSystem: CoordinateSystem;
  width: number;
  height: number;
  showGrid?: boolean;
}

export function BackgroundLayer({
  coordinateSystem,
  width,
  height,
  showGrid = true
}: BackgroundLayerProps) {
  const { pixelsPerMeter } = coordinateSystem;

  // Generate grid lines every meter
  const gridLines = [];
  if (showGrid) {
    // Vertical lines
    for (let x = 0; x <= width; x += pixelsPerMeter) {
      gridLines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, height]}
          stroke="#e0e0e0"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += pixelsPerMeter) {
      gridLines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, width, y]}
          stroke="#e0e0e0"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }
  }

  return (
    <Layer listening={false}>
      {/* White background */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#ffffff"
        listening={false}
      />

      {/* Grid */}
      {gridLines}
    </Layer>
  );
}
