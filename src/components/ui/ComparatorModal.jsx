import React from 'react';
import { 
  X, BarChart2, Zap, Clock, Activity, 
  Award, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { 
  dijkstraGenerator, aStarGenerator, bfsGenerator, dfsGenerator, runAlgorithmInstant 
} from '../../engine/algorithms';

export default function ComparatorModal({
  isOpen,
  onClose,
  graph,
  sourceId,
  destinationId
}) {
  if (!isOpen) return null;

  // Run all 4 algorithms instantly on identical graph state
  const dijkstra = runAlgorithmInstant(dijkstraGenerator, graph, sourceId, destinationId);
  const astar = runAlgorithmInstant(aStarGenerator, graph, sourceId, destinationId);
  const bfs = runAlgorithmInstant(bfsGenerator, graph, sourceId, destinationId);
  const dfs = runAlgorithmInstant(dfsGenerator, graph, sourceId, destinationId);

  const algorithms = [
    { key: 'dijkstra', name: "Dijkstra's (Min-Heap)", result: dijkstra, color: 'from-cyan-500 to-blue-500', textColor: 'text-cyan-400' },
    { key: 'astar', name: "A* Search (Euclidean)", result: astar, color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-400' },
    { key: 'bfs', name: "Breadth-First (BFS)", result: bfs, color: 'from-amber-500 to-orange-500', textColor: 'text-amber-400' },
    { key: 'dfs', name: "Depth-First (DFS)", result: dfs, color: 'from-purple-500 to-pink-500', textColor: 'text-purple-400' }
  ];

  const maxNodes = Math.max(...algorithms.map(a => a.result.nodesExplored || 1), 1);
  const minCost = Math.min(...algorithms.filter(a => a.result.cost !== Infinity).map(a => a.result.cost));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-zinc-100">
                Algorithm Performance Benchmark
              </h2>
              <p className="text-xs font-mono text-zinc-400">
                Direct side-by-side evaluation from <span className="text-emerald-400 font-bold">[{sourceId}]</span> to <span className="text-cyan-400 font-bold">[{destinationId}]</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* 1. Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {algorithms.map(algo => {
              const r = algo.result;
              const isBest = r.success && r.cost === minCost;

              return (
                <div
                  key={algo.key}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    isBest
                      ? 'bg-zinc-900 border-cyan-500/50 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-500/20'
                      : 'bg-zinc-900/40 border-zinc-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-mono font-bold ${algo.textColor}`}>
                        {algo.name}
                      </span>
                      {isBest && (
                        <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          <Award className="w-3 h-3" /> BEST
                        </span>
                      )}
                    </div>

                    <div className="text-xl font-mono font-bold text-zinc-100 mb-2">
                      {r.success ? `${r.cost}m` : 'Failed'}
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-zinc-400">
                        <span>Runtime:</span>
                        <span className="text-cyan-400 font-semibold">{r.executionTimeMs} ms</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Explored:</span>
                        <span className="text-amber-400 font-semibold">{r.nodesExplored} nodes</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Distance:</span>
                        <span className="text-zinc-200">{r.pathDistance || 0} km</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Hops:</span>
                        <span className="text-zinc-200">{r.currentPath?.length > 1 ? r.currentPath.length - 1 : 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-400 truncate">
                    {r.success ? r.currentPath.join(' → ') : 'No path'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Exploration Search Space Efficiency Bars */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="font-mono text-xs font-bold text-zinc-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Search Space Explored (Fewer is More Efficient)</span>
            </h3>

            <div className="space-y-2.5">
              {algorithms.map(algo => {
                const percent = (algo.result.nodesExplored / maxNodes) * 100;
                return (
                  <div key={algo.key} className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className={algo.textColor}>{algo.name}</span>
                      <span className="text-zinc-400">{algo.result.nodesExplored} nodes ({Math.round(percent)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${algo.color} transition-all duration-300 rounded-full`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
