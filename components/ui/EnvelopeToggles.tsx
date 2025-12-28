'use client';

import { EnvelopeType } from '@/types/scene';

interface EnvelopeTogglesProps {
  visibility: {
    forkliftVision: boolean;
    mafiSwing: boolean;
    spotterLOS: boolean;
    rampClearance: boolean;
  };
  onToggle: (type: EnvelopeType) => void;
}

export function EnvelopeToggles({ visibility, onToggle }: EnvelopeTogglesProps) {
  const toggles: Array<{ type: EnvelopeType; label: string; color: string }> = [
    { type: 'forkliftVision', label: 'Forklift Vision', color: 'bg-green-500' },
    { type: 'mafiSwing', label: 'MAFI Swing', color: 'bg-orange-500' },
    { type: 'spotterLOS', label: 'Spotter LOS', color: 'bg-blue-500' },
    { type: 'rampClearance', label: 'Ramp Clearance', color: 'bg-purple-500' }
  ];

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 border-b border-gray-700">
      <span className="text-sm font-medium text-gray-400">Envelopes:</span>
      {toggles.map(({ type, label, color }) => (
        <button
          key={type}
          onClick={() => onToggle(type)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            visibility[type]
              ? `${color} text-white`
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              visibility[type] ? 'bg-white' : 'bg-gray-500'
            }`}
          />
          {label}
        </button>
      ))}
    </div>
  );
}
