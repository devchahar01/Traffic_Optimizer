import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function IntersectionMesh({
  node,
  isSource,
  isDestination,
  isCurrent,
  isInPath,
  isVisited,
  isFrontier,
  onSelectNode
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const ringRef = useRef();

  // Determine state-based color and emissive glow
  let baseColor = '#1e293b';
  let emissiveColor = '#0f172a';
  let emissiveIntensity = 0.2;

  if (isSource) {
    baseColor = '#10b981';
    emissiveColor = '#10b981';
    emissiveIntensity = 1.6;
  } else if (isDestination) {
    baseColor = '#00f0ff';
    emissiveColor = '#00f0ff';
    emissiveIntensity = 1.6;
  } else if (isCurrent) {
    baseColor = '#f59e0b';
    emissiveColor = '#f59e0b';
    emissiveIntensity = 1.8;
  } else if (isInPath) {
    baseColor = '#34d399';
    emissiveColor = '#10b981';
    emissiveIntensity = 1.2;
  } else if (isFrontier) {
    baseColor = '#c084fc';
    emissiveColor = '#a855f7';
    emissiveIntensity = 0.8;
  } else if (isVisited) {
    baseColor = '#6366f1';
    emissiveColor = '#4f46e5';
    emissiveIntensity = 0.5;
  } else if (hovered) {
    baseColor = '#38bdf8';
    emissiveColor = '#0ea5e9';
    emissiveIntensity = 1.0;
  }

  // Beacon rotation & subtle breathing animation
  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.5;
      if (isSource || isDestination || isCurrent) {
        const s = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
        ringRef.current.scale.set(s, s, s);
      }
    }
  });

  return (
    <group position={[node.x, node.y, node.z]}>
      {/* 3D Hub Cylinder */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode && onSelectNode(node.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        scale={hovered ? 1.25 : 1.0}
      >
        <cylinderGeometry args={[0.9, 1.1, 0.7, 24]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Top Beacon Pulse Ring */}
      <mesh ref={ringRef} position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.35, 32]} />
        <meshBasicMaterial
          color={emissiveColor}
          side={THREE.DoubleSide}
          transparent
          opacity={isSource || isDestination || isCurrent || hovered ? 0.9 : 0.3}
        />
      </mesh>

      {/* HTML Floating Tactical Billboard */}
      <Html
        position={[0, 1.4, 0]}
        center
        distanceFactor={28}
        className="pointer-events-none select-none"
      >
        <div className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-bold whitespace-nowrap border shadow-lg backdrop-blur-md transition-all ${
          isSource ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 ring-2 ring-emerald-500/30' :
          isDestination ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 ring-2 ring-cyan-500/30' :
          isCurrent ? 'bg-amber-950/90 text-amber-300 border-amber-500/60' :
          isInPath ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' :
          hovered ? 'bg-slate-900/90 text-cyan-300 border-cyan-500/50 scale-110' :
          'bg-slate-950/70 text-slate-400 border-slate-800'
        }`}>
          {isSource && '★ SOURCE: '}
          {isDestination && '⚑ DEST: '}
          {node.label} [{node.id}]
        </div>
      </Html>
    </group>
  );
}
