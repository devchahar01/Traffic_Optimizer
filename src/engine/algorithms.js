import { MinHeap } from './MinHeap';

/**
 * Disjoint Set Union (DSU) helper for Kruskal's MST algorithm.
 */
class DisjointSetUnion {
  constructor(elements) {
    this.parent = new Map();
    this.rank = new Map();
    for (const elem of elements) {
      this.parent.set(elem, elem);
      this.rank.set(elem, 0);
    }
  }

  find(i) {
    if (this.parent.get(i) === i) return i;
    const root = this.find(this.parent.get(i));
    this.parent.set(i, root); // Path compression
    return root;
  }

  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI === rootJ) return false;

    const rankI = this.rank.get(rootI);
    const rankJ = this.rank.get(rootJ);

    if (rankI < rankJ) {
      this.parent.set(rootI, rootJ);
    } else if (rankI > rankJ) {
      this.parent.set(rootJ, rootI);
    } else {
      this.parent.set(rootJ, rootI);
      this.rank.set(rootI, rankI + 1);
    }
    return true;
  }
}

/**
 * Reconstructs path backwards from previous node pointers.
 */
function reconstructPath(prev, prevEdge, targetId, sourceId) {
  const path = [];
  const edges = [];
  let curr = targetId;

  while (curr !== null) {
    path.unshift(curr);
    if (prevEdge.has(curr) && prevEdge.get(curr) !== null) {
      edges.unshift(prevEdge.get(curr));
    }
    if (curr === sourceId) break;
    curr = prev.get(curr) || null;
  }

  return { path, edges };
}

// ==========================================
// 1. DIJKSTRA'S ALGORITHM GENERATOR
// ==========================================
export function* dijkstraGenerator(graph, sourceId, targetId) {
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

  dist.set(sourceId, 0);
  pq.push(sourceId, 0);

  yield {
    type: 'START',
    currentNode: sourceId,
    visitedNodes: [],
    frontierQueue: [sourceId],
    activeEdge: null,
    currentPath: [sourceId],
    cost: 0,
    description: `Dijkstra initialized at Source [${sourceId}]. Distance set to 0.`,
    done: false
  };

  let targetFound = false;

  while (!pq.isEmpty()) {
    const top = pq.pop();
    const u = top.id;
    const currentCost = top.priority;

    if (visited.has(u)) continue;
    visited.add(u);

    const { path: tempPath, edges: tempEdges } = reconstructPath(prev, prevEdge, u, sourceId);

    yield {
      type: 'VISITING',
      currentNode: u,
      visitedNodes: Array.from(visited),
      frontierQueue: pq.getSnapshot().map(i => i.id),
      activeEdge: prevEdge.get(u),
      currentPath: tempPath,
      currentPathEdges: tempEdges,
      cost: Number(currentCost.toFixed(2)),
      description: `Popped [${u}] from Min-Heap (Lowest cost: ${currentCost.toFixed(1)}m).`,
      done: false
    };

    if (u === targetId) {
      targetFound = true;
      break;
    }

    const neighbors = graph.getNeighbors(u);
    for (const { node, edge, weight } of neighbors) {
      const v = node.id;

      if (edge.isBlocked || weight === Infinity) {
        yield {
          type: 'BLOCKED',
          currentNode: u,
          visitedNodes: Array.from(visited),
          frontierQueue: pq.getSnapshot().map(i => i.id),
          activeEdge: edge.id,
          currentPath: tempPath,
          currentPathEdges: tempEdges,
          cost: Number(currentCost.toFixed(2)),
          description: `Corridor [${u} ↔ ${v}] is BLOCKED / CLOSED. Cannot traverse.`,
          done: false
        };
        continue;
      }

      if (visited.has(v)) continue;

      const alt = currentCost + weight;
      if (alt < dist.get(v)) {
        dist.set(v, alt);
        prev.set(v, u);
        prevEdge.set(v, edge.id);
        pq.push(v, alt);

        yield {
          type: 'RELAX',
          currentNode: u,
          targetNeighbor: v,
          visitedNodes: Array.from(visited),
          frontierQueue: pq.getSnapshot().map(i => i.id),
          activeEdge: edge.id,
          currentPath: tempPath,
          currentPathEdges: tempEdges,
          cost: Number(alt.toFixed(2)),
          description: `Relaxed edge [${u} ↔ ${v}]. Updated cost to ${alt.toFixed(1)}m.`,
          done: false
        };
      }
    }
  }

  if (targetFound) {
    const { path, edges } = reconstructPath(prev, prevEdge, targetId, sourceId);
    yield {
      type: 'PATH_FOUND',
      currentNode: targetId,
      visitedNodes: Array.from(visited),
      frontierQueue: [],
      activeEdge: null,
      currentPath: path,
      currentPathEdges: edges,
      cost: Number(dist.get(targetId).toFixed(2)),
      description: `Target [${targetId}] reached! Optimal travel cost: ${dist.get(targetId).toFixed(1)} min.`,
      done: true,
      success: true
    };
  } else {
    yield {
      type: 'NO_PATH',
      currentNode: targetId,
      visitedNodes: Array.from(visited),
      frontierQueue: [],
      activeEdge: null,
      currentPath: [],
      currentPathEdges: [],
      cost: Infinity,
      description: `Target [${targetId}] unreachable due to network closures.`,
      done: true,
      success: false
    };
  }
}

