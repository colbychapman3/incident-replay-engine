'use client';

import React, { useState } from 'react';
import { Download, Image, FileText, Film } from 'lucide-react';

export interface ExportMenuProps {
  onExportPNG: () => void;
  onExportPDF: () => void;
  projectName: string;
}

export function ExportMenu({ onExportPNG, onExportPDF, projectName }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  onExportPNG();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 rounded transition-colors flex items-center gap-3 text-white"
              >
                <Image className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium">PNG Snapshot</div>
                  <div className="text-xs text-gray-400">Current canvas view</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onExportPDF();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 rounded transition-colors flex items-center gap-3 text-white"
              >
                <FileText className="w-5 h-5 text-red-400" />
                <div>
                  <div className="font-medium">PDF Packet</div>
                  <div className="text-xs text-gray-400">Court-safe documentation</div>
                </div>
              </button>

              <div className="px-4 py-3 text-left opacity-50 cursor-not-allowed flex items-center gap-3 text-gray-500">
                <Film className="w-5 h-5" />
                <div>
                  <div className="font-medium">MP4 Video</div>
                  <div className="text-xs text-gray-400">Requires ffmpeg (Phase 6)</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
