import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-gray-800">
      <main className="flex flex-col items-center gap-8 px-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Incident Replay Engine
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Deterministic, court-safe incident reconstruction for maritime and port operations
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-8">
          <Link
            href="/editor"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg"
          >
            Launch Editor
          </Link>

          <div className="flex gap-4 text-sm text-gray-400">
            <span>Phase 1 & 2: ✅ Complete</span>
            <span>•</span>
            <span>20 Assets Available</span>
            <span>•</span>
            <span>5-Layer Canvas</span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 text-left">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Assets</h3>
            <p className="text-sm text-gray-400">
              6 vehicles, 9 actors, 5 safety objects
            </p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Canvas</h3>
            <p className="text-sm text-gray-400">
              5-layer Konva.js architecture
            </p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Controls</h3>
            <p className="text-sm text-gray-400">
              Undo/Redo, keyboard shortcuts
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
