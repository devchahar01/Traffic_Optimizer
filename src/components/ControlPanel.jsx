import React, { useState } from 'react';
import { 
  ArrowUpDown, Play, RotateCcw, ShieldAlert, 
  Layers, BarChart3, Network, Sliders, CheckCircle,
  PlusCircle, Trash2, Edit3, Navigation, AlertOctagon,
  Flame, RefreshCw, BookOpen
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
  onSelectEdge,
  onToggleBlockEdge,
  onUpdateEdge,
  onAddEdge,
  onDeleteEdge,
  onAddNode,
  onDeleteNode,
  onSimulateAccident,
  onClearAllBlocks,
  onResetNetwork,
  onOpenComparator,
  isMstMode,
  onToggleMstMode
}) {
  // Active Tab: 'traffic' | 'nodes' | 'edges' | 'algorithms'
  const [activeTab, setActiveTab] = useState('traffic');

  // Node form state
  const [newNodeId, setNewNodeId] = useState('');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState('intersection');
  const [newNodeX, setNewNodeX] = useState(500);
  const [newNodeY, setNewNodeY] = useState(350);

  // Edge form state
  const [newFromNode, setNewFromNode] = useState(nodes[0]?.id || 'A1');
  const [newToNode, setNewToNode] = useState(nodes[1]?.id || 'A2');
  const [newEdgeDistance, setNewEdgeDistance] = useState(8.0);
  const [newEdgeSpeed, setNewEdgeSpeed] = useState(60.0);

  // Selected Edge details
  const selectedEdge = edges.find(e => e.id === selectedEdgeId);
  const blockedCount = edges.filter(e => e.isBlocked).length;

  const handleCreateNode = (e) => {
    e.preventDefault();
    if (!newNodeId.trim()) return;
    onAddNode(newNodeId.trim().toUpperCase(), newNodeLabel.trim() || newNodeId.trim(), newNodeX, newNodeY, newNodeType);
    setNewNodeId('');
    setNewNodeLabel('');
  };

  const handleCreateEdge = (e) => {
    e.preventDefault();
    if (newFromNode === newToNode) return;
    onAddEdge(newFromNode, newToNode, {
      distanceKm: Number(newEdgeDistance),
      speedLimitKmh: Number(newEdgeSpeed),
      trafficMultiplier: 1.0
    });
  };

  return (
    <aside className="w-96 h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none overflow-hidden text-slate-200">
      {/* 1. Header with System Status */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="font-bold text-sm text-slate-100 tracking-tight">
              Traffic & Graph Control Center
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
            C++ DSA Engine
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Intelligent Route Optimization & Dynamic Traffic Engine
        </p>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('traffic')}
          className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'traffic'
              ? 'border-amber-500 text-amber-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Traffic</span>
        </button>

        <button
          onClick={() => setActiveTab('nodes')}
          className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'nodes'
              ? 'border-cyan-500 text-cyan-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Nodes</span>
        </button>

        <button
          onClick={() => setActiveTab('edges')}
          className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'edges'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Edges</span>
        </button>

        <button
          onClick={() => setActiveTab('algorithms')}
          className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'algorithms'
              ? 'border-purple-500 text-purple-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Routing</span>
        </button>
      </div>

      {/* 3. TAB CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ==================================================== */}
        {/* TAB 1: TRAFFIC HEAVINESS & CORRIDOR MANAGEMENT       */}
        {/* ==================================================== */}
        {activeTab === 'traffic' && (
          <div className="space-y-4">
            {/* Selected Edge Inspector */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Selected Corridor</span>
                </span>
                {selectedEdge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {selectedEdge.id}
                  </span>
                )}
              </div>

              {selectedEdge ? (
                <div className="space-y-3">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="text-xs font-semibold text-slate-200">
                      {selectedEdge.from} &harr; {selectedEdge.to}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Base Distance: <strong className="text-slate-200">{selectedEdge.distanceKm} km</strong></span>
                      <span>Speed Limit: <strong className="text-slate-200">{selectedEdge.speedLimitKmh} km/h</strong></span>
                    </div>
                  </div>

                  {/* Multiplier Slider for Selected Edge */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Traffic Heaviness:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {selectedEdge.trafficMultiplier.toFixed(1)}x
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1.0"
                      max="8.0"
                      step="0.5"
                      value={selectedEdge.trafficMultiplier}
                      onChange={(e) => onUpdateEdge(selectedEdge.id, { trafficMultiplier: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />

                    {/* Presets */}
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {[
                        { label: 'Clear', mult: 1.0, color: 'text-emerald-400' },
                        { label: 'Normal', mult: 1.5, color: 'text-amber-400' },
                        { label: 'Rush', mult: 3.0, color: 'text-orange-400' },
                        { label: 'Jam', mult: 5.0, color: 'text-rose-400' },
                      ].map(p => (
                        <button
                          key={p.label}
                          onClick={() => onUpdateEdge(selectedEdge.id, { trafficMultiplier: p.mult })}
                          className={`py-1 text-[10px] font-mono rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 transition ${p.color}`}
                        >
                          {p.mult}x {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Block / Unblock Toggle */}
                  <button
                    onClick={() => onToggleBlockEdge(selectedEdge.id)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 border ${
                      selectedEdge.isBlocked
                        ? 'bg-emerald-600/20 text-emerald-300 border-emerald-600/50 hover:bg-emerald-600/30'
                        : 'bg-red-600/20 text-red-300 border-red-600/50 hover:bg-red-600/30'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{selectedEdge.isBlocked ? 'Reopen Roadway' : 'Block Corridor (Accident)'}</span>
                  </button>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-500 space-y-1">
                  <p>Click any road corridor on the graph canvas to inspect and manage its traffic heaviness.</p>
                </div>
              )}
            </div>

            {/* Global Network Traffic Controls */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Global Traffic Surge & Incidents</span>
              </span>

              <div className="flex flex-col gap-2">
                <button
                  onClick={onSimulateAccident}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-red-600/10 text-red-300 border border-red-600/30 hover:bg-red-600/20 transition flex items-center justify-center gap-1.5"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Simulate Random Accident (Triggers Detour)</span>
                </button>

                <button
                  onClick={() => onChangeTrafficMultiplier(3.5)}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-amber-600/10 text-amber-300 border border-amber-600/30 hover:bg-amber-600/20 transition flex items-center justify-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Surge Rush-Hour Congestion (3.5x Citywide)</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onChangeTrafficMultiplier(1.0)}
                    className="py-1.5 px-2 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/40 transition flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Clear Traffic (1.0x)</span>
                  </button>

                  <button
                    onClick={onClearAllBlocks}
                    disabled={blockedCount === 0}
                    className="py-1.5 px-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1"
                  >
                    <span>Clear {blockedCount} Closures</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: NODE (INTERSECTION) MANAGEMENT                */}
        {/* ==================================================== */}
        {activeTab === 'nodes' && (
          <div className="space-y-4">
            {/* Origin & Destination Quick Switcher */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  Route Endpoints
                </span>
                <button
                  onClick={onSwapEndpoints}
                  className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                  title="Swap Origin and Destination"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Origin Hub
                  </label>
                  <select
                    value={sourceId}
                    onChange={(e) => onSelectSource(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.id}: {n.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1 mb-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Target Destination
                  </label>
                  <select
                    value={destinationId}
                    onChange={(e) => onSelectDestination(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.id}: {n.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Add New Node Form */}
            <form onSubmit={handleCreateNode} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Add New Intersection Hub</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Node ID</label>
                  <input
                    type="text"
                    placeholder="e.g. D1"
                    value={newNodeId}
                    onChange={(e) => setNewNodeId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Type</label>
                  <select
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                  >
                    <option value="intersection">Intersection</option>
                    <option value="transit">Transit Hub</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="residential">Residential</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Label / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Downtown Metro Plaza"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">X Position ({newNodeX}px)</label>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    value={newNodeX}
                    onChange={(e) => setNewNodeX(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Y Position ({newNodeY}px)</label>
                  <input
                    type="range"
                    min="100"
                    max="650"
                    value={newNodeY}
                    onChange={(e) => setNewNodeY(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create Hub Node</span>
              </button>
            </form>

            {/* Delete Node Section */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Intersection</span>
              </span>
              <div className="flex gap-2">
                <select
                  id="delete-node-select"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.id}: {n.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const sel = document.getElementById('delete-node-select').value;
                    if (sel) onDeleteNode(sel);
                  }}
                  className="px-3 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-xs font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: EDGES & WEIGHTS MANAGEMENT                    */}
        {/* ==================================================== */}
        {activeTab === 'edges' && (
          <div className="space-y-4">
            {/* Create Edge Connection */}
            <form onSubmit={handleCreateEdge} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Road Connection & Weights</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">From Hub</label>
                  <select
                    value={newFromNode}
                    onChange={(e) => setNewFromNode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.id}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">To Hub</label>
                  <select
                    value={newToNode}
                    onChange={(e) => setNewToNode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.id}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Base Distance (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={newEdgeDistance}
                    onChange={(e) => setNewEdgeDistance(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Speed Limit (km/h)</label>
                  <input
                    type="number"
                    step="5"
                    min="30"
                    max="120"
                    value={newEdgeSpeed}
                    onChange={(e) => setNewEdgeSpeed(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Connect Corridors</span>
              </button>
            </form>

            {/* List & Edit Existing Corridors */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Existing Corridors ({edges.length})</span>
                <span className="text-[10px] text-cyan-400 font-normal">Click to Inspect</span>
              </span>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/60">
                {edges.map(edge => {
                  const isSelected = selectedEdgeId === edge.id;
                  return (
                    <div
                      key={edge.id}
                      onClick={() => onSelectEdge(edge.id)}
                      className={`p-2 rounded-lg cursor-pointer transition text-xs flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-800 border border-cyan-500/60 text-white'
                          : 'bg-slate-900/50 hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">
                          {edge.from} &harr; {edge.to}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {edge.distanceKm} km &bull; {edge.speedLimitKmh} km/h &bull; {edge.trafficMultiplier}x
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {edge.isBlocked && (
                          <span className="text-[10px] font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800">
                            BLOCKED
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEdge(edge.id);
                          }}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                          title="Delete Corridor"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: ROUTING ALGORITHMS & BENCHMARKS               */}
        {/* ==================================================== */}
        {activeTab === 'algorithms' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                Algorithm Selection
              </span>

              <select
                value={algorithm}
                onChange={(e) => onChangeAlgorithm(e.target.value)}
                disabled={isMstMode}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-purple-500"
              >
                <option value="dijkstra">Dijkstra's Algorithm (Custom Min-Heap)</option>
                <option value="astar">A* Search (Euclidean Distance Heuristic)</option>
                <option value="bfs">Breadth-First Search (Fewest Road Hops)</option>
                <option value="dfs">Depth-First Search (Deep Traversal)</option>
              </select>

              <button
                onClick={onRunSimulation}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Compute Shortest Route</span>
              </button>

              <button
                onClick={onToggleMstMode}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 border ${
                  isMstMode
                    ? 'bg-amber-600 text-white border-amber-500 shadow'
                    : 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>{isMstMode ? 'Exit MST Mode' : "Run Kruskal's MST (DSU Spanning Tree)"}</span>
              </button>
            </div>

            {/* Quick Algorithm Architecture Notes */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 text-slate-400">
              <span className="text-[10px] font-bold uppercase text-slate-300">DSA Academic Notes:</span>
              <ul className="space-y-1 text-[11px] list-disc list-inside">
                <li><strong className="text-emerald-400">Dijkstra:</strong> Priority queue frontier expansion &bull; $\mathcal{O}((V+E)\log V)$</li>
                <li><strong className="text-cyan-400">A* Search:</strong> Directed Euclidean heuristic &bull; Explores up to 50% fewer hubs</li>
                <li><strong className="text-amber-400">BFS:</strong> Hop-count minimization &bull; Ignores congestion weights</li>
                <li><strong className="text-purple-400">Kruskal:</strong> Disjoint Set Union (DSU) &bull; Prevents cyclic loops</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 4. FOOTER BENCHMARKS & RESET */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-2">
        <button
          onClick={onOpenComparator}
          className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30 transition flex items-center justify-center gap-1.5"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Multi-Algorithm Benchmark & Viva Mode</span>
        </button>

        <button
          onClick={onResetNetwork}
          className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-300 transition flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Network to 20-Node Grid</span>
        </button>
      </div>
    </aside>
  );
}
