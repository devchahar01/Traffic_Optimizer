/**
 * High-Performance Graph Data Structure for Traffic Network Optimization.
 * Maintains an Adjacency List using JavaScript Maps for O(1) lookups of nodes and weighted road edges.
 * Matches the C++ Graph engine architecture.
 */
export class Graph {
  constructor() {
    this.nodes = new Map(); // id -> { id, label, x, y, type }
    this.edges = new Map(); // id -> { id, from, to, distanceKm, speedLimitKmh, trafficMultiplier, isBlocked, isBidirectional, label }
    this.adjacency = new Map(); // nodeId -> Edge[]
  }

  addNode(id, label, x, y, type = 'intersection') {
    this.nodes.set(id, {
      id,
      label: label || id,
      x: Number(x),
      y: Number(y),
      type
    });

    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, []);
    }
  }

  removeNode(nodeId) {
    if (!this.nodes.has(nodeId)) return false;

    // Find all incident edges and remove them
    const incidentEdgeIds = [];
    for (const edge of this.edges.values()) {
      if (edge.from === nodeId || edge.to === nodeId) {
        incidentEdgeIds.push(edge.id);
      }
    }

    for (const eid of incidentEdgeIds) {
      this.removeEdge(eid);
    }

    this.adjacency.delete(nodeId);
    this.nodes.delete(nodeId);
    return true;
  }

  addEdge(fromId, toId, options = {}) {
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);
    if (!fromNode || !toNode) return null;

    // Calculate Euclidean distance in km if not specified
    let baseDistanceKm = options.distanceKm;
    if (baseDistanceKm === undefined || baseDistanceKm === null) {
      const dx = fromNode.x - toNode.x;
      const dy = fromNode.y - toNode.y;
      const pixelDist = Math.sqrt(dx * dx + dy * dy);
      // Scale: 100 pixels ≈ 7.5 km
      baseDistanceKm = Number(((pixelDist / 100) * 7.5).toFixed(1));
    }

    const edgeId = options.id || `e_${fromId}_${toId}`;

    const edge = {
      id: edgeId,
      from: fromId,
      to: toId,
      distanceKm: Number(baseDistanceKm),
      speedLimitKmh: Number(options.speedLimitKmh || 60.0),
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
      this.adjacency.get(toId).push({
        ...edge,
        from: toId,
        to: fromId
      });
    }

    return edge;
  }

  removeEdge(edgeId) {
    const edge = this.edges.get(edgeId);
    if (!edge) return false;

    // Remove from adjacency lists
    const cleanAdj = (nodeId) => {
      const list = this.adjacency.get(nodeId);
      if (list) {
        this.adjacency.set(nodeId, list.filter(e => e.id !== edgeId));
      }
    };

    cleanAdj(edge.from);
    cleanAdj(edge.to);

    this.edges.delete(edgeId);
    return true;
  }

  updateEdge(edgeId, updates = {}) {
    const edge = this.edges.get(edgeId);
    if (!edge) return null;

    if (updates.distanceKm !== undefined) edge.distanceKm = Number(updates.distanceKm);
    if (updates.speedLimitKmh !== undefined) edge.speedLimitKmh = Number(updates.speedLimitKmh);
    if (updates.trafficMultiplier !== undefined) edge.trafficMultiplier = Math.max(1.0, Number(updates.trafficMultiplier));
    if (updates.isBlocked !== undefined) edge.isBlocked = Boolean(updates.isBlocked);
    if (updates.label !== undefined) edge.label = updates.label;

    // Keep bidirectional entry synchronized in adjacency map
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
    const effectiveSpeed = Math.max(5.0, (edge.speedLimitKmh || 60.0) / mult);
    return (edge.distanceKm / effectiveSpeed) * 60.0; // Minutes
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

  surgeRandomTraffic() {
    for (const edge of this.edges.values()) {
      // Random traffic multiplier between 1.5x and 5.0x
      edge.trafficMultiplier = Number((1.5 + Math.random() * 3.5).toFixed(1));
    }
  }

  /**
   * Pre-loads the official 20-Node Tactical Metropolitan Network.
   * Matches the C++ Engine (src/Graph.cpp) with 3 distinct metropolitan zones.
   */
  static createDefaultUrbanGrid() {
    const graph = new Graph();

    // Zone A: Inbound Logistics & Western Suburbs
    graph.addNode("A1", "North Gateway Hub", 120, 100, "gateway");
    graph.addNode("A2", "Airport Interchange", 280, 80, "transit");
    graph.addNode("A3", "Industrial Terminal", 460, 100, "industrial");
    graph.addNode("A4", "Tech Park West", 180, 240, "commercial");
    graph.addNode("A5", "Cargo Freight Depot", 350, 220, "transit");
    graph.addNode("A6", "Northwest Junction", 520, 240, "intersection");
    graph.addNode("A7", "Academic Center", 280, 350, "education");

    // Zone B: Central Commercial & Financial Core
    graph.addNode("B1", "Grand Central Plaza", 700, 110, "core");
    graph.addNode("B2", "Financial District", 880, 90, "commercial");
    graph.addNode("B3", "Medical City Hub", 680, 260, "hospital");
    graph.addNode("B4", "Midtown Junction", 820, 240, "intersection");
    graph.addNode("B5", "Waterfront Pier", 960, 240, "harbor");
    graph.addNode("B6", "Government Center", 760, 370, "government");

    // Zone C: Outbound Residential & Southern Expressway
    graph.addNode("C1", "South Hills Terminal", 200, 500, "residential");
    graph.addNode("C2", "East River Overpass", 380, 480, "bridge");
    graph.addNode("C3", "Sports Arena Loop", 550, 500, "entertainment");
    graph.addNode("C4", "Southeast Gateway", 730, 500, "gateway");
    graph.addNode("C5", "Valley Metro Hub", 900, 480, "transit");
    graph.addNode("C6", "East Logistics Park", 420, 630, "industrial");
    graph.addNode("C7", "South Perimeter Junction", 620, 630, "intersection");
    graph.addNode("C8", "South Metro Interchange", 820, 630, "transit");

    // Zone A Corridors
    graph.addEdge("A1", "A2", { id: "e_A1_A2", distanceKm: 8.5, speedLimitKmh: 80.0, trafficMultiplier: 1.0, label: "Airport Expressway" });
    graph.addEdge("A2", "A3", { id: "e_A2_A3", distanceKm: 7.2, speedLimitKmh: 60.0, trafficMultiplier: 1.2, label: "Industrial Arterial" });
    graph.addEdge("A1", "A4", { id: "e_A1_A4", distanceKm: 6.0, speedLimitKmh: 50.0, trafficMultiplier: 1.0, label: "Gateway West Spur" });
    graph.addEdge("A4", "A5", { id: "e_A4_A5", distanceKm: 7.8, speedLimitKmh: 60.0, trafficMultiplier: 1.5, label: "Tech Corridor" });
    graph.addEdge("A5", "A6", { id: "e_A5_A6", distanceKm: 6.5, speedLimitKmh: 50.0, trafficMultiplier: 1.1, label: "Freight Connector" });
    graph.addEdge("A3", "A6", { id: "e_A3_A6", distanceKm: 5.4, speedLimitKmh: 50.0, trafficMultiplier: 1.0, label: "East Terminal Link" });
    graph.addEdge("A4", "A7", { id: "e_A4_A7", distanceKm: 8.0, speedLimitKmh: 50.0, trafficMultiplier: 1.0, label: "University Way" });
    graph.addEdge("A5", "A7", { id: "e_A5_A7", distanceKm: 5.5, speedLimitKmh: 45.0, trafficMultiplier: 1.0, label: "Midtown South Link" });
    graph.addEdge("A6", "A7", { id: "e_A6_A7", distanceKm: 9.2, speedLimitKmh: 60.0, trafficMultiplier: 1.0, label: "Academic Bypass" });

    // Zone B Corridors
    graph.addEdge("B1", "B2", { id: "e_B1_B2", distanceKm: 5.0, speedLimitKmh: 45.0, trafficMultiplier: 2.2, label: "Wall Street Strip" });
    graph.addEdge("B1", "B3", { id: "e_B1_B3", distanceKm: 6.8, speedLimitKmh: 50.0, trafficMultiplier: 1.8, label: "Central Medical Way" });
    graph.addEdge("B2", "B4", { id: "e_B2_B4", distanceKm: 6.2, speedLimitKmh: 50.0, trafficMultiplier: 1.5, label: "Financial South Cut" });
    graph.addEdge("B3", "B4", { id: "e_B3_B4", distanceKm: 5.8, speedLimitKmh: 45.0, trafficMultiplier: 1.4, label: "Midtown Cross Street" });
    graph.addEdge("B4", "B5", { id: "e_B4_B5", distanceKm: 4.5, speedLimitKmh: 40.0, trafficMultiplier: 1.0, label: "Harbor Pier Access" });
    graph.addEdge("B3", "B6", { id: "e_B3_B6", distanceKm: 5.5, speedLimitKmh: 50.0, trafficMultiplier: 1.2, label: "Civic Plaza Way" });
    graph.addEdge("B4", "B6", { id: "e_B4_B6", distanceKm: 6.0, speedLimitKmh: 50.0, trafficMultiplier: 1.1, label: "Government Loop" });

    // Cross-Zone Connectors (Zone A <-> Zone B)
    graph.addEdge("A3", "B1", { id: "e_A3_B1", distanceKm: 12.0, speedLimitKmh: 90.0, trafficMultiplier: 1.2, label: "Metro Northern Highway" });
    graph.addEdge("A6", "B3", { id: "e_A6_B3", distanceKm: 10.5, speedLimitKmh: 70.0, trafficMultiplier: 2.0, label: "Mid-City Transversal" });
    graph.addEdge("A7", "B6", { id: "e_A7_B6", distanceKm: 14.0, speedLimitKmh: 80.0, trafficMultiplier: 1.0, label: "Grand Boulevard Overpass" });

    // Zone C Corridors
    graph.addEdge("C1", "C2", { id: "e_C1_C2", distanceKm: 7.5, speedLimitKmh: 60.0, trafficMultiplier: 1.0, label: "Hills Parkway" });
    graph.addEdge("C2", "C3", { id: "e_C2_C3", distanceKm: 6.8, speedLimitKmh: 55.0, trafficMultiplier: 1.3, label: "Riverfront Road" });
    graph.addEdge("C3", "C4", { id: "e_C3_C4", distanceKm: 7.2, speedLimitKmh: 60.0, trafficMultiplier: 1.0, label: "Stadium Loop" });
    graph.addEdge("C4", "C5", { id: "e_C4_C5", distanceKm: 8.0, speedLimitKmh: 70.0, trafficMultiplier: 1.4, label: "Southeast Arterial" });
    graph.addEdge("C1", "C6", { id: "e_C1_C6", distanceKm: 9.0, speedLimitKmh: 50.0, trafficMultiplier: 1.0, label: "Valley South Road" });
    graph.addEdge("C2", "C6", { id: "e_C2_C6", distanceKm: 7.0, speedLimitKmh: 55.0, trafficMultiplier: 1.0, label: "Overpass South Spur" });
    graph.addEdge("C3", "C7", { id: "e_C3_C7", distanceKm: 6.5, speedLimitKmh: 60.0, trafficMultiplier: 1.0, label: "Arena Perimeter Cut" });
    graph.addEdge("C4", "C7", { id: "e_C4_C7", distanceKm: 7.8, speedLimitKmh: 60.0, trafficMultiplier: 1.1, label: "Gateway South Connector" });
    graph.addEdge("C4", "C8", { id: "e_C4_C8", distanceKm: 8.2, speedLimitKmh: 75.0, trafficMultiplier: 1.0, label: "South Interchange Link" });
    graph.addEdge("C5", "C8", { id: "e_C5_C8", distanceKm: 6.5, speedLimitKmh: 65.0, trafficMultiplier: 1.0, label: "Valley Parkway" });
    graph.addEdge("C6", "C7", { id: "e_C6_C7", distanceKm: 8.0, speedLimitKmh: 60.0, trafficMultiplier: 1.0, label: "Southern Beltway West" });
    graph.addEdge("C7", "C8", { id: "e_C7_C8", distanceKm: 7.5, speedLimitKmh: 70.0, trafficMultiplier: 1.0, label: "Southern Beltway East" });

    // Cross-Zone Connectors (Zone A/B <-> Zone C)
    graph.addEdge("A7", "C1", { id: "e_A7_C1", distanceKm: 11.0, speedLimitKmh: 65.0, trafficMultiplier: 1.0, label: "Academic Hills Arterial" });
    graph.addEdge("A7", "C2", { id: "e_A7_C2", distanceKm: 9.5, speedLimitKmh: 60.0, trafficMultiplier: 1.2, label: "River Bridge Crossing" });
    graph.addEdge("B3", "C3", { id: "e_B3_C3", distanceKm: 10.0, speedLimitKmh: 65.0, trafficMultiplier: 1.5, label: "Central Arena Express" });
    graph.addEdge("B6", "C4", { id: "e_B6_C4", distanceKm: 8.5, speedLimitKmh: 70.0, trafficMultiplier: 1.0, label: "Civic Gateway Flyover" });
    graph.addEdge("B5", "C5", { id: "e_B5_C5", distanceKm: 11.5, speedLimitKmh: 80.0, trafficMultiplier: 1.0, label: "Harbor Shoreway" });

    return graph;
  }
}
