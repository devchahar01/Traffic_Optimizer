import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import IntersectionMesh from './IntersectionMesh';
import RoadMesh from './RoadMesh';
import TrafficFlow from './TrafficFlow';

export default function CityScene({
  graph,
  sourceNodeId,
  destinationNodeId,
  activePath = [],
  activePathEdges = [],
  visitedNodes = [],
  frontierNodes = [],
  currentNode = null,
  activeEdge = null,
  mstEdges = [],
  isMstMode = false,
  onSelectNode,
  onSelectRoad
}) {
  const nodes = graph.getAllNodes();
  const edges = graph.getAllEdges();

  const pathNodeSet = new Set(activePath);
  const pathEdgeSet = new Set(activePathEdges);
  const visitedSet = new Set(visitedNodes);
  const frontierSet = new Set(frontierNodes);
  const mstEdgeSet = new Set(mstEdges);

  return (
    <div className="w-full h-full relative select-none bg-slate-950">
      <Canvas
        camera={{ position: [0, 32, 38], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        {/* Deep Cyberpunk Dark Atmosphere */}
        <color attach="background" args={['#070a12']} />
        <fog attach="fog" args={['#070a12', 35, 105]} />

        {/* Tactical Lighting */}
        <ambientLight intensity={0.65} color="#67e8f9" />
        <directionalLight
          position={[25, 45, 20]}
          intensity={1.2}
          color="#ffffff"
          castShadow
        />
        <pointLight position={[0, 15, 0]} intensity={1.5} color="#00f0ff" distance={60} />
        <pointLight position={[-15, 10, -10]} intensity={0.8} color="#10b981" distance={40} />
        <pointLight position={[15, 10, 10]} intensity={0.8} color="#f43f5e" distance={40} />

        {/* Orbit Camera Controls with Smooth Tactical Damping */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={12}
          maxDistance={85}
          target={[0, 0, 0]}
        />

        <Suspense fallback={null}>
          {/* Tactical Cyber Grid Floor */}
          <Grid
            position={[0, -0.4, 0]}
            args={[120, 120]}
            cellSize={2}
            cellThickness={0.8}
            cellColor="#0f172a"
            sectionSize={10}
            sectionThickness={1.4}
            sectionColor="#1e293b"
            fadeDistance={90}
            fadeStrength={1.5}
          />

          {/* 3D Road Meshes */}
          <group>
            {edges.map(edge => {
              const u = graph.getNode(edge.from);
              const v = graph.getNode(edge.to);
              if (!u || !v) return null;

              const isEdgeInPath = pathEdgeSet.has(edge.id);
              const isEdgeInMst = isMstMode && mstEdgeSet.has(edge.id);
              const isCurrentEdge = activeEdge === edge.id;

              return (
                <RoadMesh
                  key={edge.id}
                  edge={edge}
                  fromNode={u}
                  toNode={v}
                  isInPath={isEdgeInPath}
                  isMst={isEdgeInMst}
                  isActiveStep={isCurrentEdge}
                  onSelectRoad={onSelectRoad}
                />
              );
            })}
          </group>

          {/* 3D Node / Intersection Meshes */}
          <group>
            {nodes.map(node => {
              const isSource = node.id === sourceNodeId;
              const isDestination = node.id === destinationNodeId;
              const isCurrent = currentNode === node.id;
              const isInPath = pathNodeSet.has(node.id);
              const isVisited = visitedSet.has(node.id);
              const isFrontier = frontierSet.has(node.id);

              return (
                <IntersectionMesh
                  key={node.id}
                  node={node}
                  isSource={isSource}
                  isDestination={isDestination}
                  isCurrent={isCurrent}
                  isInPath={isInPath}
                  isVisited={isVisited}
                  isFrontier={isFrontier}
                  onSelectNode={onSelectNode}
                />
              );
            })}
          </group>

          {/* Real-time Vehicular Particle Flow along Active Path */}
          {activePath.length >= 2 && !isMstMode && (
            <TrafficFlow pathNodeIds={activePath} graph={graph} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
