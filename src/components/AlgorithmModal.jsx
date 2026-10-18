import React from 'react';
import { X, BarChart2, Award, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { runDijkstra, runAStar, runBFS, runDFS } from '../engine/algorithms';

export default function AlgorithmModal({
  isOpen,
  onClose,
  graph,
  sourceId,
  destinationId
}) {
  if (!isOpen) return null;

  // Run all 4 algorithms on identical graph state
  const dijkstra = runDijkstra(graph, sourceId, destinationId);
  const astar = runAStar(graph, sourceId, destinationId);
  const bfs = runBFS(graph, sourceId, destinationId);
  const dfs = runDFS(graph, sourceId, destinationId);

  const totalNodes = graph.getAllNodes().length;

  const algorithms = [
    { key: 'dijkstra', name: "Dijkstra's Algorithm", result: dijkstra, color: 'bg-emerald-500' },
    { key: 'astar', name: "A* Search (Haversine)", result: astar, color: 'bg-blue-500' },
    { key: 'bfs', name: "Breadth-First Search (BFS)", result: bfs, color: 'bg-amber-500' },
    { key: 'dfs', name: "Depth-First Search (DFS)", result: dfs, color: 'bg-purple-500' }
  ];

  const minCost = Math.min(...algorithms.filter(a => a.result.travelTimeMinutes !== Infinity).map(a => a.result.travelTimeMinutes));
  const maxNodes = Math.max(...algorithms.map(a => a.result.nodesExplored || 1), 1);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="font-semibold text-base text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-400" />
              <span>Multi-Algorithm Evaluation Benchmark</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical viva comparison: <span className="font-mono text-emerald-400">[{sourceId}]</span> → <span className="font-mono text-blue-400">[{destinationId}]</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Comparison Matrix Table */}
          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/80">
                  <th className="p-3">Algorithm</th>
                  <th className="p-3">Travel Time (min)</th>
                  <th className="p-3">Distance</th>
                  <th className="p-3">Hops</th>
                  <th className="p-3">Explored Nodes</th>
                  <th className="p-3">Runtime (ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {algorithms.map(algo => {
                  const r = algo.result;
                  const isOptimal = r.success && r.travelTimeMinutes === minCost;

                  return (
                    <tr key={algo.key} className="hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-slate-200 flex items-center gap-2">
                        <span>{algo.name}</span>
                        {isOptimal && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            OPTIMAL
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-100">
                        {r.success ? `${r.travelTimeMinutes} min` : 'Unreachable'}
                      </td>
                      <td className="p-3 text-slate-300">
                        {r.success ? `${r.distanceKm} km` : '-'}
                      </td>
                      <td className="p-3 text-slate-300">
                        {r.success ? r.hops : '-'}
                      </td>
                      <td className="p-3 text-amber-400 font-bold">
                        {r.nodesExplored} / {totalNodes} ({Math.round((r.nodesExplored / totalNodes) * 100)}%)
                      </td>
                      <td className="p-3 text-emerald-400 font-bold">
                        {r.executionTimeMs} ms
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 2. Search Space Exploration Efficiency */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Exploration Search Space (Fewer is More Efficient)
            </h4>
            <div className="space-y-2.5">
              {algorithms.map(algo => {
                const percent = (algo.result.nodesExplored / maxNodes) * 100;
                return (
                  <div key={algo.key} className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>{algo.name}</span>
                      <span>{algo.result.nodesExplored} nodes ({Math.round(percent)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${algo.color} transition-all duration-300 rounded-full`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Viva Defense Analytical Insights */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex items-start gap-3 text-xs leading-relaxed">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-slate-300">
              <span className="font-semibold text-slate-100 block">Viva Defense Key Insights:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>
                  <strong className="text-slate-200">Dijkstra vs A*:</strong> Both yield the exact mathematically guaranteed optimal path under live traffic conditions. However, A* incorporates the admissible Haversine heuristic $h(n)$, pruning irrelevant search branches and exploring substantially fewer nodes.
                </li>
                <li>
                  <strong className="text-slate-200">BFS (Unweighted Hops):</strong> BFS minimizes the sheer count of road transitions/intersections. It treats all edges as having weight = 1, which frequently leads to suboptimal travel times in real traffic because it cannot account for arterial speed limits or congestion bottlenecks.
                </li>
                <li>
                  <strong className="text-slate-200">DFS (Depth-First Search):</strong> DFS commits deep down branches before backtracking, demonstrating why blind stack-based traversal produces convoluted, meandering routes with high travel delays.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close Benchmark
          </button>
        </div>
      </div>
    </div>
  );
}
