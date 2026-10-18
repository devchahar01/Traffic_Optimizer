import React, { useState, useEffect, useCallback } from 'react';
import { Graph } from './engine/Graph';
import { 
  runDijkstra, runAStar, runBFS, runDFS, runKruskalMST 
} from './engine/algorithms';

import GraphCanvas from './components/GraphCanvas';
import ControlPanel from './components/ControlPanel';
import MetricsPanel from './components/MetricsPanel';
import AlgorithmModal from './components/AlgorithmModal';

export default function App() {
  // 1. GRAPH STATE
  const [graph, setGraph] = useState(() => Graph.createDefaultUrbanGrid());
  const [sourceId, setSourceId] = useState('A1');
  const [destinationId, setDestinationId] = useState('C8');
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [trafficMultiplier, setTrafficMultiplier] = useState(1.0);
  const [selectedEdgeId, setSelectedEdgeId] = useState('e_B1_B2');
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // 2. MODES & MODALS
  const [isMstMode, setIsMstMode] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);

  // 3. TELEMETRY RESULT
  const [telemetryResult, setTelemetryResult] = useState(null);

  // 4. RUN SIMULATION / ROUTE CALCULATION
  const computeRoute = useCallback((src = sourceId, dst = destinationId, algo = algorithm, g = graph, mst = isMstMode) => {
    if (mst) {
      const mstRes = runKruskalMST(g);
      setTelemetryResult({
        ...mstRes,
        path: [],
        pathEdges: [],
        travelTimeMinutes: mstRes.totalTravelTimeMinutes,
        distanceKm: mstRes.totalDistanceKm,
        hops: mstRes.edgesCount,
        nodesExplored: g.getAllNodes().length,
        success: mstRes.isConnected
      });
      return;
    }

    if (!src || !dst) return;

    let res = null;
    switch (algo) {
      case 'astar':
        res = runAStar(g, src, dst);
        break;
      case 'bfs':
        res = runBFS(g, src, dst);
        break;
      case 'dfs':
        res = runDFS(g, src, dst);
        break;
      case 'dijkstra':
      default:
        res = runDijkstra(g, src, dst);
        break;
    }

    setTelemetryResult(res);
  }, [sourceId, destinationId, algorithm, graph, isMstMode]);

  // Initial calculation on mount
  useEffect(() => {
    computeRoute();
  }, [computeRoute]);

  // Trigger state update
  const forceUpdate = () => {
    // Clone or re-reference graph to trigger React re-renders
    setGraph(Object.assign(Object.create(Object.getPrototypeOf(graph)), graph));
  };

  // 5. INTERACTION HANDLERS
  const handleSelectNode = (clickedNodeId) => {
    setSelectedNodeId(clickedNodeId);
    if (!sourceId || (sourceId && destinationId && clickedNodeId !== sourceId)) {
      setDestinationId(clickedNodeId);
      computeRoute(sourceId, clickedNodeId, algorithm, graph, isMstMode);
    } else {
      setSourceId(clickedNodeId);
      computeRoute(clickedNodeId, destinationId, algorithm, graph, isMstMode);
    }
  };

  const handleSwapEndpoints = () => {
    const temp = sourceId;
    setSourceId(destinationId);
    setDestinationId(temp);
    computeRoute(destinationId, temp, algorithm, graph, isMstMode);
  };

  const handleChangeTrafficMultiplier = (multiplier) => {
    setTrafficMultiplier(multiplier);
    for (const edge of graph.getAllEdges()) {
      graph.setTrafficMultiplier(edge.id, multiplier);
    }
    forceUpdate();
    computeRoute(sourceId, destinationId, algorithm, graph, isMstMode);
  };

  const handleUpdateEdge = (edgeId, updates) => {
    graph.updateEdge(edgeId, updates);
    forceUpdate();
    computeRoute(sourceId, destinationId, algorithm, graph, isMstMode);
  };

  const handleToggleBlockEdge = (edgeId) => {
    graph.toggleRoadBlock(edgeId);
    forceUpdate();
    computeRoute(sourceId, destinationId, algorithm, graph, isMstMode);
  };

  const handleAddNode = (id, label, x, y, type) => {
    graph.addNode(id, label, x, y, type);
    forceUpdate();
    computeRoute(sourceId, destinationId, algorithm, graph, isMstMode);
  };

  const handleDeleteNode = (nodeId) => {
    graph.removeNode(nodeId);
    if (sourceId === nodeId) {
      const remaining = graph.getAllNodes();
      setSourceId(remaining[0]?.id || null);
    }
    if (destinationId === nodeId) {
      const remaining = graph.getAllNodes();
      setDestinationId(remaining[1]?.id || remaining[0]?.id || null);
    }
    forceUpdate();
    computeRoute(sourceId, destinationId, algorithm, graph, isMstMode);
  };

  const handleAddEdge = (fromId, toId, options) => {
    const edge = graph.addEdge(fromId, toId, options);
    if (edge) {
      setSelectedEdgeId(edge.id);
    }
    forceUpdate();
    computeRoute(sourceId, destinationId, algorithm, graph, isMstMode);
  };

  const handleDeleteEdge = (edgeId) => {
    graph.removeEdge(edgeId);
    if (selectedEdgeId === edgeId) {
      setSelectedEdgeId(null);
    }
    forceUpdate();
    computeRoute(sourceId, destinationId, algorithm, graph, isMstMode);
  };

  const handleSimulateAccident = () => {
    // Pick an active corridor on the current route to block
    let targetEdgeId = null;
    if (telemetryResult?.pathEdges?.length > 0) {
      const unblocked = telemetryResult.pathEdges.filter(eid => {
        const e = graph.getEdge(eid);
        return e && !e.isBlocked;
      });
      if (unblocked.length > 0) {
        targetEdgeId = unblocked[Math.floor(unblocked.length / 2)];
      }
    }

    if (!targetEdgeId) {
      const allUnblocked = graph.getAllEdges().filter(e => !e.isBlocked);
      if (allUnblocked.length > 0) {
        targetEdgeId = allUnblocked[Math.floor(Math.random() * allUnblocked.length)].id;
      }
    }

    if (targetEdgeId) {
      graph.toggleRoadBlock(targetEdgeId);
      setSelectedEdgeId(targetEdgeId);
      forceUpdate();
      computeRoute(sourceId, destinationId, algorithm, graph, isMstMode);
    }
  };

  const handleClearAllBlocks = () => {
    graph.clearAllBlocks();
    forceUpdate();
    computeRoute(sourceId, destinationId, algorithm, graph, isMstMode);
  };

  const handleResetNetwork = () => {
    const freshGraph = Graph.createDefaultUrbanGrid();
    setGraph(freshGraph);
    setSourceId('A1');
    setDestinationId('C8');
    setTrafficMultiplier(1.0);
    setSelectedEdgeId('e_B1_B2');
    setSelectedNodeId(null);
    setIsMstMode(false);
    computeRoute('A1', 'C8', algorithm, freshGraph, false);
  };

  const allNodes = graph.getAllNodes();
  const allEdges = graph.getAllEdges();

  return (
    <div className="w-screen h-screen flex bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. LEFT GRAPH & TRAFFIC CONTROL PANEL */}
      <ControlPanel
        nodes={allNodes}
        edges={allEdges}
        sourceId={sourceId}
        destinationId={destinationId}
        onSelectSource={(id) => {
          setSourceId(id);
          computeRoute(id, destinationId, algorithm, graph, isMstMode);
        }}
        onSelectDestination={(id) => {
          setDestinationId(id);
          computeRoute(sourceId, id, algorithm, graph, isMstMode);
        }}
        onSwapEndpoints={handleSwapEndpoints}
        algorithm={algorithm}
        onChangeAlgorithm={(algo) => {
          setAlgorithm(algo);
          computeRoute(sourceId, destinationId, algo, graph, isMstMode);
        }}
        onRunSimulation={() => computeRoute(sourceId, destinationId, algorithm, graph, isMstMode)}
        trafficMultiplier={trafficMultiplier}
        onChangeTrafficMultiplier={handleChangeTrafficMultiplier}
        selectedEdgeId={selectedEdgeId}
        onSelectEdge={(eid) => setSelectedEdgeId(eid)}
        onToggleBlockEdge={handleToggleBlockEdge}
        onUpdateEdge={handleUpdateEdge}
        onAddEdge={handleAddEdge}
        onDeleteEdge={handleDeleteEdge}
        onAddNode={handleAddNode}
        onDeleteNode={handleDeleteNode}
        onSimulateAccident={handleSimulateAccident}
        onClearAllBlocks={handleClearAllBlocks}
        onResetNetwork={handleResetNetwork}
        onOpenComparator={() => setIsComparatorOpen(true)}
        isMstMode={isMstMode}
        onToggleMstMode={() => {
          const next = !isMstMode;
          setIsMstMode(next);
          computeRoute(sourceId, destinationId, algorithm, graph, next);
        }}
      />

      {/* 2. MAIN GRAPH TOPOLOGY CANVAS (No Map!) */}
      <div className="flex-1 h-full relative">
        <GraphCanvas
          graph={graph}
          sourceId={sourceId}
          destinationId={destinationId}
          activePath={telemetryResult?.path || []}
          activePathEdges={telemetryResult?.pathEdges || []}
          mstEdges={telemetryResult?.mstEdges || []}
          isMstMode={isMstMode}
          selectedEdgeId={selectedEdgeId}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
          onSelectEdge={(eid) => setSelectedEdgeId(eid)}
          onToggleBlockEdge={handleToggleBlockEdge}
        />

        {/* 3. EMPIRICAL TELEMETRY PANEL */}
        <MetricsPanel
          result={telemetryResult}
          totalNodesCount={allNodes.length}
          algorithmName={isMstMode ? "Kruskal's MST (DSU)" : telemetryResult?.algorithm || algorithm.toUpperCase()}
          sourceId={sourceId}
          destinationId={destinationId}
        />
      </div>

      {/* 4. MULTI-ALGORITHM BENCHMARK & VIVA MODAL */}
      <AlgorithmModal
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
        graph={graph}
        sourceId={sourceId}
        destinationId={destinationId}
      />
    </div>
  );
}
