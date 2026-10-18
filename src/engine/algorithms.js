import { MinHeap } from './MinHeap';
import { DisjointSet } from './DisjointSet';

/**
 * Reconstructs path backwards from previous node pointers.
 */
function reconstructPath(prev, prevEdge, targetId, sourceId) {
  const path = [];
  const edges = [];
  let curr = targetId;

  while (curr !== null && curr !== undefined) {
    path.unshift(curr);
    if (prevEdge.has(curr) && prevEdge.get(curr) !== null) {
      edges.unshift(prevEdge.get(curr));
    }
    if (curr === sourceId) break;
    curr = prev.get(curr) || null;
  }

  return { path, edges };
}

/**
 * Calculates total physical distance and travel time along path edges.
 */
function computePathMetrics(graph, edgeIds) {
  let travelTimeMinutes = 0;
  let distanceKm = 0;

  for (const edgeId of edgeIds) {
    const edge = graph.getEdge(edgeId);
    if (edge) {
      travelTimeMinutes += graph.calculateEdgeWeight(edge);
      distanceKm += edge.distanceKm;
    }
  }

  return {
    travelTimeMinutes: Number(travelTimeMinutes.toFixed(2)),
    distanceKm: Number(distanceKm.toFixed(2))
  };
}

// ==========================================
// 1. DIJKSTRA'S ALGORITHM
// ==========================================
export function runDijkstra(graph, sourceId, targetId) {
  const startTime = performance.now();
  const dist = new Map();
  const prev = new Map();
  const prevEdge = new Map();
  const visited = new Set();
  const pq = new MinHeap();

  for (const node of graph.getAllNodes()) {
    dist.set(node.id, Infinity);
    prev.set(node.id, null);
    prevEdge.set(node.id, null);
  }

  dist.set(sourceId, 0.0);
  pq.push(sourceId, 0.0);

  let targetFound = false;

  while (!pq.isEmpty()) {
    const top = pq.pop();
    const u = top.id;
    const currentDist = top.priority;

    if (visited.has(u)) continue;
    visited.add(u);

    if (u === targetId) {
      targetFound = true;
      break;
    }

    for (const neighbor of graph.getNeighbors(u)) {
      const v = neighbor.targetNodeId;
      const weight = neighbor.weight;

      if (neighbor.isBlocked || weight === Infinity) continue;
      if (visited.has(v)) continue;

      const alt = currentDist + weight;
      if (alt < dist.get(v)) {
        dist.set(v, alt);
        prev.set(v, u);
        prevEdge.set(v, neighbor.edgeId);
        pq.push(v, alt);
      }
    }
  }

  const executionTimeMs = performance.now() - startTime;

  if (!targetFound || dist.get(targetId) === Infinity) {
    return {
      algorithm: "Dijkstra's Algorithm",
      path: [],
      pathEdges: [],
      travelTimeMinutes: Infinity,
      distanceKm: 0,
      hops: 0,
      nodesExplored: visited.size,
      executionTimeMs: Number(executionTimeMs.toFixed(3)),
      success: false
    };
  }

  const { path, edges } = reconstructPath(prev, prevEdge, targetId, sourceId);
  const metrics = computePathMetrics(graph, edges);

  return {
    algorithm: "Dijkstra's Algorithm",
    path,
    pathEdges: edges,
    travelTimeMinutes: metrics.travelTimeMinutes,
    distanceKm: metrics.distanceKm,
    hops: Math.max(0, path.length - 1),
    nodesExplored: visited.size,
    executionTimeMs: Number(executionTimeMs.toFixed(3)),
    success: true
  };
}

