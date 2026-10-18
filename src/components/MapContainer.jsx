import React, { useMemo } from 'react';
import { MapContainer as LeafletMap, TileLayer, CircleMarker, Polyline, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Map click handler that leverages the QuadTree SpatialIndex to snap clicks to nearest graph nodes in O(log N).
 */
function MapClickHandler({ spatialIndex, onSnapNode }) {
  useMapEvents({
    click(e) {
      if (!spatialIndex) return;
      const { lat, lng } = e.latlng;
      const nearest = spatialIndex.findNearest(lat, lng);
      if (nearest && nearest.node) {
        onSnapNode(nearest.node.id);
      }
    }
  });
  return null;
}

export default function MapContainer({
  graph,
  spatialIndex,
  sourceId,
  destinationId,
  activePath = [],
  activePathEdges = [],
  mstEdges = [],
  isMstMode = false,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge
}) {
  const nodes = graph.getAllNodes();
  const edges = graph.getAllEdges();

  const activePathEdgeSet = useMemo(() => new Set(activePathEdges), [activePathEdges]);
  const activePathNodeSet = useMemo(() => new Set(activePath), [activePath]);
  const mstEdgeSet = useMemo(() => new Set(mstEdges), [mstEdges]);

  // Center coordinates around central landmark (e.g. Central Grand Plaza)
  const center = useMemo(() => {
    if (nodes.length === 0) return [40.750, -73.985];
    const avgLat = nodes.reduce((sum, n) => sum + n.lat, 0) / nodes.length;
    const avgLng = nodes.reduce((sum, n) => sum + n.lng, 0) / nodes.length;
    return [avgLat, avgLng];
  }, [nodes]);

  return (
    <div className="w-full h-full relative select-none">
      <LeafletMap
        center={center}
        zoom={14}
        minZoom={12}
        maxZoom={18}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* Professional Enterprise OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Spatial Index Snap Handler */}
        <MapClickHandler spatialIndex={spatialIndex} onSnapNode={onSelectNode} />

        {/* 1. Road Edges */}
        {edges.map(edge => {
          const u = graph.getNode(edge.from);
          const v = graph.getNode(edge.to);
          if (!u || !v) return null;

          const isPath = activePathEdgeSet.has(edge.id);
          const isMst = isMstMode && mstEdgeSet.has(edge.id);
          const isSelected = selectedEdgeId === edge.id;

          let color = '#64748b'; // Slate-500
          let weight = 3.5;
          let opacity = 0.75;
          let dashArray = null;

          if (edge.isBlocked) {
            color = '#dc2626'; // Red-600
            weight = 4.5;
            opacity = 1.0;
            dashArray = '6, 6';
          } else if (isPath) {
            color = '#10b981'; // Emerald-500
            weight = 6.0;
            opacity = 0.95;
          } else if (isMst) {
            color = '#f59e0b'; // Amber-500
            weight = 5.0;
            opacity = 0.95;
          } else if (edge.trafficMultiplier >= 2.0) {
            color = '#ea580c'; // Orange-600
            weight = 4.0;
            opacity = 0.85;
          } else if (edge.trafficMultiplier >= 1.4) {
            color = '#d97706'; // Amber-600
            weight = 3.5;
            opacity = 0.8;
          }

          if (isSelected) {
            weight += 2.0;
            color = '#2563eb';
          }

          return (
            <Polyline
              key={edge.id}
              positions={[[u.lat, u.lng], [v.lat, v.lng]]}
              pathOptions={{
                color,
                weight,
                opacity,
                dashArray
              }}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  onSelectEdge(edge.id);
                }
              }}
            >
              <Tooltip sticky>
                <div className="font-sans text-xs">
                  <div className="font-bold text-slate-800">{edge.label}</div>
                  <div className="text-slate-600">
                    Distance: <strong>{edge.distanceKm} km</strong> | Speed: <strong>{edge.speedLimitKmh} km/h</strong>
                  </div>
                  <div className="text-slate-600">
                    Traffic: <strong>{edge.trafficMultiplier.toFixed(1)}x</strong> | Travel Time: <strong>{graph.calculateEdgeWeight(edge).toFixed(1)} min</strong>
                  </div>
                  {edge.isBlocked && (
                    <div className="text-red-600 font-bold mt-0.5">ROAD CLOSED / BLOCKED</div>
                  )}
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* 2. Intersections (Nodes) */}
        {nodes.map(node => {
          const isSource = node.id === sourceId;
          const isDest = node.id === destinationId;
          const isInPath = activePathNodeSet.has(node.id);

          let fillColor = '#334155'; // Slate-700
          let strokeColor = '#ffffff';
          let radius = 6;
          let weight = 2;

          if (isSource) {
            fillColor = '#10b981'; // Emerald
            strokeColor = '#064e3b';
            radius = 10;
            weight = 3;
          } else if (isDest) {
            fillColor = '#2563eb'; // Royal Blue
            strokeColor = '#1e3a8a';
            radius = 10;
            weight = 3;
          } else if (isInPath) {
            fillColor = '#059669';
            strokeColor = '#ecfdf5';
            radius = 7.5;
            weight = 2;
          }

          return (
            <CircleMarker
              key={node.id}
              center={[node.lat, node.lng]}
              radius={radius}
              pathOptions={{
                fillColor,
                fillOpacity: 1.0,
                color: strokeColor,
                weight
              }}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  onSelectNode(node.id);
                }
              }}
            >
              <Tooltip permanent={isSource || isDest} direction="top" offset={[0, -8]}>
                <div className="font-sans text-xs">
                  <span className={`font-bold ${isSource ? 'text-emerald-700' : isDest ? 'text-blue-700' : 'text-slate-800'}`}>
                    {isSource ? 'SOURCE: ' : isDest ? 'DESTINATION: ' : ''}
                    {node.label}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px] block">
                    ID: {node.id} | ({node.lat.toFixed(4)}, {node.lng.toFixed(4)})
                  </span>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </LeafletMap>
    </div>
  );
}
