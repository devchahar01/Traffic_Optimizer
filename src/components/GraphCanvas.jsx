import React, { useState, useRef, useMemo } from 'react';

/**
 * Interactive Graph Topology & Traffic Network Canvas.
 * Replaces the static geographic map with an interactive, weighted graph visualizer.
 * Renders nodes (intersections), weighted edges with real-time traffic heaviness colors,
 * active path flow animations, and midpoint weight telemetry badges.
 */
export default function GraphCanvas({
  graph,
  sourceId,
  destinationId,
  activePath = [],
  activePathEdges = [],
  mstEdges = [],
  isMstMode = false,
  selectedEdgeId = null,
  selectedNodeId = null,
  onSelectNode,
  onSelectEdge,
  onToggleBlockEdge
}) {
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1100, height: 750 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const allNodes = useMemo(() => graph.getAllNodes(), [graph]);
  const allEdges = useMemo(() => graph.getAllEdges(), [graph]);

  // Map of node IDs to Node objects for fast lookup
  const nodeMap = useMemo(() => {
    const map = new Map();
    for (const node of allNodes) {
      map.set(node.id, node);
    }
    return map;
  }, [allNodes]);

  // Set of edges on active path
  const activeEdgeSet = useMemo(() => new Set(activePathEdges), [activePathEdges]);
  const activeNodeSet = useMemo(() => new Set(activePath), [activePath]);
  const mstEdgeSet = useMemo(() => new Set(mstEdges), [mstEdges]);

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.id === 'canvas-bg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.x) * (viewBox.width / 1100);
    const dy = (e.clientY - dragStart.y) * (viewBox.height / 750);
    setViewBox(prev => ({
      ...prev,
      x: prev.x - dx,
      y: prev.y - dy
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (factor) => {
    setViewBox(prev => {
      const newWidth = Math.max(500, Math.min(2000, prev.width * factor));
      const newHeight = Math.max(350, Math.min(1400, prev.height * factor));
      const dx = (newWidth - prev.width) / 2;
      const dy = (newHeight - prev.height) / 2;
      return {
        x: prev.x - dx,
        y: prev.y - dy,
        width: newWidth,
        height: newHeight
      };
    });
  };

  const handleResetZoom = () => {
    setViewBox({ x: 0, y: 0, width: 1100, height: 750 });
  };

  // Helper to get traffic color
  const getEdgeTrafficColor = (edge) => {
    if (edge.isBlocked) return '#EF4444'; // Red
    const mult = edge.trafficMultiplier || 1.0;
    if (mult === 1.0) return '#10B981'; // Emerald
    if (mult <= 2.0) return '#F59E0B'; // Amber
    if (mult <= 3.5) return '#F97316'; // Orange
    return '#E11D48'; // Severe Crimson
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* 1. TOP STATUS BAR OVERLAY */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg px-4 py-2 shadow-lg flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Interactive Graph Canvas
            </span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <span className="text-xs font-mono text-cyan-400">
            {allNodes.length} Hubs &bull; {allEdges.length} Corridors
          </span>
          {isMstMode && (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              MST Mode Active ({mstEdges.length} links)
            </span>
          )}
        </div>
      </div>

      {/* 2. ZOOM & RESET CONTROLS */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-1.5 shadow-lg">
        <button
          onClick={() => handleZoom(0.85)}
          title="Zoom In"
          className="w-8 h-8 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition text-lg font-bold"
        >
          +
        </button>
        <button
          onClick={() => handleZoom(1.15)}
          title="Zoom Out"
          className="w-8 h-8 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition text-lg font-bold"
        >
          &minus;
        </button>
        <button
          onClick={handleResetZoom}
          title="Reset View"
          className="px-2.5 h-8 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition text-xs font-medium"
        >
          Reset
        </button>
      </div>

      {/* 3. BOTTOM LEGEND OVERLAY */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/95 backdrop-blur border border-slate-800/90 rounded-lg px-4 py-2.5 shadow-xl flex items-center gap-5 text-xs text-slate-300">
        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Traffic Heaviness:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full bg-emerald-500" />
          <span>1.0x Free Flow</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full bg-amber-500" />
          <span>1.5x–2.0x Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full bg-orange-500" />
          <span>2.5x–3.5x Heavy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full bg-rose-600" />
          <span>4.0x–10.0x Gridlock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full bg-red-600 border border-white" />
          <span className="text-red-400 font-semibold">⛔ Blocked / Closed</span>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE SVG GRAPH CANVAS */}
      <svg
        className={`w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'}`}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <defs>
          {/* Grid Background Pattern */}
          <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.75" />
          </pattern>

          {/* Glow Filters */}
          <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="amber-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="red-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Markers */}
          <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#00F0FF" />
          </marker>
        </defs>

        {/* Canvas Background */}
        <rect id="canvas-bg" x="-500" y="-500" width="3000" height="2500" fill="#030712" />
        <rect id="canvas-grid" x="-500" y="-500" width="3000" height="2500" fill="url(#graph-grid)" />

        {/* ZONE BOUNDARY LABELS IN BACKGROUND */}
        <g opacity="0.15" className="pointer-events-none">
          <text x="140" y="60" fill="#38BDF8" fontSize="22" fontWeight="800" letterSpacing="4">ZONE A // INBOUND LOGISTICS & SUBURBS</text>
          <text x="680" y="60" fill="#A855F7" fontSize="22" fontWeight="800" letterSpacing="4">ZONE B // FINANCIAL & COMMERCIAL CORE</text>
          <text x="200" y="440" fill="#34D399" fontSize="22" fontWeight="800" letterSpacing="4">ZONE C // RESIDENTIAL & EXPRESSWAY</text>
        </g>

        {/* ==================================================== */}
        {/* LAYER 1: EDGES (CORRIDORS)                           */}
        {/* ==================================================== */}
        <g id="edges-layer">
          {allEdges.map(edge => {
            const u = nodeMap.get(edge.from);
            const v = nodeMap.get(edge.to);
            if (!u || !v) return null;

            const isSelected = selectedEdgeId === edge.id;
            const isHovered = hoveredEdgeId === edge.id;
            const isActivePath = activeEdgeSet.has(edge.id);
            const isMstEdge = mstEdgeSet.has(edge.id);

            const trafficColor = getEdgeTrafficColor(edge);
            const strokeWidth = isActivePath ? 5.5 : isSelected ? 4.5 : isMstEdge ? 4.0 : 2.8;

            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;
            const travelTimeMin = graph.calculateEdgeWeight(edge);

            return (
              <g
                key={edge.id}
                className="cursor-pointer group"
                onClick={() => onSelectEdge(edge.id)}
                onMouseEnter={() => setHoveredEdgeId(edge.id)}
                onMouseLeave={() => setHoveredEdgeId(null)}
              >
                {/* Invisible Wider Hitbox for Easy Clicking */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke="transparent"
                  strokeWidth="20"
                />

                {/* Base Edge Line */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={edge.isBlocked ? '#DC2626' : trafficColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={edge.isBlocked ? "8,6" : "none"}
                  strokeOpacity={
                    isMstMode
                      ? isMstEdge ? 1.0 : 0.2
                      : isActivePath ? 0.4 : isHovered || isSelected ? 1.0 : 0.75
                  }
                  className="transition-all duration-200"
                />

                {/* Active Shortest Path Animated Cyan Overlay */}
                {isActivePath && !isMstMode && (
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#00F0FF"
                    strokeWidth="5"
                    strokeDasharray="12,8"
                    filter="url(#cyan-glow)"
                    className="animate-flow-dash"
                  />
                )}

                {/* MST Spanning Tree Golden Highlight */}
                {isMstMode && isMstEdge && (
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#FBBF24"
                    strokeWidth="5"
                    filter="url(#amber-glow)"
                  />
                )}

                {/* Corridor Midpoint Telemetry Pill Badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  {edge.isBlocked ? (
                    <g>
                      <rect
                        x="-48"
                        y="-12"
                        width="96"
                        height="24"
                        rx="12"
                        fill="#7F1D1D"
                        stroke="#EF4444"
                        strokeWidth="1.5"
                        filter="url(#red-glow)"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        ⛔ CLOSED
                      </text>
                    </g>
                  ) : (
                    <g>
                      <rect
                        x={isActivePath ? "-42" : "-36"}
                        y="-10"
                        width={isActivePath ? "84" : "72"}
                        height="20"
                        rx="10"
                        fill={isActivePath ? "#083344" : isSelected ? "#312E81" : "#0F172A"}
                        stroke={isActivePath ? "#06B6D4" : isSelected ? "#818CF8" : trafficColor}
                        strokeWidth={isActivePath || isSelected ? "1.5" : "1"}
                        className="transition-all"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill={isActivePath ? "#E0F2FE" : "#CBD5E1"}
                        fontSize="9.5"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {edge.distanceKm}k &bull; {travelTimeMin < 100 ? `${travelTimeMin.toFixed(1)}m` : '∞'}
                      </text>
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        </g>

        {/* ==================================================== */}
        {/* LAYER 2: NODES (INTERSECTIONS)                       */}
        {/* ==================================================== */}
        <g id="nodes-layer">
          {allNodes.map(node => {
            const isSource = node.id === sourceId;
            const isDestination = node.id === destinationId;
            const isInActivePath = activeNodeSet.has(node.id);
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;

            // Node visual color based on role
            let fillColor = "#1E293B";
            let strokeColor = "#475569";
            let glowFilter = "none";
            let radius = 18;

            if (isSource) {
              fillColor = "#065F46";
              strokeColor = "#10B981";
              glowFilter = "url(#emerald-glow)";
              radius = 22;
            } else if (isDestination) {
              fillColor = "#164E63";
              strokeColor = "#06B6D4";
              glowFilter = "url(#cyan-glow)";
              radius = 22;
            } else if (isInActivePath && !isMstMode) {
              fillColor = "#0E7490";
              strokeColor = "#38BDF8";
              radius = 19;
            } else if (isHovered || isSelected) {
              fillColor = "#3730A3";
              strokeColor = "#818CF8";
              radius = 20;
            } else {
              // Zone-based node colors
              if (node.id.startsWith("A")) strokeColor = "#38BDF8";
              else if (node.id.startsWith("B")) strokeColor = "#A855F7";
              else strokeColor = "#34D399";
            }

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={() => onSelectNode(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                {/* Outer Pulsing Halo for Origin / Destination */}
                {(isSource || isDestination) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 8}
                    fill="none"
                    stroke={isSource ? "#10B981" : "#00F0FF"}
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    opacity="0.8"
                    className="animate-spin-slow origin-center"
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  />
                )}

                {/* Node Main Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSource || isDestination ? 3 : 2}
                  filter={glowFilter}
                  className="transition-all duration-150"
                />

                {/* Node ID Code Inside Circle */}
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={radius > 20 ? "11.5" : "10"}
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="pointer-events-none"
                >
                  {node.id}
                </text>

                {/* Node Descriptive Label Below */}
                <g transform={`translate(${node.x}, ${node.y + radius + 14})`} className="pointer-events-none">
                  <rect
                    x={-(node.label.length * 3.4 + 8)}
                    y="-8"
                    width={node.label.length * 6.8 + 16}
                    height="16"
                    rx="4"
                    fill="#0F172A"
                    fillOpacity="0.85"
                    stroke={isSource ? "#10B981" : isDestination ? "#06B6D4" : "#334155"}
                    strokeWidth="0.75"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill={isSource ? "#6EE7B7" : isDestination ? "#7DD3FC" : "#CBD5E1"}
                    fontSize="9.5"
                    fontWeight="500"
                    fontFamily="sans-serif"
                  >
                    {node.label}
                  </text>
                </g>

                {/* Origin / Destination Tag Badges */}
                {isSource && (
                  <g transform={`translate(${node.x}, ${node.y - radius - 10})`}>
                    <rect x="-24" y="-7" width="48" height="15" rx="3" fill="#047857" stroke="#10B981" strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="bold">ORIGIN</text>
                  </g>
                )}
                {isDestination && (
                  <g transform={`translate(${node.x}, ${node.y - radius - 10})`}>
                    <rect x="-22" y="-7" width="44" height="15" rx="3" fill="#0E7490" stroke="#00F0FF" strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="bold">TARGET</text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
