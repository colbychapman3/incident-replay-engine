'use client';

import { Stage, Layer } from 'react-konva';
import { useSceneContext } from '@/context/SceneContext';

export function SceneEditor() {
  const { state } = useSceneContext();

  return (
    <div className="w-full h-full">
      <Stage width={1920} height={1080}>
        <Layer>
          {/* TODO: Render scene objects */}
        </Layer>
      </Stage>
    </div>
  );
}
