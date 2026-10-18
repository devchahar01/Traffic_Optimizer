import React, { useMemo, useState } from 'react';
import * as THREE from 'three';

export default function RoadMesh({
  edge,
  fromNode,
  toNode,
  isInPath,
  isMst,
  isActiveStep,
  onSelectRoad
}) {
  const [hovered, setHovered] = useState(false);

  // Compute position, length, and orientation in 3D
  const { midpoint, length, quaternion } = useMemo(() => {
    if (!fromNode || !toNode) {
      return { midpoint: [0, 0, 0], length: 1, quaternion: new THREE.Quaternion() };
    }

    const p1 = new THREE.Vector3(fromNode.x, fromNode.y, fromNode.z);
    const p2 = new THREE.Vector3(toNode.x, toNode.y, toNode.z);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();

    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.normalize());

    return {
      midpoint: [mid.x, mid.y, mid.z],
      length: len,
      quaternion: quat
    };
  }, [fromNode, toNode]);

  if (!fromNode || !toNode) return null;

  // Determine road color & glow based on state & congestion
  let color = '#38bdf8';
  let emissive = '#0284c7';
  let emissiveIntensity = 0.3;
  let radius = 0.18;

  if (edge.isBlocked) {
    color = '#ef4444';
    emissive = '#dc2626';
    emissiveIntensity = 1.4;
    radius = 0.28;
  } else if (isInPath) {
    color = '#00f0ff';
    emissive = '#10b981';
    emissiveIntensity = 2.0;
    radius = 0.36;
  } else if (isMst) {
    color = '#fbbf24';
    emissive = '#f59e0b';
    emissiveIntensity = 1.5;
    radius = 0.32;
  } else if (isActiveStep) {
    color = '#f43f5e';
    emissive = '#f43f5e';
    emissiveIntensity = 1.6;
    radius = 0.32;
  } else if (edge.trafficMultiplier >= 2.5) {
    color = '#ea580c'; // Severe traffic
    emissive = '#c2410c';
    emissiveIntensity = 0.8;
    radius = 0.24;
  } else if (edge.trafficMultiplier >= 1.5) {
    color = '#f59e0b'; // Moderate traffic
    emissive = '#d97706';
    emissiveIntensity = 0.5;
    radius = 0.22;
  } else {
    color = '#0284c7'; // Free flow
    emissive = '#0369a1';
    emissiveIntensity = 0.25;
    radius = 0.18;
  }

  if (hovered) {
    emissiveIntensity += 0.8;
    radius += 0.08;
  }

  return (
    <group position={midpoint} quaternion={quaternion}>
      {/* 3D Road Cylinder */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectRoad && onSelectRoad(edge.id);
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
      >
        <cylinderGeometry args={[radius, radius, length, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
          metalness={0.7}
          transparent={!edge.isBlocked && !isInPath}
          opacity={edge.isBlocked || isInPath ? 1.0 : 0.75}
        />
      </mesh>

      {/* Hazard Warning Beacon on Blocked Roads */}
      {edge.isBlocked && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshBasicMaterial color="#ef4444" wireframe />
        </mesh>
      )}
    </group>
  );
}
