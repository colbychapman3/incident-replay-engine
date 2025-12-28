'use client';

import { Stage } from 'react-konva';
import { useSceneContext } from '@/context/SceneContext';
import { BackgroundLayer } from './layers/BackgroundLayer';
import { ObjectLayer } from './layers/ObjectLayer';
import { EnvelopeLayer } from './layers/EnvelopeLayer';
import { MeasurementLayer } from './layers/MeasurementLayer';
import { UILayer } from './layers/UILayer';
import { useState } from 'react';
import { Point } from '@/types/scene';

export function SceneEditor() {
  const { state, dispatch } = useSceneContext();
  const [measurementPoints, setMeasurementPoints] = useState<Point[]>([]);

  const coordinateSystem = {
    pixelsPerMeter: 20, // Default zoom: 20 pixels = 1 meter
    origin: { x: 0, y: 0 },
    bounds: { width: 1920, height: 1080 }
  };

  const selectedObjects = state.objects.filter(obj =>
    state.selectedIds.includes(obj.id)
  );

  const handleObjectClick = (id: string, multiSelect: boolean = false) => {
    const isSelected = state.selectedIds.includes(id);

    if (isSelected) {
      dispatch({ type: 'DESELECT_OBJECT', payload: { id } });
    } else {
      // Clear previous selection if not multi-selecting
      if (!multiSelect && state.selectedIds.length > 0) {
        dispatch({ type: 'CLEAR_SELECTION' });
      }
      dispatch({ type: 'SELECT_OBJECT', payload: { id } });
    }
  };

  const handleObjectDrag = (id: string, position: Point) => {
    dispatch({
      type: 'MOVE_OBJECT',
      payload: { id, position }
    });
  };

  return (
    <div className="w-full h-full bg-gray-100">
      <Stage width={1920} height={1080}>
        {/* Layer 1: Background (grid, scene template) */}
        <BackgroundLayer
          coordinateSystem={coordinateSystem}
          width={1920}
          height={1080}
          showGrid={true}
        />

        {/* Layer 2: Objects (vehicles, actors, safety objects - draggable) */}
        <ObjectLayer
          objects={state.objects}
          selectedIds={state.selectedIds}
          coordinateSystem={coordinateSystem}
          onObjectClick={handleObjectClick}
          onObjectDrag={handleObjectDrag}
        />

        {/* Layer 3: Envelopes (semi-transparent overlays, listening: false) */}
        <EnvelopeLayer
          objects={state.objects}
          envelopeVisibility={state.envelopeVisibility}
          coordinateSystem={coordinateSystem}
        />

        {/* Layer 4: Measurements (temporary distance/angle tools) */}
        <MeasurementLayer
          measurementPoints={measurementPoints}
          coordinateSystem={coordinateSystem}
        />

        {/* Layer 5: UI (selection boxes, labels, handles) */}
        <UILayer
          selectedObjects={selectedObjects}
          coordinateSystem={coordinateSystem}
        />
      </Stage>
    </div>
  );
}
