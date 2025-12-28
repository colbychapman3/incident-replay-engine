'use client';

import { useState } from 'react';
import { VEHICLES, ACTORS, SAFETY_OBJECTS } from '@/lib/assets';
import { AssetDefinition } from '@/types/assets';

interface AssetPaletteProps {
  onAssetSelect: (asset: AssetDefinition) => void;
}

export function AssetPalette({ onAssetSelect }: AssetPaletteProps) {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'actors' | 'safety'>('vehicles');

  const assets = {
    vehicles: VEHICLES,
    actors: ACTORS,
    safety: SAFETY_OBJECTS
  };

  const currentAssets = assets[activeTab];

  return (
    <div className="w-64 bg-white border-r border-gray-300 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-300">
        <h2 className="text-lg font-semibold text-gray-800">Asset Library</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-300">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'vehicles'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Vehicles ({VEHICLES.length})
        </button>
        <button
          onClick={() => setActiveTab('actors')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'actors'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Actors ({ACTORS.length})
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'safety'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Safety ({SAFETY_OBJECTS.length})
        </button>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto p-2">
        {currentAssets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => onAssetSelect(asset)}
            className="w-full p-3 mb-2 bg-gray-50 hover:bg-blue-50 border border-gray-300 rounded-lg text-left transition-colors group"
          >
            <div className="flex items-start gap-3">
              {/* Icon placeholder */}
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200">
                <span className="text-xs text-gray-600 font-mono">
                  {asset.type === 'vehicle' ? '🚗' : asset.type === 'actor' ? '👤' : '⚠️'}
                </span>
              </div>

              {/* Asset details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-gray-900 truncate">
                  {asset.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {asset.type === 'vehicle' && 'dimensions' in asset
                    ? `${asset.dimensions.length}m × ${asset.dimensions.width}m`
                    : asset.type === 'actor' && 'role' in asset
                    ? asset.role
                    : asset.type === 'safety-object' && 'purpose' in asset
                    ? asset.purpose
                    : 'Asset'}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer help text */}
      <div className="p-3 bg-gray-50 border-t border-gray-300">
        <p className="text-xs text-gray-600">
          Click an asset to place it on the canvas
        </p>
      </div>
    </div>
  );
}
