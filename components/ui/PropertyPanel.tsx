'use client';

import { SceneObject } from '@/types/scene';
import { getAssetById } from '@/lib/assets';

interface PropertyPanelProps {
  selectedObjects: SceneObject[];
  onPropertyChange: (id: string, property: string, value: any) => void;
  onDelete: (id: string) => void;
}

export function PropertyPanel({ selectedObjects, onPropertyChange, onDelete }: PropertyPanelProps) {
  if (selectedObjects.length === 0) {
    return (
      <div className="w-80 bg-white border-l border-gray-300 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Properties</h2>
        <p className="text-sm text-gray-600">No object selected</p>
        <p className="text-xs text-gray-500 mt-2">
          Click an object on the canvas to view and edit its properties
        </p>
      </div>
    );
  }

  if (selectedObjects.length > 1) {
    return (
      <div className="w-80 bg-white border-l border-gray-300 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Properties</h2>
        <p className="text-sm text-gray-600">{selectedObjects.length} objects selected</p>
        <p className="text-xs text-gray-500 mt-2">
          Multi-object editing not yet supported
        </p>
      </div>
    );
  }

  const obj = selectedObjects[0];
  const asset = getAssetById(obj.assetId);
  const position = obj.properties.position || { x: 0, y: 0 };
  const rotation = obj.properties.rotation || 0;

  return (
    <div className="w-80 bg-white border-l border-gray-300 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-300">
        <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
        <p className="text-sm text-gray-600 mt-1">{asset?.name || 'Unknown Asset'}</p>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ID (Read-only) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Object ID</label>
          <input
            type="text"
            value={obj.id}
            readOnly
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded"
          />
        </div>

        {/* Asset Type (Read-only) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
          <input
            type="text"
            value={obj.type}
            readOnly
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded capitalize"
          />
        </div>

        {/* Position */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Position (meters)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">X</label>
              <input
                type="number"
                step="0.1"
                value={position.x.toFixed(2)}
                onChange={(e) =>
                  onPropertyChange(obj.id, 'position', {
                    ...position,
                    x: parseFloat(e.target.value)
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Y</label>
              <input
                type="number"
                step="0.1"
                value={position.y.toFixed(2)}
                onChange={(e) =>
                  onPropertyChange(obj.id, 'position', {
                    ...position,
                    y: parseFloat(e.target.value)
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Rotation (degrees)
          </label>
          <input
            type="number"
            step="1"
            min="0"
            max="360"
            value={rotation.toFixed(0)}
            onChange={(e) =>
              onPropertyChange(obj.id, 'rotation', parseFloat(e.target.value))
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
          />
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) =>
              onPropertyChange(obj.id, 'rotation', parseFloat(e.target.value))
            }
            className="w-full mt-2"
          />
        </div>

        {/* Locked */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={obj.locked}
              onChange={(e) => onPropertyChange(obj.id, 'locked', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Lock object (prevent dragging)</span>
          </label>
        </div>

        {/* Asset-specific properties */}
        {asset && 'metadata' in asset && (
          <div className="pt-4 border-t border-gray-300">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Asset Metadata</h3>
            <div className="space-y-2">
              {Object.entries(asset.metadata || {}).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs text-gray-600 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="text"
                    value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    readOnly
                    className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-300">
        <button
          onClick={() => onDelete(obj.id)}
          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-colors"
        >
          Delete Object
        </button>
      </div>
    </div>
  );
}