// ==========================================
// 2. A* SEARCH ALGORITHM
// ==========================================
export function runAStar(graph, sourceId, targetId) {
  const startTime = performance.now();
  const targetNode = graph.getNode(targetId);

  // Maximum network speed (90 km/h) ensures strictly admissible Euclidean heuristic
  const maxSpeedKmh = 90.0;
  const heuristic = (nodeId) => {
    const n = graph.getNode(nodeId);
    if (!n || !targetNode) return 0;
    const dx = n.x - targetNode.x;
    const dy = n.y - targetNode.y;
    // Scale: 100 pixels ≈ 7.5 km
    const distKm = (Math.sqrt(dx * dx + dy * dy) / 100) * 7.5;
    return (distKm / maxSpeedKmh) * 60.0; // Admissible remaining travel time in minutes
  };

  const gScore = new Map();
  const fScore = new Map();
  const prev = new Map();
  const prevEdge = new Map();
  const visited = new Set();
  const openSet = new MinHeap();

  for (const node of graph.getAllNodes()) {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
    prev.set(node.id, null);
    prevEdge.set(node.id, null);
  }

  gScore.set(sourceId, 0.0);
  const startF = heuristic(sourceId);
  fScore.set(sourceId, startF);
  openSet.push(sourceId, startF);

  let targetFound = false;

  while (!openSet.isEmpty()) {
    const top = openSet.pop();
    const u = top.id;

    if (visited.has(u)) continue;
    visited.add(u);

    if (u === targetId) {
      targetFound = true;
      break;
    }

    const currentG = gScore.get(u);

    for (const neighbor of graph.getNeighbors(u)) {
      const v = neighbor.targetNodeId;
      const weight = neighbor.weight;

      if (neighbor.isBlocked || weight === Infinity) continue;
      if (visited.has(v)) continue;

      const tentativeG = currentG + weight;
      if (tentativeG < gScore.get(v)) {
        gScore.set(v, tentativeG);
        prev.set(v, u);
        prevEdge.set(v, neighbor.edgeId);

        const f = tentativeG + heuristic(v);
        fScore.set(v, f);
        openSet.push(v, f);
      }
    }
  }

  const executionTimeMs = performance.now() - startTime;

  if (!targetFound || gScore.get(targetId) === Infinity) {
    return {
      algorithm: "A* Search",
      path: [],
      pathEdges: [],
      travelTimeMinutes: Infinity,
      distanceKm: 0,
      hops: 0,
      nodesExplored: visited.size,
      executionTimeMs: Number(executionTimeMs.toFixed(3)),
      success: false
    };
  }

  const { path, edges } = reconstructPath(prev, prevEdge, targetId, sourceId);
  const metrics = computePathMetrics(graph, edges);

  return {
    algorithm: "A* Search",
    path,
    pathEdges: edges,
    travelTimeMinutes: metrics.travelTimeMinutes,
    distanceKm: metrics.distanceKm,
    hops: Math.max(0, path.length - 1),
    nodesExplored: visited.size,
    executionTimeMs: Number(executionTimeMs.toFixed(3)),
    success: true
  };
}

// ==========================================
// 3. BREADTH-FIRST SEARCH (BFS)
// ==========================================
export function runBFS(graph, sourceId, targetId) {
  const startTime = performance.now();
  const visited = new Set([sourceId]);
  const prev = new Map([[sourceId, null]]);
  const prevEdge = new Map([[sourceId, null]]);
  const queue = [sourceId];

  let targetFound = false;

  while (queue.length > 0) {
    const u = queue.shift();

    if (u === targetId) {
      targetFound = true;
      break;
    }

    for (const neighbor of graph.getNeighbors(u)) {
      const v = neighbor.targetNodeId;
      if (neighbor.isBlocked || neighbor.weight === Infinity) continue;

      if (!visited.has(v)) {
        visited.add(v);
        prev.set(v, u);
        prevEdge.set(v, neighbor.edgeId);
        queue.push(v);
      }
    }
  }

  const executionTimeMs = performance.now() - startTime;

  if (!targetFound) {
    return {
      algorithm: "Breadth-First Search (BFS)",
      path: [],
      pathEdges: [],
      travelTimeMinutes: Infinity,
      distanceKm: 0,
      hops: 0,
      nodesExplored: visited.size,
      executionTimeMs: Number(executionTimeMs.toFixed(3)),
      success: false
    };
  }

  const { path, edges } = reconstructPath(prev, prevEdge, targetId, sourceId);
  const metrics = computePathMetrics(graph, edges);

  return {
    algorithm: "Breadth-First Search (BFS)",
    path,
    pathEdges: edges,
    travelTimeMinutes: metrics.travelTimeMinutes,
    distanceKm: metrics.distanceKm,
    hops: Math.max(0, path.length - 1),
    nodesExplored: visited.size,
    executionTimeMs: Number(executionTimeMs.toFixed(3)),
    success: true
  };
}

