import { calculateHaversineDistance } from './SpatialIndex';

/**
 * Enterprise GIS Graph Data Structure.
 * Maintains an Adjacency List using JavaScript Maps for O(1) lookups of nodes and weighted road edges.
 */
export class Graph {
  constructor() {
    this.nodes = new Map(); // id -> { id, label, lat, lng, type, description }
    this.edges = new Map(); // id -> { id, from, to, distanceKm, speedLimitKmh, trafficMultiplier, isBlocked, label }
    this.adjacency = new Map(); // nodeId -> Edge[]
  }

  addNode(id, label, lat, lng, type = 'intersection', description = '') {
    this.nodes.set(id, {
      id,
      label: label || id,
      lat: Number(lat),
      lng: Number(lng),
      type,
      description
    });

    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, []);
    }
  }

  addEdge(fromId, toId, options = {}) {
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);
    if (!fromNode || !toNode) return null;

    const baseDistanceKm = options.distanceKm || calculateHaversineDistance(fromNode.lat, fromNode.lng, toNode.lat, toNode.lng);
    const edgeId = options.id || `e_${fromId}_${toId}`;

    const edge = {
      id: edgeId,
      from: fromId,
      to: toId,
      distanceKm: Number(baseDistanceKm.toFixed(3)),
      speedLimitKmh: options.speedLimitKmh || 50.0,
      trafficMultiplier: Number(options.trafficMultiplier || 1.0),
      isBlocked: Boolean(options.isBlocked || false),
      isBidirectional: options.isBidirectional !== false,
      label: options.label || `${fromNode.label} ↔ ${toNode.label}`
    };

    this.edges.set(edgeId, edge);

    if (!this.adjacency.has(fromId)) this.adjacency.set(fromId, []);
    this.adjacency.get(fromId).push(edge);

    if (edge.isBidirectional) {
      if (!this.adjacency.has(toId)) this.adjacency.set(toId, []);
      // Reverse direction edge pointing to same edge metadata
      this.adjacency.get(toId).push({
        ...edge,
        from: toId,
        to: fromId
      });
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
    const edges = this.adjacency.get(nodeId) || [];
    return edges.map(edge => ({
      targetNodeId: edge.to,
      edgeId: edge.id,
      weight: this.calculateEdgeWeight(edge),
      distanceKm: edge.distanceKm,
      isBlocked: edge.isBlocked,
      edge
    }));
  }

  calculateEdgeWeight(edge) {
    if (edge.isBlocked) {
      return Infinity;
    }
    const mult = Math.max(1.0, edge.trafficMultiplier || 1.0);
    const effectiveSpeed = Math.max(5.0, (edge.speedLimitKmh || 50.0) / mult);
    return (edge.distanceKm / effectiveSpeed) * 60.0; // Travel time in minutes
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
   * Pre-loads a structured 25-Node Urban Downtown Grid (5x5 sectors)
   * Centered on a realistic metropolitan district with realistic geographical coordinates,
   * arterial highways, bridges, and cross-town corridors.
   */
  static createDefaultUrbanGrid() {
    const graph = new Graph();

    // Base coordinates: Metropolitan Downtown Sector (e.g., Lat ~40.750, Lng ~-73.985)
    const baseLat = 40.7500;
    const baseLng = -73.9850;
    const latStep = 0.0065; // ~720 meters
    const lngStep = 0.0085; // ~715 meters

    const nodeTypes = ['transit', 'commercial', 'hospital', 'residential', 'university', 'harbor'];

    // Generate 5x5 Grid (25 nodes: N_0_0 to N_4_4)
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const id = `INT_${r}_${c}`;
        const lat = baseLat + (2 - r) * latStep;
        const lng = baseLng + (c - 2) * lngStep;

        let label = `Avenue ${c + 1} & ${r + 1}th St`;
        let type = 'intersection';

        // Specific named landmarks
        if (r === 0 && c === 0) { label = 'North-West Transit Hub'; type = 'transit'; }
        else if (r === 0 && c === 4) { label = 'Airport Expressway Gate'; type = 'transit'; }
        else if (r === 2 && c === 2) { label = 'Central Grand Plaza'; type = 'commercial'; }
        else if (r === 1 && c === 3) { label = 'Metropolitan Hospital'; type = 'hospital'; }
        else if (r === 3 && c === 1) { label = 'University Campus'; type = 'university'; }
        else if (r === 4 && c === 0) { label = 'Cargo Harbor Terminal'; type = 'harbor'; }
        else if (r === 4 && c === 4) { label = 'South Tech Park'; type = 'commercial'; }

        graph.addNode(id, label, lat, lng, type);
      }
    }

    // Connect Horizontal Streets & Vertical Avenues
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const currId = `INT_${r}_${c}`;

        // Horizontal road to east neighbor
        if (c < 4) {
          const eastId = `INT_${r}_${c + 1}`;
          const isBottleneck = (r === 2); // Center crosstown street has heavy default traffic
          graph.addEdge(currId, eastId, {
            id: `street_r${r}_c${c}_c${c + 1}`,
            speedLimitKmh: 45.0,
            trafficMultiplier: isBottleneck ? 2.2 : 1.0,
            label: `${r + 1}th Street Segment`
          });
        }

        // Vertical road to south neighbor
        if (r < 4) {
          const southId = `INT_${r + 1}_${c}`;
          const isAvenueHighway = (c === 2); // Central avenue is a high-speed arterial
          graph.addEdge(currId, southId, {
            id: `ave_c${c}_r${r}_r${r + 1}`,
            speedLimitKmh: isAvenueHighway ? 65.0 : 50.0,
            trafficMultiplier: 1.0,
            label: `Avenue ${c + 1} Corridor`
          });
        }
      }
    }

    // Add High-Speed Diagonal Arterials / Bypasses (Broadway style)
    graph.addEdge('INT_0_0', 'INT_1_1', {
      id: 'express_diag_1',
      speedLimitKmh: 70.0,
      trafficMultiplier: 1.0,
      label: 'Northwest Diagonal Expressway'
    });

    graph.addEdge('INT_1_1', 'INT_2_2', {
      id: 'express_diag_2',
      speedLimitKmh: 70.0,
      trafficMultiplier: 1.5,
      label: 'Grand Central Diagonal Link'
    });

    graph.addEdge('INT_2_2', 'INT_3_3', {
      id: 'express_diag_3',
      speedLimitKmh: 70.0,
      trafficMultiplier: 1.1,
      label: 'South-East Commercial Flyover'
    });

    graph.addEdge('INT_3_3', 'INT_4_4', {
      id: 'express_diag_4',
      speedLimitKmh: 70.0,
      trafficMultiplier: 1.0,
      label: 'Tech Park Expressway Spur'
    });

    // Cross-town river crossing
    graph.addEdge('INT_2_1', 'INT_2_2', {
      id: 'bridge_crossing',
      speedLimitKmh: 55.0,
      trafficMultiplier: 1.8,
      label: 'Metropolitan River Bridge'
    });

    return graph;
  }
}
