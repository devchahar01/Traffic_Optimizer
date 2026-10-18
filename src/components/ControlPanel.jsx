import React from 'react';
import { 
  ArrowUpDown, Play, RotateCcw, ShieldAlert, 
  Layers, BarChart3, Network, Sliders, CheckCircle 
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
  onRunSimulation,
  trafficMultiplier,
  onChangeTrafficMultiplier,
  selectedEdgeId,
  onToggleBlockEdge,
  onSimulateAccident,
  onClearAllBlocks,
  onResetNetwork,
  onOpenComparator,
  isMstMode,
  onToggleMstMode
}) {
  const selectedEdge = edges.find(e => e.id === selectedEdgeId);
  const blockedCount = edges.filter(e => e.isBlocked).length;

  return (
    <aside className="w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none overflow-y-auto text-slate-200">
      {/* Enterprise Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <h2 className="font-semibold text-sm text-slate-100 tracking-tight">
            Traffic Dispatch Control
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          GIS Route Optimization & Network Simulation
        </p>
      </div>

      {/* 1. Origin & Destination Form */}
      <div className="p-4 border-b border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Route Endpoints
          </span>
          <button
            onClick={onSwapEndpoints}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Source Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Source Intersection
          </label>
          <select
            value={sourceId}
            onChange={(e) => onSelectSource(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-500 cursor-pointer"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>
                {n.label} [{n.id}]
              </option>
            ))}
          </select>
        </div>

        {/* Destination Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-blue-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Destination Intersection
          </label>
          <select
            value={destinationId}
            onChange={(e) => onSelectDestination(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-500 cursor-pointer"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>
                {n.label} [{n.id}]
              </option>
            ))}
          </select>
        </div>

        <p className="text-[10px] text-slate-500">
          Tip: Click on the map to snap endpoints using QuadTree indexing.
        </p>
      </div>

      {/* 2. Routing Algorithm Selector */}
      <div className="p-4 border-b border-slate-800 flex flex-col gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Pathfinding Algorithm
        </span>

        <select
          value={algorithm}
          onChange={(e) => onChangeAlgorithm(e.target.value)}
          disabled={isMstMode}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-slate-500 cursor-pointer"
        >
          <option value="dijkstra">Dijkstra's Algorithm (Min-Heap O((V+E)log V))</option>
          <option value="astar">A* Search (Haversine Heuristic f=g+h)</option>
          <option value="bfs">Breadth-First Search (Fewest Hops)</option>
          <option value="dfs">Depth-First Search (Suboptimal Deep Exploration)</option>
        </select>

        {/* Run Simulation Button */}
        <button
          onClick={onRunSimulation}
          className="w-full mt-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Simulation</span>
        </button>

        {/* Toggle Kruskal MST Mode */}
        <button
          onClick={onToggleMstMode}
          className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border ${
            isMstMode
              ? 'bg-amber-600 text-white border-amber-500'
              : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Network className="w-3.5 h-3.5 text-amber-400" />
          <span>{isMstMode ? 'Exit MST Mode' : "Run Kruskal's MST (DSU)"}</span>
        </button>
      </div>

      {/* 3. Traffic Multiplier & Incident Management */}
      <div className="p-4 border-b border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Traffic Multiplier:</span>
          </span>
          <span className="font-mono text-xs font-bold text-amber-400">
            {trafficMultiplier.toFixed(1)}x
          </span>
        </div>

        <input
          type="range"
          min="1.0"
          max="5.0"
          step="0.5"
          value={trafficMultiplier}
          onChange={(e) => onChangeTrafficMultiplier(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />

        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>1.0x (Clear)</span>
          <span>3.0x (Heavy)</span>
          <span>5.0x (Gridlock)</span>
        </div>

        {/* Road Closures Controls */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
          {selectedEdge ? (
            <button
              onClick={() => onToggleBlockEdge(selectedEdge.id)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border ${
                selectedEdge.isBlocked
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-600/50 hover:bg-emerald-600/30'
                  : 'bg-red-600/20 text-red-300 border-red-600/50 hover:bg-red-600/30'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{selectedEdge.isBlocked ? `Reopen Selected Road` : `Block Selected Road`}</span>
            </button>
          ) : (
            <button
              onClick={onSimulateAccident}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-red-600/10 text-red-300 border border-red-600/30 hover:bg-red-600/20 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Simulate Road Closure / Accident</span>
            </button>
          )}

          {blockedCount > 0 && (
            <div className="flex items-center justify-between text-xs px-1 text-red-400">
              <span>{blockedCount} road segment{blockedCount > 1 ? 's' : ''} blocked</span>
              <button
                onClick={onClearAllBlocks}
                className="text-[11px] underline text-slate-400 hover:text-slate-200"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Action Buttons & Benchmark Footer */}
      <div className="p-4 mt-auto flex flex-col gap-2 bg-slate-950/30">
        <button
          onClick={onOpenComparator}
          className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-600/40 hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-1.5"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Compare All Algorithms</span>
        </button>

        <button
          onClick={onResetNetwork}
          className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Network Graph</span>
        </button>
      </div>
    </aside>
  );
}