// ==========================================
// 2. A* SEARCH ALGORITHM GENERATOR
// ==========================================
export function* aStarGenerator(graph, sourceId, targetId) {
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

  const h = (nodeId) => graph.getEuclideanDistance(nodeId, targetId);

  gScore.set(sourceId, 0);
  const startF = h(sourceId);
  fScore.set(sourceId, startF);
  openSet.push(sourceId, startF);

  yield {
    type: 'START',
    currentNode: sourceId,
    visitedNodes: [],
    frontierQueue: [sourceId],
    activeEdge: null,
    currentPath: [sourceId],
    cost: 0,
    description: `A* Search started at [${sourceId}]. Heuristic distance to target: ${startF.toFixed(1)}.`,
    done: false
  };

  let targetFound = false;

  while (!openSet.isEmpty()) {
    const top = openSet.pop();
    const u = top.id;

    if (visited.has(u)) continue;
    visited.add(u);

    const { path: tempPath, edges: tempEdges } = reconstructPath(prev, prevEdge, u, sourceId);

    yield {
      type: 'VISITING',
      currentNode: u,
      visitedNodes: Array.from(visited),
      frontierQueue: openSet.getSnapshot().map(i => i.id),
      activeEdge: prevEdge.get(u),
      currentPath: tempPath,
      currentPathEdges: tempEdges,
      cost: Number(gScore.get(u).toFixed(2)),
      description: `A* popped [${u}] with f(n) = ${top.priority.toFixed(1)} (g=${gScore.get(u).toFixed(1)}, h=${h(u).toFixed(1)}).`,
      done: false
    };

    if (u === targetId) {
      targetFound = true;
      break;
    }

    const neighbors = graph.getNeighbors(u);
    for (const { node, edge, weight } of neighbors) {
      const v = node.id;

      if (edge.isBlocked || weight === Infinity) continue;
      if (visited.has(v)) continue;

      const tentativeG = gScore.get(u) + weight;
      if (tentativeG < gScore.get(v)) {
        gScore.set(v, tentativeG);
        prev.set(v, u);
        prevEdge.set(v, edge.id);
        const f = tentativeG + h(v);
        fScore.set(v, f);
        openSet.push(v, f);

        yield {
          type: 'RELAX',
          currentNode: u,
          targetNeighbor: v,
          visitedNodes: Array.from(visited),
          frontierQueue: openSet.getSnapshot().map(i => i.id),
          activeEdge: edge.id,
          currentPath: tempPath,
          currentPathEdges: tempEdges,
          cost: Number(tentativeG.toFixed(2)),
          description: `A* relaxed [${u} ↔ ${v}]: g=${tentativeG.toFixed(1)}, f=${f.toFixed(1)}.`,
          done: false
        };
      }
    }
  }

  if (targetFound) {
    const { path, edges } = reconstructPath(prev, prevEdge, targetId, sourceId);
    yield {
      type: 'PATH_FOUND',
      currentNode: targetId,
      visitedNodes: Array.from(visited),
      frontierQueue: [],
      activeEdge: null,
      currentPath: path,
      currentPathEdges: edges,
      cost: Number(gScore.get(targetId).toFixed(2)),
      description: `A* goal reached! Evaluated ${visited.size} nodes. Path cost: ${gScore.get(targetId).toFixed(1)}m.`,
      done: true,
      success: true
    };
  } else {
    yield {
      type: 'NO_PATH',
      currentNode: targetId,
      visitedNodes: Array.from(visited),
      frontierQueue: [],
      activeEdge: null,
      currentPath: [],
      currentPathEdges: [],
      cost: Infinity,
      description: `A* found no path to [${targetId}].`,
      done: true,
      success: false
    };
  }
}

