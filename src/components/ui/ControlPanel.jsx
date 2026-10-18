import React from 'react';
import { 
  Play, Pause, SkipForward, RotateCcw, 
  ArrowUpDown, ShieldAlert, Activity, 
  Compass, Radio, Flame, CheckCircle, Zap
} from 'lucide-react';

export default function ControlPanel({
  nodes,
  edges,
  sourceId,
  destinationId,
  onSelectSource,
  onSelectDestination,
  onSwapEndpoints,
  algorithm,
  onChangeAlgorithm,
  trafficMultiplier,
  onChangeTrafficMultiplier,
  selectedEdgeId,
  onToggleBlockSelectedRoad,
  onSimulateBlockage,
  isPlaying,
  onTogglePlay,
  onStepForward,
  onResetPlayback,
  currentStepIndex,
  totalSteps,
  currentStepData,
  playbackSpeed,
  onChangePlaybackSpeed
}) {
  const algorithms = [
    { id: 'dijkstra', label: "Dijkstra's (Min-Heap)", tag: 'Optimal', desc: 'Weighted shortest path using custom MinHeap' },
    { id: 'astar', label: 'A* Search (Euclidean)', tag: 'Fastest', desc: 'Goal-directed heuristic h(n) = EuclideanDistance' },
    { id: 'bfs', label: 'Breadth-First (BFS)', tag: 'Fewest Hops', desc: 'Unweighted queue (minimizes road segments)' },
    { id: 'dfs', label: 'Depth-First (DFS)', tag: 'Deep Dive', desc: 'LIFO stack deep exploration' }
  ];

  const selectedEdge = edges.find(e => e.id === selectedEdgeId);

  return (
    <aside className="w-84 max-w-[92vw] h-full bg-zinc-950/85 backdrop-blur-md border-r border-zinc-800/80 flex flex-col shrink-0 z-20 select-none overflow-y-auto">
      {/* 1. SOURCE & DESTINATION SELECTOR */}
      <div className="p-4 border-b border-zinc-800/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Route Endpoints</span>
          </span>
          <button
            onClick={onSwapEndpoints}
            className="p-1 rounded text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 transition-colors"
            title="Swap Source and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Source Hub */}
        <div className="flex items-center gap-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 focus-within:border-emerald-500/50">
          <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-mono font-bold text-emerald-400">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-[9px] uppercase font-mono font-bold text-emerald-400/80 block">Source Hub</label>
            <select
              value={sourceId}
              onChange={(e) => onSelectSource(e.target.value)}
              className="w-full bg-transparent text-xs font-mono font-medium text-zinc-200 focus:outline-none cursor-pointer truncate"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id} className="bg-zinc-900 text-zinc-200">
                  {n.label} [{n.id}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Destination Hub */}
        <div className="flex items-center gap-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 focus-within:border-cyan-500/50">
          <div className="w-5 h-5 rounded bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-mono font-bold text-cyan-400">B</span>
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-[9px] uppercase font-mono font-bold text-cyan-400/80 block">Destination Hub</label>
            <select
              value={destinationId}
              onChange={(e) => onSelectDestination(e.target.value)}
              className="w-full bg-transparent text-xs font-mono font-medium text-zinc-200 focus:outline-none cursor-pointer truncate"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id} className="bg-zinc-900 text-zinc-200">
                  {n.label} [{n.id}]
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[10px] text-zinc-500 font-mono">
          Tip: You can also left-click any 3D node directly to pick endpoints.
        </p>
      </div>

      {/* 2. ALGORITHM SELECTION */}
      <div className="p-4 border-b border-zinc-800/80 flex flex-col gap-2.5">
        <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Routing Algorithm</span>
        </span>

        <div className="flex flex-col gap-1.5">
          {algorithms.map(algo => {
            const isSelected = algorithm === algo.id;
            return (
              <button
                key={algo.id}
                onClick={() => onChangeAlgorithm(algo.id)}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-zinc-900 border-cyan-500/60 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-500/30'
                    : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-cyan-400' : 'text-zinc-200'}`}>
                    {algo.label}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                    algo.tag === 'Optimal' ? 'bg-emerald-500/20 text-emerald-400' :
                    algo.tag === 'Fastest' ? 'bg-cyan-500/20 text-cyan-400' :
                    algo.tag === 'Fewest Hops' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {algo.tag}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">
                  {algo.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DYNAMIC TRAFFIC & ROAD BLOCKAGES */}
      <div className="p-4 border-b border-zinc-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Traffic Multiplier ({trafficMultiplier.toFixed(1)}x)</span>
          </span>
        </div>

        {/* Global Congestion Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.5"
            value={trafficMultiplier}
            onChange={(e) => onChangeTrafficMultiplier(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[9px] font-mono text-zinc-500">
            <span>1.0x (Clear)</span>
            <span>5.0x (Heavy)</span>
            <span>10.0x (Gridlock)</span>
          </div>
        </div>

        {/* Road Blockage Controls */}
        <div className="space-y-2 pt-1">
          {selectedEdge ? (
            <button
              onClick={onToggleBlockSelectedRoad}
              className={`w-full py-2 px-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border ${
                selectedEdge.isBlocked
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{selectedEdge.isBlocked ? `Reopen ${selectedEdge.id}` : `Block ${selectedEdge.id}`}</span>
            </button>
          ) : (
            <button
              onClick={onSimulateBlockage}
              className="w-full py-2 px-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Block Route Artery (Accident)</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. STEP-BY-STEP GENERATOR PLAYBACK CONTROLS */}
      <div className="p-4 flex flex-col gap-2.5 mt-auto bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Algorithm Playback</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            Step {currentStepIndex + 1} / {Math.max(1, totalSteps)}
          </span>
        </div>

        {/* Playback Button Group */}
        <div className="flex items-center justify-between gap-1.5">
          <button
            onClick={onResetPlayback}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`flex-1 py-2 px-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              isPlaying
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-400/25 hover:bg-cyan-300'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Simulation</span>
              </>
            )}
          </button>

          <button
            onClick={onStepForward}
            disabled={isPlaying || currentStepIndex >= totalSteps - 1}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[10px] font-mono">
            {[1, 2, 5].map(spd => (
              <button
                key={spd}
                onClick={() => onChangePlaybackSpeed(spd)}
                className={`px-1.5 py-0.5 rounded ${
                  playbackSpeed === spd
                    ? 'bg-cyan-500/20 text-cyan-400 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Live Step Terminal Log */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 font-mono text-[10px] text-zinc-300 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="uppercase text-[9px]">Engine State</span>
            <span className="text-cyan-400 font-bold">{currentStepData?.type || 'IDLE'}</span>
          </div>
          <p className="text-zinc-200 truncate">
            {currentStepData?.description || 'Ready. Click Play or Step to inspect algorithm execution.'}
          </p>
        </div>
      </div>
    </aside>
  );
}