// ==========================================
// 4. DEPTH-FIRST SEARCH (DFS)
// ==========================================
export function runDFS(graph, sourceId, targetId) {
  const startTime = performance.now();
  const visited = new Set();
  const prev = new Map([[sourceId, null]]);
  const prevEdge = new Map([[sourceId, null]]);
  const stack = [sourceId];

  let targetFound = false;

  while (stack.length > 0) {
    const u = stack.pop();

    if (visited.has(u)) continue;
    visited.add(u);

    if (u === targetId) {
      targetFound = true;
      break;
    }

    const neighbors = graph.getNeighbors(u);
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      const v = neighbor.targetNodeId;
      if (neighbor.isBlocked || neighbor.weight === Infinity) continue;

      if (!visited.has(v)) {
        prev.set(v, u);
        prevEdge.set(v, neighbor.edgeId);
        stack.push(v);
      }
    }
  }

  const executionTimeMs = performance.now() - startTime;

  if (!targetFound) {
    return {
      algorithm: "Depth-First Search (DFS)",
      path: [],
      pathEdges: [],
      travelTimeMinutes: Infinity,
      distanceKm: 0,
      hops: 0,
      nodesExplored: visited.size,
      executionTimeMs: Number(executionTimeMs.toFixed(3)),
      success: false
    };
  }

  const { path, edges } = reconstructPath(prev, prevEdge, targetId, sourceId);
  const metrics = computePathMetrics(graph, edges);

  return {
    algorithm: "Depth-First Search (DFS)",
    path,
    pathEdges: edges,
    travelTimeMinutes: metrics.travelTimeMinutes,
    distanceKm: metrics.distanceKm,
    hops: Math.max(0, path.length - 1),
    nodesExplored: visited.size,
    executionTimeMs: Number(executionTimeMs.toFixed(3)),
    success: true
  };
}

// ==========================================
// 5. KRUSKAL'S MINIMUM SPANNING TREE (MST)
// ==========================================
export function runKruskalMST(graph) {
  const startTime = performance.now();
  const nodes = graph.getAllNodes();
  const unblockedEdges = graph.getAllEdges()
    .filter(e => !e.isBlocked)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const dsu = new DisjointSet(nodes.map(n => n.id));
  const mstEdges = [];
  const rejectedEdges = [];
  let totalDistanceKm = 0;
  let totalTravelTimeMinutes = 0;

  for (const edge of unblockedEdges) {
    if (dsu.union(edge.from, edge.to)) {
      mstEdges.push(edge.id);
      totalDistanceKm += edge.distanceKm;
      totalTravelTimeMinutes += graph.calculateEdgeWeight(edge);

      if (mstEdges.length === nodes.length - 1) {
        break; // Full spanning tree achieved
      }
    } else {
      rejectedEdges.push(edge.id); // Cycle prevented
    }
  }

  const executionTimeMs = performance.now() - startTime;
  const isConnected = dsu.getComponentCount() === 1;

  return {
    algorithm: "Kruskal's Algorithm (MST)",
    mstEdges,
    rejectedEdges,
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    totalTravelTimeMinutes: Number(totalTravelTimeMinutes.toFixed(2)),
    edgesCount: mstEdges.length,
    isConnected,
    executionTimeMs: Number(executionTimeMs.toFixed(3))
  };
}
