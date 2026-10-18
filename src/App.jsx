import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Graph } from './engine/Graph';
import { SpatialIndex } from './engine/SpatialIndex';
import { 
  runDijkstra, runAStar, runBFS, runDFS, runKruskalMST 
} from './engine/algorithms';

import MapContainer from './components/MapContainer';
import ControlPanel from './components/ControlPanel';
import MetricsPanel from './components/MetricsPanel';
import AlgorithmModal from './components/AlgorithmModal';

export default function App() {
  // 1. GRAPH & SPATIAL INDEX STATE
  const [graph, setGraph] = useState(() => Graph.createDefaultUrbanGrid());
  const [sourceId, setSourceId] = useState('INT_0_0');
  const [destinationId, setDestinationId] = useState('INT_4_4');
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [trafficMultiplier, setTrafficMultiplier] = useState(1.0);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  // 2. MODES & MODALS
  const [isMstMode, setIsMstMode] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);

  // 3. TELEMETRY RESULT
  const [telemetryResult, setTelemetryResult] = useState(null);

  // Spatial Index (QuadTree) for O(log N) lat/lng node snapping
  const spatialIndex = useMemo(() => {
    return SpatialIndex.fromNodes(graph.getAllNodes());
  }, [graph]);

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

  // 5. INTERACTION HANDLERS
  const handleSelectNode = (clickedNodeId) => {
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
    computeRoute(sourceId, destinationId, algorithm, graph, isMstMode);
  };

  const handleToggleBlockEdge = (edgeId) => {
    graph.toggleRoadBlock(edgeId);
    computeRoute(sourceId, destinationId, algorithm, graph, isMstMode);
  };

  const handleSimulateAccident = () => {
    // Pick a critical road along the active path to simulate an accident
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
      computeRoute(sourceId, destinationId, algorithm, graph, isMstMode);
    }
  };

  const handleClearAllBlocks = () => {
    graph.clearAllBlocks();
    computeRoute(sourceId, destinationId, algorithm, graph, isMstMode);
  };

  const handleResetNetwork = () => {
    const freshGraph = Graph.createDefaultUrbanGrid();
    setGraph(freshGraph);
    setTrafficMultiplier(1.0);
    setSelectedEdgeId(null);
    setIsMstMode(false);
    computeRoute(sourceId, destinationId, algorithm, freshGraph, false);
  };

  const allNodes = graph.getAllNodes();
  const allEdges = graph.getAllEdges();

  return (
    <div className="w-screen h-screen flex bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. LEFT DISPATCH CONTROL PANEL */}
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
        onToggleBlockEdge={handleToggleBlockEdge}
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

      {/* 2. LEAFLET GIS MAP CONTAINER */}
      <div className="flex-1 h-full relative">
        <MapContainer
          graph={graph}
          spatialIndex={spatialIndex}
          sourceId={sourceId}
          destinationId={destinationId}
          activePath={telemetryResult?.path || []}
          activePathEdges={telemetryResult?.pathEdges || []}
          mstEdges={telemetryResult?.mstEdges || []}
          isMstMode={isMstMode}
          selectedEdgeId={selectedEdgeId}
          onSelectNode={handleSelectNode}
          onSelectEdge={(eid) => setSelectedEdgeId(eid)}
        />

        {/* 3. EMPIRICAL TELEMETRY PANEL */}
        <MetricsPanel
          result={telemetryResult}
          totalNodesCount={allNodes.length}
          algorithmName={isMstMode ? "Kruskal's MST" : telemetryResult?.algorithm || algorithm.toUpperCase()}
          sourceId={sourceId}
          destinationId={destinationId}
        />
      </div>

      {/* 4. ALGORITHM COMPARATOR MODAL */}
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
