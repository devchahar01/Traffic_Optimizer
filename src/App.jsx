import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Graph } from './engine/Graph';
import { 
  dijkstraGenerator, aStarGenerator, bfsGenerator, dfsGenerator, 
  kruskalGenerator, runAlgorithmInstant 
} from './engine/algorithms';

import CityScene from './components/three/CityScene';
import TopNav from './components/ui/TopNav';
import ControlPanel from './components/ui/ControlPanel';
import MetricsBar from './components/ui/MetricsBar';
import ComparatorModal from './components/ui/ComparatorModal';

export default function App() {
  // 1. GRAPH STATE
  const [graph, setGraph] = useState(() => Graph.createDefaultGrid());
  const [sourceId, setSourceId] = useState('A1');
  const [destinationId, setDestinationId] = useState('C8');
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [trafficMultiplier, setTrafficMultiplier] = useState(1.0);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  // 2. VIEW MODES & MODALS
  const [isMstMode, setIsMstMode] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);

  // 3. TELEMETRY & PLAYBACK STATE
  const [telemetryResult, setTelemetryResult] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playbackTimerRef = useRef(null);

  // Helper to get generator function for current algorithm
  const getGeneratorFn = useCallback((algoId = algorithm) => {
    switch (algoId) {
      case 'astar': return aStarGenerator;
      case 'bfs': return bfsGenerator;
      case 'dfs': return dfsGenerator;
      case 'kruskal': return kruskalGenerator;
      case 'dijkstra':
      default:
        return dijkstraGenerator;
    }
  }, [algorithm]);

  // 4. INSTANT RE-CALCULATION
  const computeRoute = useCallback((src = sourceId, dst = destinationId, algo = algorithm, g = graph) => {
    if (isMstMode) {
      const result = runAlgorithmInstant(kruskalGenerator, g);
      setTelemetryResult(result);
      if (result.allSteps?.length > 0) {
        setCurrentStepIndex(result.allSteps.length - 1);
      }
      return;
    }

    if (!src || !dst) return;
    const generatorFn = getGeneratorFn(algo);
    const result = runAlgorithmInstant(generatorFn, g, src, dst);
    setTelemetryResult(result);
    if (result.allSteps?.length > 0) {
      setCurrentStepIndex(result.allSteps.length - 1); // Point to final optimal path
    }
  }, [sourceId, destinationId, algorithm, graph, isMstMode, getGeneratorFn]);

  // Initial calculation on load
  useEffect(() => {
    computeRoute();
  }, [computeRoute]);

  // 5. STEP PLAYBACK TIMER
  useEffect(() => {
    if (isPlaying && telemetryResult?.allSteps?.length > 0) {
      const delay = Math.max(50, Math.floor(500 / playbackSpeed));
      playbackTimerRef.current = setTimeout(() => {
        if (currentStepIndex < telemetryResult.allSteps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }

    return () => {
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    };
  }, [isPlaying, currentStepIndex, telemetryResult, playbackSpeed]);

  // 6. INTERACTION HANDLERS
  const handleSelectNode = (clickedNodeId) => {
    if (!sourceId || (sourceId && destinationId && clickedNodeId !== sourceId)) {
      // If destination already chosen or clicking a new destination
      setDestinationId(clickedNodeId);
      computeRoute(sourceId, clickedNodeId, algorithm, graph);
    } else {
      setSourceId(clickedNodeId);
      computeRoute(clickedNodeId, destinationId, algorithm, graph);
    }
  };

  const handleSwapEndpoints = () => {
    const temp = sourceId;
    setSourceId(destinationId);
    setDestinationId(temp);
    computeRoute(destinationId, temp, algorithm, graph);
  };

  const handleChangeTrafficMultiplier = (multiplier) => {
    setTrafficMultiplier(multiplier);
    // Apply multiplier to all edges
    for (const edge of graph.getAllEdges()) {
      graph.setTrafficMultiplier(edge.id, multiplier);
    }
    computeRoute(sourceId, destinationId, algorithm, graph);
  };

  const handleToggleBlockSelectedRoad = () => {
    if (!selectedEdgeId) return;
    graph.toggleRoadBlock(selectedEdgeId);
    computeRoute(sourceId, destinationId, algorithm, graph);
  };

  const handleSimulateBlockage = () => {
    // Prefer blocking an edge on the current route
    let edgeToBlock = null;
    if (telemetryResult?.currentPathEdges?.length > 0) {
      const unblocked = telemetryResult.currentPathEdges.filter(eid => {
        const e = graph.getEdge(eid);
        return e && !e.isBlocked;
      });
      if (unblocked.length > 0) {
        edgeToBlock = unblocked[Math.floor(Math.random() * unblocked.length)];
      }
    }

    if (!edgeToBlock) {
      const allEdges = graph.getAllEdges().filter(e => !e.isBlocked);
      if (allEdges.length > 0) {
        edgeToBlock = allEdges[Math.floor(Math.random() * allEdges.length)].id;
      }
    }

    if (edgeToBlock) {
      graph.toggleRoadBlock(edgeToBlock);
      setSelectedEdgeId(edgeToBlock);
      computeRoute(sourceId, destinationId, algorithm, graph);
    }
  };

  const handleResetNetwork = () => {
    const newGraph = Graph.createDefaultGrid();
    setGraph(newGraph);
    setTrafficMultiplier(1.0);
    setSelectedEdgeId(null);
    setIsMstMode(false);
    computeRoute(sourceId, destinationId, algorithm, newGraph);
  };

  const handleSurgeTraffic = () => {
    for (const edge of graph.getAllEdges()) {
      const surge = 1.0 + Math.random() * 5.0;
      graph.setTrafficMultiplier(edge.id, Number(surge.toFixed(1)));
    }
    computeRoute(sourceId, destinationId, algorithm, graph);
  };

  // Current active step data from playback
  const currentStep = telemetryResult?.allSteps?.[currentStepIndex] || telemetryResult || {};
  const activePath = currentStep.currentPath || telemetryResult?.currentPath || [];
  const activePathEdges = currentStep.currentPathEdges || telemetryResult?.currentPathEdges || [];
  const visitedNodes = currentStep.visitedNodes || telemetryResult?.visitedNodes || [];
  const frontierNodes = currentStep.frontierQueue || [];
  const currentNode = currentStep.currentNode || null;
  const activeEdge = currentStep.activeEdge || null;
  const mstEdges = currentStep.mstEdges || telemetryResult?.mstEdges || [];

  const blockedCount = graph.getAllEdges().filter(e => e.isBlocked).length;
  const nodesList = graph.getAllNodes();
  const edgesList = graph.getAllEdges();

  return (
    <div className="w-screen h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
      {/* 1. TOP TACTICAL NAVIGATION */}
      <TopNav
        isMstMode={isMstMode}
        onToggleMstMode={() => {
          const next = !isMstMode;
          setIsMstMode(next);
          if (next) {
            const result = runAlgorithmInstant(kruskalGenerator, graph);
            setTelemetryResult(result);
            setCurrentStepIndex(result.allSteps.length - 1);
          } else {
            computeRoute(sourceId, destinationId, algorithm, graph);
          }
        }}
        onOpenComparator={() => setIsComparatorOpen(true)}
        onResetNetwork={handleResetNetwork}
        onSurgeTraffic={handleSurgeTraffic}
        blockedCount={blockedCount}
      />

      {/* 2. MAIN 3D WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side Control Panel */}
        <ControlPanel
          nodes={nodesList}
          edges={edgesList}
          sourceId={sourceId}
          destinationId={destinationId}
          onSelectSource={(id) => {
            setSourceId(id);
            computeRoute(id, destinationId, algorithm, graph);
          }}
          onSelectDestination={(id) => {
            setDestinationId(id);
            computeRoute(sourceId, id, algorithm, graph);
          }}
          onSwapEndpoints={handleSwapEndpoints}
          algorithm={algorithm}
          onChangeAlgorithm={(algo) => {
            setAlgorithm(algo);
            computeRoute(sourceId, destinationId, algo, graph);
          }}
          trafficMultiplier={trafficMultiplier}
          onChangeTrafficMultiplier={handleChangeTrafficMultiplier}
          selectedEdgeId={selectedEdgeId}
          onToggleBlockSelectedRoad={handleToggleBlockSelectedRoad}
          onSimulateBlockage={handleSimulateBlockage}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onStepForward={() => setCurrentStepIndex(prev => Math.min((telemetryResult?.allSteps?.length || 1) - 1, prev + 1))}
          onResetPlayback={() => {
            setIsPlaying(false);
            setCurrentStepIndex(0);
          }}
          currentStepIndex={currentStepIndex}
          totalSteps={telemetryResult?.allSteps?.length || 0}
          currentStepData={currentStep}
          playbackSpeed={playbackSpeed}
          onChangePlaybackSpeed={setPlaybackSpeed}
        />

        {/* 3D City Scene Viewport */}
        <div className="flex-1 h-full relative">
          <CityScene
            graph={graph}
            sourceNodeId={sourceId}
            destinationNodeId={destinationId}
            activePath={activePath}
            activePathEdges={activePathEdges}
            visitedNodes={visitedNodes}
            frontierNodes={frontierNodes}
            currentNode={currentNode}
            activeEdge={activeEdge}
            mstEdges={mstEdges}
            isMstMode={isMstMode}
            onSelectNode={handleSelectNode}
            onSelectRoad={(edgeId) => setSelectedEdgeId(edgeId)}
          />

          {/* Real-time Telemetry HUD Bar */}
          <MetricsBar
            result={telemetryResult}
            totalNodesCount={nodesList.length}
            algorithmName={isMstMode ? "Kruskal's MST" : algorithm.toUpperCase()}
            sourceId={sourceId}
            destinationId={destinationId}
          />
        </div>
      </div>

      {/* 3. MULTI-ALGORITHM COMPARATOR MODAL */}
      <ComparatorModal
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
        graph={graph}
        sourceId={sourceId}
        destinationId={destinationId}
      />
    </div>
  );
}
