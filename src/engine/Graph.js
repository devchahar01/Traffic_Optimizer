/**
 * Core Graph Data Structure modeling a 3D Urban Traffic Network.
 * Maintains an adjacency list of 3D vector-positioned nodes and dynamically weighted edges.
 */
export class Graph {
  constructor() {
    this.nodes = new Map(); // id -> { id, label, x, y, z, type }
    this.edges = new Map(); // id -> { id, from, to, baseWeight, trafficMultiplier, isBlocked, length }
    this.adjacency = new Map(); // nodeId -> Set of edgeIds
  }

  addNode(id, x, y, z, metadata = {}) {
    this.nodes.set(id, {
      id,
      label: metadata.label || id,
      type: metadata.type || 'junction',
      x: Number(x),
      y: Number(y),
      z: Number(z),
      ...metadata
    });

    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, new Set());
    }
  }

  addEdge(fromId, toId, baseWeight = 1.0, options = {}) {
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);
    if (!fromNode || !toNode) return null;

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const dz = toNode.z - fromNode.z;
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const edgeId = options.id || `edge_${fromId}_${toId}`;
    const edge = {
      id: edgeId,
      from: fromId,
      to: toId,
      baseWeight: Number(baseWeight || length),
      trafficMultiplier: Number(options.trafficMultiplier || 1.0),
      isBlocked: Boolean(options.isBlocked || false),
      length: Number(length.toFixed(2)),
      isBidirectional: options.isBidirectional !== false,
      label: options.label || `${fromId} ↔ ${toId}`
    };

    this.edges.set(edgeId, edge);

    if (!this.adjacency.has(fromId)) this.adjacency.set(fromId, new Set());
    this.adjacency.get(fromId).add(edgeId);

    if (edge.isBidirectional) {
      if (!this.adjacency.has(toId)) this.adjacency.set(toId, new Set());
      this.adjacency.get(toId).add(edgeId);
    }

    return edge;
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getEdge(id) {
    return this.edges.get(id);
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  getAllEdges() {
    return Array.from(this.edges.values());
  }

  getNeighbors(nodeId) {
    const edgeIds = this.adjacency.get(nodeId);
    if (!edgeIds) return [];

    const neighbors = [];
    for (const edgeId of edgeIds) {
      const edge = this.edges.get(edgeId);
      if (!edge) continue;

      const targetNodeId = edge.from === nodeId ? edge.to : edge.from;
      const targetNode = this.nodes.get(targetNodeId);

      neighbors.push({
        node: targetNode,
        nodeId: targetNodeId,
        edge,
        weight: this.calculateEdgeWeight(edge)
      });
    }

    return neighbors;
  }

  calculateEdgeWeight(edge) {
    if (edge.isBlocked) return Infinity;
    const multiplier = Math.max(1.0, edge.trafficMultiplier || 1.0);
    return edge.baseWeight * multiplier;
  }

  getEuclideanDistance(nodeAId, nodeBId) {
    const a = this.nodes.get(nodeAId);
    const b = this.nodes.get(nodeBId);
    if (!a || !b) return 0;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  setTrafficMultiplier(edgeId, multiplier) {
    const edge = this.edges.get(edgeId);
    if (edge) {
      edge.trafficMultiplier = Math.max(1.0, Number(multiplier));
    }
  }

  toggleRoadBlock(edgeId) {
    const edge = this.edges.get(edgeId);
    if (edge) {
      edge.isBlocked = !edge.isBlocked;
      return edge.isBlocked;
    }
    return false;
  }

  clearAllBlocks() {
    for (const edge of this.edges.values()) {
      edge.isBlocked = false;
    }
  }

  resetAllTraffic() {
    for (const edge of this.edges.values()) {
      edge.trafficMultiplier = 1.0;
    }
  }

  /**
   * Generates a tactical 20-node Cyber-Metropolis 3D grid with elevated highways,
   * subterranean tubes, commercial downtown cores, and cross-district bridges.
   */
  static createDefaultGrid() {
    const graph = new Graph();

    // 20 Tactical City Hub Nodes mapped in 3D Space (X, Y, Z)
    // Center is (0, 0, 0), Y is vertical elevation
    const nodeConfigs = [
      // Sector Alpha (West Commercial Core)
      { id: 'A1', label: 'Sky-Port Terminal', x: -18, y: 1.5, z: -14, type: 'port' },
      { id: 'A2', label: 'Alpha Highway Gate', x: -9, y: 0.8, z: -14, type: 'highway' },
      { id: 'A3', label: 'Financial Monolith', x: -18, y: 0.0, z: -5, type: 'commercial' },
      { id: 'A4', label: 'Downtown Transit Node', x: -9, y: 0.0, z: -5, type: 'hub' },
      { id: 'A5', label: 'West Residential Spoke', x: -18, y: 0.0, z: 5, type: 'residential' },
      { id: 'A6', label: 'West Canal Crossing', x: -9, y: 0.2, z: 5, type: 'bridge' },
      { id: 'A7', label: 'Cargo Logistics Deck', x: -18, y: 0.0, z: 14, type: 'industrial' },
      { id: 'A8', label: 'Southwest Substation', x: -9, y: 0.0, z: 14, type: 'utility' },

      // Sector Beta (Central Spine & Elevated Expressway)
      { id: 'B1', label: 'North Bypass Flyover', x: 0, y: 3.5, z: -14, type: 'highway' },
      { id: 'B2', label: 'Grand Central Plaza', x: 0, y: 0.0, z: -5, type: 'hub' },
      { id: 'B3', label: 'Cyber Tower Interchange', x: 0, y: 1.2, z: 5, type: 'hub' },
      { id: 'B4', label: 'South Expressway Link', x: 0, y: 3.0, z: 14, type: 'highway' },

      // Sector Gamma (East High-Tech & Medical District)
      { id: 'C1', label: 'Quantum Tech Park', x: 9, y: 0.5, z: -14, type: 'tech' },
      { id: 'C2', label: 'East Skyway Pylon', x: 18, y: 2.0, z: -14, type: 'highway' },
      { id: 'C3', label: 'Trauma Medical Center', x: 9, y: 0.0, z: -5, type: 'hospital' },
      { id: 'C4', label: 'Biotech Labs Campus', x: 18, y: 0.0, z: -5, type: 'tech' },
      { id: 'C5', label: 'East Canal Bridge', x: 9, y: 0.2, z: 5, type: 'bridge' },
      { id: 'C6', label: 'University Complex', x: 18, y: 0.0, z: 5, type: 'university' },
      { id: 'C7', label: 'East Waterfront Pier', x: 9, y: 0.0, z: 14, type: 'port' },
      { id: 'C8', label: 'Southeast Arcology', x: 18, y: 0.0, z: 14, type: 'residential' }
    ];

    nodeConfigs.forEach(n => graph.addNode(n.id, n.x, n.y, n.z, n));

    // Connect nodes with tactical weighted road edges
    const edgeConnections = [
      // Sector A Horizontal & Vertical Links
      { from: 'A1', to: 'A2', weight: 9.0, traffic: 1.0 },
      { from: 'A1', to: 'A3', weight: 9.0, traffic: 1.0 },
      { from: 'A2', to: 'A4', weight: 9.0, traffic: 1.4 },
      { from: 'A3', to: 'A4', weight: 9.0, traffic: 1.8 },
      { from: 'A3', to: 'A5', weight: 10.0, traffic: 1.0 },
      { from: 'A4', to: 'A6', weight: 10.0, traffic: 1.2 },
      { from: 'A5', to: 'A6', weight: 9.0, traffic: 1.0 },
      { from: 'A5', to: 'A7', weight: 9.0, traffic: 1.0 },
      { from: 'A6', to: 'A8', weight: 9.0, traffic: 1.0 },
      { from: 'A7', to: 'A8', weight: 9.0, traffic: 1.0 },

      // Sector A to Sector B (Central Crossings)
      { from: 'A2', to: 'B1', weight: 9.5, traffic: 1.2 },
      { from: 'A4', to: 'B2', weight: 9.0, traffic: 2.2 }, // Central downtown jam
      { from: 'A6', to: 'B3', weight: 9.5, traffic: 1.3 },
      { from: 'A8', to: 'B4', weight: 9.5, traffic: 1.0 },

      // Sector B Central Spine (North to South)
      { from: 'B1', to: 'B2', weight: 10.0, traffic: 1.5 },
      { from: 'B2', to: 'B3', weight: 10.0, traffic: 2.5 }, // Peak CBD congestion
      { from: 'B3', to: 'B4', weight: 10.0, traffic: 1.1 },

      // Sector B to Sector C (East Crossings)
      { from: 'B1', to: 'C1', weight: 9.5, traffic: 1.1 },
      { from: 'B2', to: 'C3', weight: 9.0, traffic: 1.9 }, // Medical corridor
      { from: 'B3', to: 'C5', weight: 9.5, traffic: 1.2 },
      { from: 'B4', to: 'C7', weight: 9.5, traffic: 1.0 },

      // Sector C Internal Links
      { from: 'C1', to: 'C2', weight: 9.0, traffic: 1.0 },
      { from: 'C1', to: 'C3', weight: 9.0, traffic: 1.4 },
      { from: 'C2', to: 'C4', weight: 9.0, traffic: 1.0 },
      { from: 'C3', to: 'C4', weight: 9.0, traffic: 1.6 },
      { from: 'C3', to: 'C5', weight: 10.0, traffic: 1.2 },
      { from: 'C4', to: 'C6', weight: 10.0, traffic: 1.0 },
      { from: 'C5', to: 'C6', weight: 9.0, traffic: 1.0 },
      { from: 'C5', to: 'C7', weight: 9.0, traffic: 1.0 },
      { from: 'C6', to: 'C8', weight: 9.0, traffic: 1.0 },
      { from: 'C7', to: 'C8', weight: 9.0, traffic: 1.0 },

      // High-Speed Express Diagonals & Flyovers
      { from: 'A1', to: 'A4', weight: 13.0, traffic: 1.0 },
      { from: 'A4', to: 'B1', weight: 13.5, traffic: 1.1 },
      { from: 'B1', to: 'C4', weight: 13.5, traffic: 1.0 },
      { from: 'A6', to: 'B4', weight: 13.5, traffic: 1.0 },
      { from: 'B4', to: 'C5', weight: 13.5, traffic: 1.0 }
    ];

    edgeConnections.forEach((conn, index) => {
      graph.addEdge(conn.from, conn.to, conn.weight, {
        id: `e_${conn.from}_${conn.to}`,
        trafficMultiplier: conn.traffic,
        isBlocked: false,
        label: `Corridor ${index + 1}`
      });
    });

    return graph;
  }
}
