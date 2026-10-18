import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function TrafficFlow({ pathNodeIds, graph }) {
  const particlesCount = 8;
  const particlesRef = useRef([]);

  // Extract 3D Vector points along the active route
  const waypoints = useMemo(() => {
    if (!pathNodeIds || pathNodeIds.length < 2) return [];
    return pathNodeIds
      .map(id => graph.getNode(id))
      .filter(Boolean)
      .map(node => new THREE.Vector3(node.x, node.y + 0.35, node.z));
  }, [pathNodeIds, graph]);

  // Total segments
  const totalSegments = Math.max(1, waypoints.length - 1);

  // Initialize particle states with staggered start positions
  const particleStates = useMemo(() => {
    return Array.from({ length: particlesCount }, (_, i) => ({
      globalProgress: i / particlesCount, // 0.0 to 1.0 along entire path
      speed: 0.15 + (i % 3) * 0.04
    }));
  }, [particlesCount]);

  // Mesh instances
  useFrame((state, delta) => {
    if (waypoints.length < 2) return;

    particleStates.forEach((p, idx) => {
      p.globalProgress = (p.globalProgress + delta * p.speed) % 1.0;

      // Map global progress to specific segment
      const scaled = p.globalProgress * totalSegments;
      const segIndex = Math.floor(scaled);
      const segProgress = scaled - segIndex;

      const p1 = waypoints[segIndex];
      const p2 = waypoints[Math.min(waypoints.length - 1, segIndex + 1)];

      if (p1 && p2 && particlesRef.current[idx]) {
        particlesRef.current[idx].position.lerpVectors(p1, p2, segProgress);
      }
    });
  });

  if (waypoints.length < 2) return null;

  return (
    <group>
      {particleStates.map((_, idx) => (
        <mesh
          key={idx}
          ref={el => (particlesRef.current[idx] = el)}
          position={[waypoints[0].x, waypoints[0].y, waypoints[0].z]}
        >
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#10b981"
            emissiveIntensity={3.0}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}