// ==========================================
// 3. BREADTH-FIRST SEARCH (BFS) GENERATOR
// ==========================================
export function* bfsGenerator(graph, sourceId, targetId) {
  const visited = new Set([sourceId]);
  const queue = [sourceId];
  const prev = new Map([[sourceId, null]]);
  const prevEdge = new Map([[sourceId, null]]);

  yield {
    type: 'START',
    currentNode: sourceId,
    visitedNodes: [sourceId],
    frontierQueue: [...queue],
    activeEdge: null,
    currentPath: [sourceId],
    cost: 0,
    description: `BFS initialized at [${sourceId}]. Optimizing for fewest unweighted hops.`,
    done: false
  };

  let targetFound = false;

  while (queue.length > 0) {
    const u = queue.shift();

    const { path: tempPath, edges: tempEdges } = reconstructPath(prev, prevEdge, u, sourceId);

    yield {
      type: 'VISITING',
      currentNode: u,
      visitedNodes: Array.from(visited),
      frontierQueue: [...queue],
      activeEdge: prevEdge.get(u),
      currentPath: tempPath,
      currentPathEdges: tempEdges,
      cost: tempEdges.length,
      description: `BFS dequeued [${u}]. Level-order expansion.`,
      done: false
    };

    if (u === targetId) {
      targetFound = true;
      break;
    }

    const neighbors = graph.getNeighbors(u);
    for (const { node, edge, weight } of neighbors) {
      const v = node.id;
      if (edge.isBlocked || weight === Infinity) continue;

      if (!visited.has(v)) {
        visited.add(v);
        prev.set(v, u);
        prevEdge.set(v, edge.id);
        queue.push(v);

        yield {
          type: 'RELAX',
          currentNode: u,
          targetNeighbor: v,
          visitedNodes: Array.from(visited),
          frontierQueue: [...queue],
          activeEdge: edge.id,
          currentPath: tempPath,
          currentPathEdges: tempEdges,
          cost: tempEdges.length + 1,
          description: `BFS queued [${v}] from [${u}].`,
          done: false
        };
      }
    }
  }

  if (targetFound) {
    const { path, edges } = reconstructPath(prev, prevEdge, targetId, sourceId);
    let totalWeightedCost = 0;
    for (const eid of edges) {
      const e = graph.getEdge(eid);
      if (e) totalWeightedCost += graph.calculateEdgeWeight(e);
    }

    yield {
      type: 'PATH_FOUND',
      currentNode: targetId,
      visitedNodes: Array.from(visited),
      frontierQueue: [],
      activeEdge: null,
      currentPath: path,
      currentPathEdges: edges,
      cost: Number(totalWeightedCost.toFixed(2)),
      description: `BFS reached target in ${edges.length} hops (${totalWeightedCost.toFixed(1)} mins).`,
      done: true,
      success: true
    };
  } else {
    yield {
      type: 'NO_PATH',
      currentNode: targetId,
      visitedNodes: Array.from(visited),
      frontierQueue: [],
      activeEdge: null,
      currentPath: [],
      currentPathEdges: [],
      cost: Infinity,
      description: `BFS found no feasible route to [${targetId}].`,
      done: true,
      success: false
    };
  }
}

// ==========================================
// 4. DEPTH-FIRST SEARCH (DFS) GENERATOR
// ==========================================
export function* dfsGenerator(graph, sourceId, targetId) {
  const visited = new Set();
  const stack = [sourceId];
  const prev = new Map([[sourceId, null]]);
  const prevEdge = new Map([[sourceId, null]]);

  yield {
    type: 'START',
    currentNode: sourceId,
    visitedNodes: [],
    frontierQueue: [...stack],
    activeEdge: null,
    currentPath: [sourceId],
    cost: 0,
    description: `DFS started at [${sourceId}] using LIFO Stack.`,
    done: false
  };

  let targetFound = false;

  while (stack.length > 0) {
    const u = stack.pop();
    if (visited.has(u)) continue;
    visited.add(u);

    const { path: tempPath, edges: tempEdges } = reconstructPath(prev, prevEdge, u, sourceId);

    yield {
      type: 'VISITING',
      currentNode: u,
      visitedNodes: Array.from(visited),
      frontierQueue: [...stack],
      activeEdge: prevEdge.get(u),
      currentPath: tempPath,
      currentPathEdges: tempEdges,
      cost: tempEdges.length,
      description: `DFS popped [${u}] from Stack. Diving deep along branch.`,
      done: false
    };

    if (u === targetId) {
      targetFound = true;
      break;
    }

    const neighbors = graph.getNeighbors(u);
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const { node, edge, weight } = neighbors[i];
      const v = node.id;
      if (edge.isBlocked || weight === Infinity) continue;

      if (!visited.has(v)) {
        prev.set(v, u);
        prevEdge.set(v, edge.id);
        stack.push(v);

        yield {
          type: 'RELAX',
          currentNode: u,
          targetNeighbor: v,
          visitedNodes: Array.from(visited),
          frontierQueue: [...stack],
          activeEdge: edge.id,
          currentPath: tempPath,
          currentPathEdges: tempEdges,
          cost: tempEdges.length + 1,
          description: `DFS pushed neighbor [${v}] onto stack.`,
          done: false
        };
      }
    }
  }

  if (targetFound) {
    const { path, edges } = reconstructPath(prev, prevEdge, targetId, sourceId);
    let totalCost = 0;
    for (const eid of edges) {
      const e = graph.getEdge(eid);
      if (e) totalCost += graph.calculateEdgeWeight(e);
    }

    yield {
      type: 'PATH_FOUND',
      currentNode: targetId,
      visitedNodes: Array.from(visited),
      frontierQueue: [],
      activeEdge: null,
      currentPath: path,
      currentPathEdges: edges,
      cost: Number(totalCost.toFixed(2)),
      description: `DFS reached target. Meandering route with ${edges.length} hops (${totalCost.toFixed(1)} mins).`,
      done: true,
      success: true
    };
  } else {
    yield {
      type: 'NO_PATH',
      currentNode: targetId,
      visitedNodes: Array.from(visited),
      frontierQueue: [],
      activeEdge: null,
      currentPath: [],
      currentPathEdges: [],
      cost: Infinity,
      description: `DFS found no route to [${targetId}].`,
      done: true,
      success: false
    };
  }
}

