import React, { useState } from 'react';
import { 
  X, BarChart2, Award, Info, CheckCircle2, 
  HelpCircle, Terminal, Code2, BookOpen, ChevronDown, ChevronRight
} from 'lucide-react';
import { runDijkstra, runAStar, runBFS, runDFS } from '../engine/algorithms';

export default function AlgorithmModal({
  isOpen,
  onClose,
  graph,
  sourceId,
  destinationId
}) {
  const [activeTab, setActiveTab] = useState('benchmark');
  const [openFaq, setOpenFaq] = useState(0);

  if (!isOpen) return null;

  // Run all 4 algorithms on identical graph state
  const dijkstra = runDijkstra(graph, sourceId, destinationId);
  const astar = runAStar(graph, sourceId, destinationId);
  const bfs = runBFS(graph, sourceId, destinationId);
  const dfs = runDFS(graph, sourceId, destinationId);

  const totalNodes = graph.getAllNodes().length;

  const algorithms = [
    { key: 'dijkstra', name: "Dijkstra's Algorithm (Min-Heap)", result: dijkstra, color: 'bg-emerald-500' },
    { key: 'astar', name: "A* Search (Euclidean)", result: astar, color: 'bg-cyan-500' },
    { key: 'bfs', name: "Breadth-First Search (BFS)", result: bfs, color: 'bg-amber-500' },
    { key: 'dfs', name: "Depth-First Search (DFS)", result: dfs, color: 'bg-purple-500' }
  ];

  const minCost = Math.min(...algorithms.filter(a => a.result.travelTimeMinutes !== Infinity).map(a => a.result.travelTimeMinutes));
  const maxNodes = Math.max(...algorithms.map(a => a.result.nodesExplored || 1), 1);

  const vivaQuestions = [
    {
      q: "Why is an Adjacency List preferred over an Adjacency Matrix for road networks?",
      a: "Road networks are sparse planar graphs where each intersection typically connects to only 3-4 roads (deg(v) ≈ 3–4). An Adjacency Matrix wastes O(V²) space with thousands of zeros. An Adjacency List uses strictly O(V + E) space and allows checking neighboring roads in O(deg v) time."
    },
    {
      q: "Why did we implement our own MinHeap instead of using C++ std::priority_queue?",
      a: "std::priority_queue does not support decreaseKey. In Dijkstra and A*, when a shorter path to a queued node is found, std::priority_queue requires pushing duplicate entries, inflating queue size to O(E) and degrading push/pop to O(log E). Our custom MinHeap uses an internal hash map to track node indices, achieving true O(log V) decreaseKey and bounding heap size to |V|."
    },
    {
      q: "What makes the Euclidean distance heuristic admissible for A*?",
      a: "The straight-line Euclidean distance is the shortest possible physical distance between two points in space. Since no vehicle can exceed the maximum network speed limit (v_max = 90 km/h), dividing straight-line distance by v_max gives a lower bound on travel time. Because h(u) never overestimates the true remaining time h*(u), it is strictly admissible, guaranteeing optimal routes."
    },
    {
      q: "What is the time complexity of Kruskal's algorithm with our custom Disjoint Set Union (DSU)?",
      a: "Sorting E edges takes O(E log E). Edge cycle checks and set unions use Path Compression and Union by Rank, which execute in O(α(V)) amortized time per operation, where α is the Inverse Ackermann function (α ≤ 4 for all practical sizes). Total time complexity is O(E log E)."
    },
    {
      q: "Why does BFS fail to find optimal routes in weighted traffic networks?",
      a: "BFS treats all edges as having uniform weight (1 hop). It minimizes the number of intersections traversed, not travel time. A 2-hop route through heavy congestion may take 45 minutes, while a 4-hop bypass around the city takes only 15 minutes. BFS blindly picks the 2-hop congested route."
    },
    {
      q: "How does the engine handle road closures and accident detours?",
      a: "When a corridor is blocked, its isBlocked flag becomes true and its effective travel time becomes Infinity. The algorithm automatically prunes the blocked corridor during neighbor exploration and computes the next least-cost alternative path, measuring the exact detour delay impact ΔT."
    }
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div>
            <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              <span>Multi-Algorithm Performance & Academic Viva Defense</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative Analysis: <span className="font-mono text-emerald-400">[{sourceId}]</span> &rarr; <span className="font-mono text-cyan-400">[{destinationId}]</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold px-6">
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'benchmark'
                ? 'border-cyan-500 text-cyan-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Empirical Benchmark Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('viva')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'viva'
                ? 'border-amber-500 text-amber-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Viva Voce Defense Q&A</span>
          </button>

          <button
            onClick={() => setActiveTab('cpp_engine')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'cpp_engine'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>C++ Engine & Unit Tests</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: BENCHMARK MATRIX */}
          {activeTab === 'benchmark' && (
            <div className="space-y-6">
              {/* 1. Comparison Matrix Table */}
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/80">
                      <th className="p-3">Algorithm</th>
                      <th className="p-3">Travel Time</th>
                      <th className="p-3">Distance</th>
                      <th className="p-3">Hops</th>
                      <th className="p-3">Explored Nodes</th>
                      <th className="p-3">Runtime</th>
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
                  Search Space Exploration (Fewer Explored = Higher Efficiency)
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

              {/* 3. Analytical Takeaways */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex items-start gap-3 text-xs leading-relaxed">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5 text-slate-300">
                  <span className="font-semibold text-slate-100 block">Core DSA Observations:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">Dijkstra vs A*:</strong> Both guarantee the exact same minimal travel time. But A* evaluates fewer nodes by utilizing the Euclidean distance heuristic to prune away opposite directions.</li>
                    <li><strong className="text-slate-200">BFS (Hop Minimizer):</strong> Minimizes intersection hops but ignores traffic congestion, frequently leading to delays in real-world driving.</li>
                    <li><strong className="text-slate-200">DFS (Meandering):</strong> Dives down deep branches, producing winding routes with high travel delays.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VIVA VOCE QUESTIONS & DEFENSE */}
          {activeTab === 'viva' && (
            <div className="space-y-4">
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-4 text-xs text-amber-200 flex items-center justify-between">
                <span>Academic Viva Voce Defense Prep &bull; Computer Engineering DSA Lab</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-300">
                  {vivaQuestions.length} Questions
                </span>
              </div>

              <div className="space-y-3">
                {vivaQuestions.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      className="border border-slate-800 rounded-lg bg-slate-950 overflow-hidden transition"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                        className="w-full text-left p-3.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-900/50 transition"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-[10px] font-mono">
                            {index + 1}
                          </span>
                          <span>{item.q}</span>
                        </span>
                        {isOpen ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-900/40">
                          <p>{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: C++ ENGINE CODE & TEST SUITE */}
          {activeTab === 'cpp_engine' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-lg p-4 text-emerald-300 text-xs">
                <span className="font-bold">100% C++17 Core Engine Verified & Tested:</span>
                <p className="text-slate-300 mt-1">All core DSA algorithms, Min-Heap, DSU, and detour recalculations are implemented natively in C++ with 50/50 passing automated assertions.</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-cyan-400 font-bold">Terminal Compilation & Execution:</span>
                  <span className="text-slate-500 text-[11px]">Windows / Linux</span>
                </div>
                <div className="bg-slate-900 p-3 rounded text-slate-200 space-y-2">
                  <p className="text-slate-400"># 1. Compile C++ Engine and Automated Tests:</p>
                  <p className="text-emerald-400 font-bold">.\build.bat</p>
                  <p className="text-slate-400"># 2. Run the 50-Assertion Automated Test Suite:</p>
                  <p className="text-emerald-400 font-bold">.\test.bat</p>
                  <p className="text-slate-400"># 3. Launch Interactive C++ Command Center:</p>
                  <p className="text-emerald-400 font-bold">.\run.bat   (or .\TrafficOptimizer.exe)</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
                <span className="text-amber-400 font-bold block">Handcrafted C++ Data Structures:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  <li><span className="text-cyan-300">include/MinHeap.hpp:</span> Custom Binary Min-Heap with index map for O(log V) decreaseKey</li>
                  <li><span className="text-cyan-300">include/DisjointSet.hpp:</span> DSU with Path Compression and Union by Rank (O(&alpha;(V)))</li>
                  <li><span className="text-cyan-300">include/Graph.hpp:</span> Adjacency list with dynamic speed & traffic multipliers</li>
                  <li><span className="text-cyan-300">include/Algorithms.hpp:</span> Dijkstra, A*, BFS, DFS, Kruskal MST implementations</li>
                  <li><span className="text-cyan-300">tests/test_dsa.cpp:</span> 50 automated assertions (100% pass rate)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