// ==========================================
// 5. KRUSKAL'S MST GENERATOR
// ==========================================
export function* kruskalGenerator(graph) {
  const nodes = graph.getAllNodes();
  const unblockedEdges = graph.getAllEdges()
    .filter(e => !e.isBlocked)
    .sort((a, b) => a.baseWeight - b.baseWeight);

  const dsu = new DisjointSetUnion(nodes.map(n => n.id));
  const mstEdges = [];
  let totalCost = 0;

  yield {
    type: 'START',
    currentNode: null,
    visitedNodes: [],
    frontierQueue: [],
    activeEdge: null,
    mstEdges: [],
    cost: 0,
    description: `Kruskal's MST initialized. Sorted ${unblockedEdges.length} roads by base weight.`,
    done: false
  };

  for (const edge of unblockedEdges) {
    const u = edge.from;
    const v = edge.to;

    if (dsu.find(u) !== dsu.find(v)) {
      dsu.union(u, v);
      mstEdges.push(edge.id);
      totalCost += edge.baseWeight;

      yield {
        type: 'MST_EDGE',
        currentNode: u,
        targetNeighbor: v,
        activeEdge: edge.id,
        mstEdges: [...mstEdges],
        cost: Number(totalCost.toFixed(2)),
        description: `Accepted edge [${u} ↔ ${v}] into MST. No cycle created.`,
        done: false
      };

      if (mstEdges.length === nodes.length - 1) break;
    } else {
      yield {
        type: 'MST_CYCLE',
        currentNode: u,
        targetNeighbor: v,
        activeEdge: edge.id,
        mstEdges: [...mstEdges],
        cost: Number(totalCost.toFixed(2)),
        description: `Rejected [${u} ↔ ${v}]. Cycle detected in same DSU set.`,
        done: false
      };
    }
  }

  yield {
    type: 'MST_COMPLETE',
    currentNode: null,
    activeEdge: null,
    mstEdges: [...mstEdges],
    cost: Number(totalCost.toFixed(2)),
    description: `MST Complete! Connected all sectors using ${mstEdges.length} roads (Total length: ${totalCost.toFixed(1)} km).`,
    done: true,
    success: true
  };
}

// ==========================================
// INSTANT EXECUTION RUNNER
// ==========================================
export function runAlgorithmInstant(generatorFn, graph, sourceId, targetId) {
  const t0 = performance.now();
  const gen = generatorFn(graph, sourceId, targetId);
  const allSteps = [];
  let finalResult = null;

  for (const step of gen) {
    allSteps.push(step);
    if (step.done) {
      finalResult = step;
    }
  }

  const executionTimeMs = Number((performance.now() - t0).toFixed(3));

  let pathDistance = 0;
  if (finalResult && finalResult.currentPathEdges) {
    for (const eid of finalResult.currentPathEdges) {
      const e = graph.getEdge(eid);
      if (e) pathDistance += e.length;
    }
  }

  return {
    ...finalResult,
    executionTimeMs,
    pathDistance: Number(pathDistance.toFixed(2)),
    nodesExplored: finalResult?.visitedNodes?.length || 0,
    allSteps
  };
}
