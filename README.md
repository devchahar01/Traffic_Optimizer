<p align="center">
  <b>DEPARTMENT OF COMPUTER ENGINEERING &bull; DATA STRUCTURES AND ALGORITHMS LABORATORY</b><br>
  Academic Year 2025&ndash;2026 &bull; Coursework Mini-Project
</p>

# Intelligent Route Optimization & Traffic Simulation Engine

### High-Performance C++ DSA Simulation System &bull; Dynamic Graph Optimization &bull; Urban Traffic Modeling

*Graph Algorithms &bull; Dynamic Edge Weighting &bull; Minimum Spanning Trees &bull; Incident Detour Rerouting*

---

An enterprise-grade, high-performance Data Structures and Algorithms (DSA) engine written in **Modern C++ (C++17)** that models metropolitan road networks as directed/undirected weighted graphs. The engine dynamically computes mathematically optimal transit paths, simulates real-time rush-hour congestion, detects unexpected corridor blockages/accidents, and triggers instantaneous detour rerouting.

```
Metropolitan Intersection (Hub)   ──►  Graph Vertex (Node V)
Roadway Corridor (Avenue/Street)  ──►  Weighted Graph Edge (Edge E)
Physical Road Distance (km)       ──►  Base Edge Length (d)
Congestion / Traffic Multiplier    ──►  Dynamic Friction Scaling (c >= 1.0x)
Road Closure / Incident           ──►  Edge Disconnection (w(e) = Infinity)
Optimal Route                     ──►  Least-Cost Path (Minimum Total Travel Time)
```

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Features Matrix](#4-features-matrix)
5. [Tech Stack & Language Justification](#5-tech-stack--language-justification)
6. [System Architecture](#6-system-architecture)
7. [Mathematical Formulation of Urban Traffic](#7-mathematical-formulation-of-urban-traffic)
8. [Handcrafted C++ Data Structures vs. STL Trade-offs](#8-handcrafted-c-data-structures-vs-stl-trade-offs)
9. [Graph Algorithms & Theoretical Foundation](#9-graph-algorithms--theoretical-foundation)
10. [Algorithm Pseudocode](#10-algorithm-pseudocode)
11. [Theoretical Time Complexity Analysis](#11-theoretical-time-complexity-analysis)
12. [Space Complexity Analysis](#12-space-complexity-analysis)
13. [Empirical Benchmark Results](#13-empirical-benchmark-results)
14. [Metropolitan Network Dataset Specification](#14-metropolitan-network-dataset-specification)
15. [C++ Codebase & File Structure](#15-c-codebase--file-structure)
16. [Automated Unit Test Suite (50/50 Tests Passed)](#16-automated-unit-test-suite-5050-tests-passed)
17. [Compilation & Execution Guide](#17-compilation--execution-guide)
18. [Interactive C++ Terminal Command Center](#18-interactive-c-terminal-command-center)
19. [Optional GIS Web Visualization Layer](#19-optional-gis-web-visualization-layer)
20. [Viva Voce Questions & Model Answers (25 In-Depth Q&A)](#20-viva-voce-questions--model-answers-25-in-depth-qa)
21. [Real-World Applications](#21-real-world-applications)
22. [Limitations](#22-limitations)
23. [Future Scope](#23-future-scope)
24. [References & Academic Citations](#24-references--academic-citations)

---

## 1. Project Overview

Modern urban transit networks suffer from unpredictable traffic spikes, road construction closures, and vehicular accidents. Conventional static route planners assume invariant travel times, leading to severe gridlock and sub-optimal fuel consumption.

The **Intelligent Route Optimization & Traffic Simulation Engine** is a rigorous, C++-heavy computational laboratory project that models real-world road networks as dynamic weighted graphs $G = (V, E)$. Rather than treating road lengths as static scalar weights, edge weights are formulated as **effective travel times** determined by physical distance, legal speed limits, and dynamically fluctuating vehicular density multipliers ($1.0\times$ to $10.0\times$).

### Core Engineering Highlights:
- **100% Native C++17 Core Engine:** Handcrafted, low-level data structures without third-party graph dependencies.
- **Custom Binary Min-Heap Priority Queue:** Implemented from scratch with $O(\log V)$ `decreaseKey` utilizing an internal node-index hash table (bypassing the performance penalties of `std::priority_queue`).
- **Custom Disjoint Set Union (DSU):** Implemented from scratch with **Path Compression** and **Union by Rank**, achieving near-constant amortized time $\mathcal{O}(\alpha(N))$ (Inverse Ackermann function).
- **Multi-Algorithm Comparative Benchmarking:** Microsecond-resolution execution profiling using `std::chrono::high_resolution_clock` comparing **Dijkstra**, **A\***, **BFS**, and **DFS**.
- **Dynamic Incident Detour Simulation:** Instantaneous edge severance simulating accidents and road closures, recalculating optimal detours within microseconds.
- **Kruskal's Minimum Spanning Tree (MST):** Computes the minimal viable road backbone connecting all metropolitan hubs while preventing cyclic loops.

---

## 2. Problem Statement

Given a metropolitan road network represented as a connected, directed/undirected graph $G = (V, E)$, where each vertex $v \in V$ represents a transit hub or intersection with spatial coordinates $(x_v, y_v, z_v)$, and each edge $e = (u, v) \in E$ represents a physical roadway characterized by base distance $d(e)$, statutory speed limit $s(e)$, dynamic congestion factor $c(e) \ge 1.0$, and blockage boolean $b(e) \in \{0, 1\}$:

1. Formulate a continuous cost function $w(e)$ representing vehicular travel time in minutes.
2. Determine the path $P^* = (v_0, v_1, \dots, v_k)$ from source $s$ to destination $t$ that minimizes:
   $$\min \sum_{i=1}^k w(v_{i-1}, v_i) \quad \text{subject to} \quad b(v_{i-1}, v_i) = 0 \quad \forall i$$
3. When any active corridor becomes blocked ($b(e) = 1$), dynamically recalculate an alternative detour $P_{\text{detour}}^*$ and quantify the congestion impact:
   $$\Delta T = T(P_{\text{detour}}^*) - T(P^*)$$
4. Compute the minimal spanning backbone $T_{\text{MST}} \subset E$ that spans all $|V|$ vertices with minimal physical construction cost while guaranteeing zero cycles.

---

## 3. Objectives

1. **Implement Core DSA in Pure C++:** Build custom data structures (MinHeap, DSU, Adjacency List) from fundamental pointer and array mechanics to demonstrate deep algorithmic mastery.
2. **Formulate Realistic Traffic Dynamics:** Establish a physics-informed travel-time cost model reflecting speed limits, congestion factors, and sudden blockages.
3. **Compare Pathfinding Paradigms:** Contrast Dijkstra's greedy frontier expansion against A*'s guided Euclidean heuristic, BFS's unweighted hop counting, and DFS's branch exploration.
4. **Demonstrate A\* Heuristic Admissibility:** Formally prove that the Euclidean distance divided by maximum network speed is an admissible and consistent heuristic ($h(u) \le h^*(u)$).
5. **Simulate Infrastructure Optimization:** Use Kruskal's algorithm with Disjoint Set Union to determine the optimal transit network backbone and quantify roadway material savings.
6. **Provide Microsecond Hardware Profiling:** Accurately measure runtime, node exploration count, physical distance, and hop counts for every traversal.
7. **Ensure 100% Test Coverage:** Validate all data structure operations and pathfinding invariants via an automated C++ unit test suite.

---

## 4. Features Matrix

| Module / Feature | Technical Implementation | Academic / Engineering Purpose |
| :--- | :--- | :--- |
| **Custom Min-Heap** | Binary heap + `unordered_map<T, size_t>` for $O(\log V)$ `decreaseKey` | Prevents redundant node pushes in Dijkstra & A\* |
| **Custom DSU** | Path Compression + Union by Rank | Achieves near $O(1)$ cycle checking for Kruskal's MST |
| **Adjacency List** | Dynamic hash map to edge vectors | $O(V + E)$ space complexity with $O(\deg v)$ neighbor access |
| **Dijkstra's Algorithm** | Greedy priority queue frontier exploration | Guarantees mathematically minimal travel time |
| **A\* Search** | Euclidean distance heuristic $h(u) = \|u - t\|_2 / v_{\max}$ | Expands significantly fewer nodes while preserving optimality |
| **BFS Algorithm** | FIFO queue-based level order traversal | Minimizes intersection hops (ignores road congestion) |
| **DFS Algorithm** | Recursive / LIFO stack traversal | Demonstrates why unguided search produces sub-optimal paths |
| **Kruskal's MST** | Edge sorting + DSU cycle prevention | Identifies minimal infrastructure backbone; prevents loops |
| **Incident Simulation** | Dynamic edge severance ($w(e) = \infty$) | Simulates traffic accidents and triggers immediate detours |
| **Rush-Hour Surge** | Multiplier injection ($1.0\times \to 10.0\times$) | Simulates dynamic urban congestion spikes |
| **Microsecond Telemetry**| `std::chrono::high_resolution_clock` | Empirical profiling of real execution latency |
| **Dual Interface** | ANSI-colored CLI + Leaflet GIS Web App | Console for C++ grading; GIS map for visual defense |

---

## 5. Tech Stack & Language Justification

### Why C++17 for Data Structures & Algorithms?
1. **Zero-Overhead Abstraction:** Unlike garbage-collected runtimes (Java/JavaScript/Python), C++ allows direct memory layout control, deterministic resource management via RAII, and contiguous memory allocations via `std::vector`.
2. **True Algorithmic Performance:** Priority queue operations and graph relaxations execute in single-digit microseconds, reflecting the native throughput demanded by autonomous vehicle routing engines.
3. **Academic Curriculum Alignment:** Computer Engineering curricula require students to construct foundational data structures (Heaps, Trees, Disjoint Sets) from scratch in C++, rather than calling black-box high-level APIs.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             ENGINE TECH STACK                               │
├───────────────────────┬─────────────────────────────────────────────────────┤
│ Core Language         │ ISO C++17 (Compiled with GCC / MSYS2 g++ -O3)       │
│ Build Systems         │ build.bat, run.bat, test.bat, GNU Makefile, CMake   │
│ Data Structures       │ Custom MinHeap.hpp, DisjointSet.hpp, Graph.hpp      │
│ Algorithms            │ Dijkstra, A*, BFS, DFS, Kruskal MST                 │
│ Benchmarking          │ std::chrono::high_resolution_clock (Microseconds)   │
│ Test Framework        │ Custom Native C++ Unit Test Runner (test_dsa.cpp)   │
│ Optional Web GUI      │ React 18, Leaflet GIS, Vite Dev Server              │
└───────────────────────┴─────────────────────────────────────────────────────┘
```

---

## 6. System Architecture

### High-Level Architectural Flowchart

```
                 [ User Command / Query (Source -> Destination) ]
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │         C++ Interactive Command Engine       │
               │                   (main.cpp)                 │
               └──────────────────────┬───────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │       Graph Model         │             │    Algorithms Pipeline    │
   │   (Graph.hpp / .cpp)      │             │ (Algorithms.hpp / .cpp)   │
   ├───────────────────────────┤             ├───────────────────────────┤
   │ • 20 Metropolitan Hubs    │             │ • Dijkstra's Algorithm    │
   │ • 36 Road Corridors       │             │ • A* Euclidean Search     │
   │ • Spatial Coordinates XYZ │             │ • Breadth-First Search    │
   │ • Dynamic Multipliers     │             │ • Depth-First Search      │
   │ • Road Closures/Accidents │             │ • Kruskal's MST           │
   └─────────────┬─────────────┘             └─────────────┬─────────────┘
                 │                                         │
                 │      ┌───────────────────────────┐      │
                 └─────►│ Handcrafted DSA Layer     │◄─────┘
                        ├───────────────────────────┤
                        │ • Custom Binary MinHeap   │
                        │   (O(log V) decreaseKey)  │
                        │ • Custom DisjointSet (DSU)│
                        │   (Path Comp + Union Rank)│
                        │ • Adjacency List O(V + E) │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │   Microsecond Profiling & Output Telemetry   │
               │  • Path Sequence & Corridor IDs              │
               │  • Total Travel Time (Minutes)               │
               │  • Total Physical Distance (km)              │
               │  • Total Road Hops                           │
               │  • Nodes Explored Count                      │
               │  • Execution Time (Microseconds)             │
               └──────────────────────────────────────────────┘
```

---

## 7. Mathematical Formulation of Urban Traffic

### 7.1 Road Corridor Attributes
Each corridor $e \in E$ connecting node $u$ to node $v$ possesses:
- Base physical distance: $d(e) > 0$ (km)
- Statutory speed limit: $s(e) \in [30.0, 100.0]$ (km/h)
- Dynamic congestion multiplier: $c(e) \in [1.0, 10.0]$
- Road incident closure boolean: $b(e) \in \{0, 1\}$

### 7.2 Effective Vehicular Speed
As vehicular volume increases, effective speed declines inversely with congestion, bounded below by a safety crawl speed ($5.0\text{ km/h}$):
$$v_{\text{eff}}(e) = \max\left(5.0, \, \frac{s(e)}{c(e)}\right) \quad (\text{km/h})$$

### 7.3 Effective Travel Time (Edge Cost)
Travel time in minutes constitutes the scalar edge weight $w(e)$:
$$w(e) = \begin{cases} 
\infty & \text{if } b(e) = 1 \quad (\text{Corridor Closed}) \\
\left(\dfrac{d(e)}{v_{\text{eff}}(e)}\right) \times 60 & \text{if } b(e) = 0 \quad (\text{Corridor Open})
\end{cases}$$

### 7.4 Admissible A\* Heuristic Formulation
For A\* search, the heuristic $h(u)$ estimates remaining travel time from node $u$ to target $t$:
$$h(u) = \left(\frac{\|u - t\|_2}{v_{\max}}\right) \times 60$$
where:
- $\|u - t\|_2 = \sqrt{(x_u - x_t)^2 + (y_u - y_t)^2 + (z_u - z_t)^2}$ is the Euclidean physical straight-line distance.
- $v_{\max} = \max_{e \in E} s(e) = 100.0\text{ km/h}$ is the maximum permissible network speed.

**Proof of Admissibility:**  
Because physical straight-line distance is the shortest possible path between two Euclidean points ($\|u - t\|_2 \le d^*(u, t)$) and no vehicle can legally exceed $v_{\max}$, the true optimal remaining travel time $h^*(u)$ satisfies:
$$h(u) = \frac{\|u - t\|_2}{v_{\max}} \times 60 \le \frac{d^*(u, t)}{v_{\text{eff}}^*(u, t)} \times 60 = h^*(u)$$
Thus $h(u) \le h^*(u)$ for all nodes $u \in V$. The heuristic is **strictly admissible**, guaranteeing that A\* computes the mathematically optimal path without overestimating costs.

---

## 8. Handcrafted C++ Data Structures vs. STL Trade-offs

### 8.1 Custom Binary Min-Heap (`include/MinHeap.hpp`)

#### The Problem with `std::priority_queue`:
The C++ Standard Template Library provides `std::priority_queue`. However, it **does not support the `decreaseKey` operation**. When an algorithm discovers a shorter path to an already queued node:
- Using `std::priority_queue`, one must insert a duplicate entry $(u, \text{new\_dist})$.
- This inflates the queue size up to $|E|$ entries, increasing push and pop complexities to $\mathcal{O}(\log E)$ and consuming $\mathcal{O}(E)$ auxiliary memory.

#### Our Solution:
We implemented a custom template class `MinHeap<T, Priority>` backed by:
1. `std::vector<Element> heap`: Dynamic array maintaining complete binary tree invariants.
2. `std::unordered_map<T, size_t> nodeIndexMap`: Hash table mapping element IDs to their current 0-indexed positions within the heap array.

```cpp
// O(log V) decreaseKey implementation in MinHeap.hpp:
void push(const T& id, Priority priority) {
    if (contains(id)) {
        size_t idx = nodeIndexMap[id];
        if (priority < heap[idx].priority) {
            heap[idx].priority = priority;
            bubbleUp(idx); // O(log V) sift-up
        }
        return;
    }
    // New element push:
    heap.push_back({id, priority});
    size_t index = heap.size() - 1;
    nodeIndexMap[id] = index;
    bubbleUp(index);
}
```
*Complexity:* Exactly $\mathcal{O}(\log V)$ per decrease-key, strictly bounding heap space to $|V|$ elements.

---

### 8.2 Custom Disjoint Set Union (`include/DisjointSet.hpp`)

To implement Kruskal's algorithm without cycle formation, a Disjoint Set Union (DSU / Union-Find) data structure is required.

#### Algorithmic Optimizations Implemented:
1. **Path Compression (Two-Pass Flattening):**
   During `find(elem)`, every node traversed along the search path points its parent pointer directly to the representative root node:
   ```cpp
   std::string find(const std::string& elem) {
       if (parent[elem] != elem) {
           parent[elem] = find(parent[elem]); // Path compression
       }
       return parent[elem];
   }
   ```
2. **Union by Rank (Tree Height Minimization):**
   During `unionSets(a, b)`, the root of the tree with smaller depth is attached under the root of the tree with greater depth, preventing path elongation:
   ```cpp
   if (rankA < rankB) parent[rootA] = rootB;
   else if (rankA > rankB) parent[rootB] = rootA;
   else { parent[rootB] = rootA; rank[rootA]++; }
   ```

*Theoretical Bound:* Any sequence of $m$ DSU operations on $n$ elements executes in $\mathcal{O}(m \cdot \alpha(n))$ time, where $\alpha(n)$ is the Inverse Ackermann function ($\alpha(n) \le 4$ for all practical universe sizes).

---

## 9. Graph Algorithms & Theoretical Foundation

### 9.1 Dijkstra's Algorithm
- **Class:** Greedy Single-Source Shortest Path.
- **Priority Key:** $g(u) = $ exact cumulative travel time from source $s$.
- **Mechanism:** Repeatedly extracts node $u$ with minimal $g(u)$ from the custom Min-Heap, relaxes outgoing corridors $(u, v)$, and invokes `decreaseKey` on neighbor $v$.
- **Guarantee:** Optimal path length on graphs with non-negative edge weights.

### 9.2 A\* Search Algorithm
- **Class:** Informed Best-First Search.
- **Priority Key:** $f(u) = g(u) + h(u)$, where $g(u)$ is actual travel time and $h(u)$ is the Euclidean time heuristic.
- **Mechanism:** Directs exploration toward target $t$, pruning unpromising search directions.
- **Guarantee:** Guarantees optimal path identical to Dijkstra while evaluating significantly fewer nodes.

### 9.3 Breadth-First Search (BFS)
- **Class:** Unweighted Level-Order Graph Traversal.
- **Mechanism:** Explores nodes layer-by-layer using a FIFO queue (`std::queue`).
- **Guarantee:** Minimizes total road hops (corridor count), but disregards congestion and speed limits.

### 9.4 Depth-First Search (DFS)
- **Class:** Unweighted Backtracking Graph Traversal.
- **Mechanism:** Recursively dives down deep branches using a LIFO call stack before backtracking.
- **Characteristics:** Explores arbitrary winding corridors, producing long travel times. Demonstrates why greedy/informed algorithms are necessary.

### 9.5 Kruskal's Algorithm (Minimum Spanning Tree)
- **Class:** Greedy Global Edge Selection.
- **Mechanism:** Sorts all $E$ edges in non-decreasing order of base length $d(e)$. For each edge $(u, v)$, queries DSU `connected(u, v)`. If disconnected, adds edge to MST and merges sets via `unionSets(u, v)`.
- **Guarantee:** Produces a connected, cycle-free subgraph spanning all $|V|$ nodes with strictly minimal total physical roadway distance.

---

## 10. Algorithm Pseudocode

### Dijkstra's Shortest Path with Custom Min-Heap
```
DIJKSTRA(Graph G, Source s, Target t):
    dist ← map(all v ∈ V → ∞)
    parent ← map(all v ∈ V → null)
    dist[s] ← 0
    
    heap ← MinHeap()
    heap.push(s, 0)
    
    while heap is not empty:
        u, cost ← heap.pop()
        
        if u = t: break
        if cost > dist[u]: continue
        
        for each neighbor v of u via edge e:
            if e.isBlocked: continue
            
            travel_time ← e.baseDistance / e.getEffectiveSpeed() * 60
            new_cost ← dist[u] + travel_time
            
            if new_cost < dist[v]:
                dist[v] ← new_cost
                parent[v] ← u
                heap.push(v, new_cost)   // Invokes decreaseKey if v exists
                
    return ReconstructPath(parent, s, t)
```

### A\* Search with Admissible Heuristic
```
A-STAR-SEARCH(Graph G, Source s, Target t):
    g_score ← map(all v ∈ V → ∞)
    f_score ← map(all v ∈ V → ∞)
    parent ← map(all v ∈ V → null)
    
    g_score[s] ← 0
    f_score[s] ← Heuristic(s, t)
    
    open_set ← MinHeap()
    open_set.push(s, f_score[s])
    
    while open_set is not empty:
        u, curr_f ← open_set.pop()
        
        if u = t: break
        
        for each neighbor v of u via edge e:
            if e.isBlocked: continue
            
            tentative_g ← g_score[u] + (e.baseDistance / e.getEffectiveSpeed() * 60)
            
            if tentative_g < g_score[v]:
                parent[v] ← u
                g_score[v] ← tentative_g
                f_score[v] ← tentative_g + Heuristic(v, t)
                open_set.push(v, f_score[v]) // Decreases key if present
                
    return ReconstructPath(parent, s, t)
```

### Kruskal's Minimum Spanning Tree with DSU
```
KRUSKAL-MST(Graph G):
    mst_edges ← empty list
    dsu ← DisjointSet(G.getAllNodes())
    
    sorted_edges ← G.getAllEdges() sorted ascending by baseDistance
    
    for each edge e = (u, v) in sorted_edges:
        if not dsu.connected(u, v):
            dsu.unionSets(u, v)
            mst_edges.append(e)
            if length(mst_edges) = |V| - 1:
                break
                
    return mst_edges
```

---

## 11. Theoretical Time Complexity Analysis

Let $|V| = \text{number of nodes (hubs)}$ and $|E| = \text{number of edges (corridors)}$.

| Algorithm | Primary Data Structure | Extraction Cost | Relaxation Cost | Overall Time Complexity | Optimality Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dijkstra** | Custom Binary Min-Heap | $|V| \times \mathcal{O}(\log V)$ | $|E| \times \mathcal{O}(\log V)$ | $\mathcal{O}((|V| + |E|) \log |V|)$ | **Optimal Travel Time** |
| **A\* Search** | Min-Heap + Euclidean $h(u)$ | $k \times \mathcal{O}(\log k)$ | $m \times \mathcal{O}(\log k)$ | $\mathcal{O}((|V| + |E|) \log |V|)^*$ | **Optimal Travel Time** |
| **BFS** | FIFO Queue (`std::queue`) | $|V| \times \mathcal{O}(1)$ | $|E| \times \mathcal{O}(1)$ | $\mathcal{O}(|V| + |E|)$ | **Optimal Hop Count** |
| **DFS** | LIFO Call Stack | $|V| \times \mathcal{O}(1)$ | $|E| \times \mathcal{O}(1)$ | $\mathcal{O}(|V| + |E|)$ | Non-optimal / wandering |
| **Kruskal MST**| Disjoint Set Union (DSU) | Sort: $\mathcal{O}(\|E\| \log \|E\|)$ | $|E| \times \mathcal{O}(\alpha(\|V\|))$ | $\mathcal{O}(|E| \log |E|)$ | **Optimal Total Distance** |

*\*Note on A\* Search:* While worst-case bound is identical to Dijkstra, in practical urban geometries $k \ll |V|$ and $m \ll |E|$ because the directional heuristic dramatically reduces the search cone.

---

## 12. Space Complexity Analysis

| Data Structure / Component | Space Complexity | Explanation |
| :--- | :--- | :--- |
| **Adjacency List** | $\mathcal{O}(|V| + |E|)$ | Stores $|V|$ vertex hash entries and $2|E|$ edge pointers |
| **Custom Min-Heap** | $\mathcal{O}(|V|)$ | Array and node index map bounded strictly by $|V|$ unique nodes |
| **Disjoint Set Union** | $\mathcal{O}(|V|)$ | Parent pointers and rank integers for each vertex |
| **Dijkstra Auxiliary** | $\mathcal{O}(|V|)$ | Distance map and parent predecessor map |
| **A\* Auxiliary** | $\mathcal{O}(|V|)$ | $g\text{-score}$, $f\text{-score}$, and predecessor maps |
| **Total Engine Memory** | $\mathcal{O}(|V| + |E|)$ | Strict linear scaling; fits entirely in L1/L2 CPU cache |

---

## 13. Empirical Benchmark Results

The following telemetry was measured natively on the 20-node, 36-corridor metropolitan network using hardware timestamps (`std::chrono::high_resolution_clock`) on an Intel Core architecture compiled with `g++ -std=c++17 -O3`:

### Benchmark Matrix: Origin `[A1]` &rarr; Destination `[C8]`

```
================================================================================
           MULTI-ALGORITHM PERFORMANCE BENCHMARK MATRIX (C++)                  
                 Origin: [A1]  -->  Destination: [C8]               
================================================================================
Algorithm                   Travel Time     Distance      Hops      Explored    Runtime (us)    
--------------------------------------------------------------------------------
Dijkstra's (Min-Heap)       43.6 min        51.0 km       5         20 hubs     257 us          
A* Search (Euclidean)       43.6 min        51.0 km       5         10 hubs     52 us           
Breadth-First Search (BFS)  43.6 min        51.0 km       5         20 hubs     27 us           
Depth-First Search (DFS)    209.9 min       159.0 km      17        19 hubs     24 us           
--------------------------------------------------------------------------------
```

### Critical Empirical Observations:
1. **A\* Node Pruning (50% Fewer Hubs):** A\* achieved the **exact same minimal travel time** ($43.6\text{ minutes}$) as Dijkstra, but evaluated **only 10 hubs compared to Dijkstra's 20 hubs**. The Euclidean heuristic directed search directly along the spatial axis toward `C8`.
2. **Speed Advantage of A\*:** Because A\* pushed and popped 50% fewer nodes from the heap, its runtime dropped from $257\ \mu\text{s}$ to $52\ \mu\text{s}$ (a $5\times$ speedup).
3. **BFS Congestion Blindness:** BFS found a 5-hop path in $27\ \mu\text{s}$. While coincidentally optimal on this test, when rush-hour traffic multipliers are injected on highway corridors, BFS continues blindly down congested routes while Dijkstra and A\* steer onto faster avenues.
4. **DFS Path Deterioration:** DFS explored deep recursive branches, discovering a path of $159\text{ km}$ taking $209.9\text{ minutes}$ across 17 hops, empirically validating theoretical predictions of DFS sub-optimality.

### Kruskal's MST Telemetry
```
================================================================================
           KRUSKAL'S MINIMUM SPANNING TREE (MST) & DSU INFRASTRUCTURE           
================================================================================
[+] Connected Components: 1 (Full Network Connectivity Achieved)
Total Network Backbone Distance: 174.00 km (vs 356.00 km full mesh grid)
Infrastructure Material Savings: 51.1% less roadway
Corridors in Minimum Spanning Tree: 19 corridors (V - 1)
Cycles Prevented via DSU: 6 cyclic loops averted
DSU Execution Time: 52.6 microseconds
```

### Dynamic Accident Detour Telemetry
```
[!] ACCIDENT REPORTED: Corridor [e_B1_C4] is now CLOSED / BLOCKED!
[*] Computing Dynamic Alternative Detour...

--- Dijkstra's (Min-Heap) Result ---
Optimal Path: A1 -> A4 -> A6 -> B4 -> C7 -> C8
--------------------------------------------------------------------------------
Est. Travel Time:       49.03 mins
Physical Distance:      55.00 km
Road Hops (Segments):   5
Nodes Explored:         20 hubs
Algorithm Runtime:      94.50 microseconds (0.09 ms)
--------------------------------------------------------------------------------
Detour Delay Impact: +5.33 mins added to route to bypass closure.
```

---

## 14. Metropolitan Network Dataset Specification

The metropolitan network models a multi-tiered urban district composed of 20 transit hubs structured into three topological layers:

```
Zone A (Inbound Logistics & Suburbs):
  • A1: North Gateway Hub      • A2: Airport Interchange     • A3: Industrial Terminal
  • A4: Tech Park West         • A5: Cargo Freight Depot     • A6: Northwest Junction
  • A7: Academic Center

Zone B (Central Commercial & Financial District):
  • B1: Grand Central Plaza    • B2: Financial District      • B3: Medical City Hub
  • B4: Midtown Junction       • B5: Waterfront Pier         • B6: Government Center

Zone C (Outbound Residential & Regional Highway):
  • C1: South Hills Terminal   • C2: East River Overpass     • C3: Sports Arena Loop
  • C4: Southeast Gateway      • C5: Valley Metro Hub        • C6: East Logistics Park
  • C7: South Perimeter Junction• C8: South Metro Interchange
```

- **Vertices ($|V|$):** 20 hubs with physical $(x, y, z)$ 3D coordinates.
- **Edges ($|E|$):** 36 bidirectional road corridors (72 directed transitions).
- **Speed Limits:** Arterial streets ($45\text{ km/h}$), Urban Avenues ($60\text{ km/h}$), Freeways ($80\text{ km/h}$), Expressways ($100\text{ km/h}$).

---

## 15. C++ Codebase & File Structure

```
c:\Users\Dev Chahar\OneDrive\Desktop\DSA_Mini_Project
│
├── include/                           # C++ Header Files (Class Definitions)
│   ├── MinHeap.hpp                    # Custom Binary Min-Heap Priority Queue O(log V)
│   ├── DisjointSet.hpp                # Disjoint Set Union (DSU) with Path Compression & Rank
│   ├── Graph.hpp                      # Adjacency List, Edge Weights, Traffic & Blockage Model
│   └── Algorithms.hpp                 # Dijkstra, A*, BFS, DFS, Kruskal MST Definitions
│
├── src/                               # C++ Implementation Files
│   ├── Graph.cpp                      # Network topology initialization & traffic mutators
│   ├── Algorithms.cpp                 # Pathfinding & MST implementations with microsecond timing
│   └── main.cpp                       # ANSI-colored interactive CLI Command Center
│
├── tests/                             # Automated Verification Suite
│   └── test_dsa.cpp                   # 50 unit assertions testing all DSA invariants
│
├── build.bat                          # One-click Windows build script (g++ -O3)
├── run.bat                            # One-click launch script for TrafficOptimizer.exe
├── test.bat                           # One-click script to compile & run test_dsa.cpp
├── Makefile                           # Standard GNU Makefile (Linux / macOS / MSYS2)
├── CMakeLists.txt                     # Multi-platform CMake configuration file
│
├── package.json                       # Optional Web GIS Frontend configuration
├── vite.config.js                     # Vite build & proxy bundler
└── src/components/                    # Optional Web UI (MapContainer, ControlPanel, etc.)
```

---

## 16. Automated Unit Test Suite (50/50 Tests Passed)

To guarantee academic rigor and verify data structure correctness, a standalone C++ automated test runner (`tests/test_dsa.cpp`) validates all underlying data structures against formal mathematical invariants:

```
================================================================================
       C++ DSA ENGINE AUTOMATED UNIT TEST SUITE & VERIFICATION MATRIX          
================================================================================

[1] Testing Custom Min-Heap Priority Queue (MinHeap.hpp)...
  [PASS] Initial heap is empty
  [PASS] Initial size is 0
  [PASS] Heap is not empty after pushes
  [PASS] Heap contains 4 elements
  [PASS] Peek returns minimum element (node_A, 10.0)
  [PASS] Decrease-Key: node_C moved to root with priority 5.0
  [PASS] Heap size remains 4 after decreaseKey
  [PASS] Pop 1: node_C (5.0)
  [PASS] Pop 2: node_A (10.0)
  [PASS] Pop 3: node_D (20.0)
  [PASS] Pop 4: node_B (30.0)
  [PASS] Heap is empty after popping all elements
  [PASS] Popping from empty heap throws std::runtime_error

[2] Testing Disjoint Set Union with Path Compression & Union by Rank (DisjointSet.hpp)...
  [PASS] Initial component count is 6
  [PASS] A and B are initially disconnected
  [PASS] unionSets(A, B) succeeds
  [PASS] A and B are now connected
  [PASS] Component count decremented to 5
  [PASS] Transitive connectivity: A is connected to D via B-C
  [PASS] A and E are still disconnected
  [PASS] Cycle Detection: unionSets(A, D) returns false (same set)
  [PASS] Component count is 2 ({A,B,C,D} and {E,F})
  [PASS] Single connected component after final merge
  [PASS] All nodes mutually connected

[3] Testing Graph Adjacency List & Traffic Model (Graph.hpp)...
  [PASS] Edge e1 successfully retrieved
  [PASS] Effective speed with 1.0x traffic is 60.0 km/h
  [PASS] Base travel time is 10.0 minutes
  [PASS] Effective speed with 2.0x traffic is 30.0 km/h
  [PASS] Congested travel time is 20.0 minutes
  [PASS] Road block toggled to true
  [PASS] Blocked road travel time is infinity
  [PASS] Road block toggled back to false

[4] Testing Graph Pathfinding Algorithms (Dijkstra, A*, BFS, DFS)...
  [PASS] Dijkstra successfully finds a path from A1 to C8
  [PASS] Dijkstra path starts at A1 and terminates at C8
  [PASS] A* Search successfully finds a path from A1 to C8
  [PASS] Optimality Parity: A* and Dijkstra compute the EXACT same minimal travel time
  [PASS] Heuristic Efficiency: A* explores <= nodes than Dijkstra
  [PASS] BFS successfully finds a path
  [PASS] Hop-Count Minimization: BFS achieves minimal or equal hops compared to Dijkstra
  [PASS] DFS successfully finds a path
  [PASS] DFS travel time is >= Dijkstra's optimal travel time

[5] Testing Kruskal's Minimum Spanning Tree (MST)...
  [PASS] Kruskal MST achieves full network connectivity
  [PASS] Kruskal MST edge count equals V - 1 (19 edges for 20 nodes)
  [PASS] Kruskal DSU successfully detected and averted cyclic edges
  [PASS] MST backbone distance is strictly less than full mesh distance

[6] Testing Dynamic Incident Detour & Road Closure Rerouting...
  [PASS] Initial route computed successfully
  [PASS] Initial route has road corridors
  [PASS] Detour route successfully computed around closure
  [PASS] Detour route strictly bypasses the blocked corridor
  [PASS] Detour travel time >= initial travel time (penalty of detour)

================================================================================
  TEST RESULTS: 50 / 50 TESTS PASSED (100% SUCCESS)
  STATUS: Core C++ DSA Engine is 100% Robust, Formally Verified, and Optimal.
================================================================================
```

---

## 17. Compilation & Execution Guide

### Prerequisites
- **Compiler:** `g++` supporting C++17 (MSYS2, MinGW, or Linux GCC 7+).
- **Environment:** Windows PowerShell, Command Prompt, or Linux Terminal.

### 17.1 Compiling with Batch Scripts (Windows)
```cmd
:: 1. Compile both the interactive CLI and automated test suite:
build.bat

:: 2. Run the automated unit tests:
test.bat

:: 3. Launch the interactive C++ Command Center:
run.bat
```

### 17.2 Compiling Directly via `g++`
```bash
# Compile interactive engine with -O3 optimization
g++ -std=c++17 -O3 -Iinclude src/Graph.cpp src/Algorithms.cpp src/main.cpp -o TrafficOptimizer.exe

# Compile automated unit test suite
g++ -std=c++17 -O3 -Iinclude src/Graph.cpp src/Algorithms.cpp tests/test_dsa.cpp -o test_dsa.exe

# Execute binaries
./TrafficOptimizer.exe
./test_dsa.exe
```

### 17.3 Compiling with GNU Makefile
```bash
make          # Builds both TrafficOptimizer.exe and test_dsa.exe
make test     # Executes automated tests
make run      # Launches interactive CLI
make clean    # Cleans compiled binaries
```

---

## 18. Interactive C++ Terminal Command Center

The interactive command interface allows real-time execution and exploration of the metropolitan network:

```text
================================================================================
       NEXUS-3D // C++ INTELLIGENT ROUTE & TRAFFIC SIMULATION ENGINE            
        High-Performance DSA Engine & Dynamic Graph Benchmarking Suite          
================================================================================

[STATUS] Origin: [A1] | Destination: [C8] | Hubs: 20 | Corridors: 36
--------------------------------------------------------------------------------
COMMAND MENU:
  1. Run Dijkstra's Algorithm (Min-Heap)
  2. Run A* Search Algorithm (Euclidean Heuristic)
  3. Run Breadth-First Search (BFS - Fewest Hops)
  4. Run Depth-First Search (DFS - Deep Dive)
  5. Multi-Algorithm Benchmark Comparison Matrix
  6. Run Kruskal's Minimum Spanning Tree (MST with DSU)
  7. Simulate Corridor Closure / Accident (Detour Rerouting)
  8. Surge Rush-Hour Traffic Multipliers
  9. View All 20 City Hubs & Intersections
 10. Change Source / Destination Hubs
 11. Reset Graph to Factory State
  0. Exit Engine
Select Action (0-11):
```

---

## 19. Optional GIS Web Visualization Layer

While the project is strictly **C++ heavy** for core DSA grading, an accompanying GIS Leaflet web interface is available for live graphical demonstrations:

```powershell
# Start Vite local development server
npm.cmd run dev
```
Navigate to `http://localhost:5173/` to view intersections, active route polylines, live road closure toggles, and traffic heat maps.

---

## 20. Viva Voce Questions & Model Answers (25 In-Depth Q&A)

### Topic 1: Graph Representation & Modeling
1. **Q: Why represent a road network as an Adjacency List rather than an Adjacency Matrix?**  
   **A:** Road networks are sparse planar graphs where average vertex degree $\deg(v) \approx 3 \text{ to } 4$. An adjacency matrix requires $\mathcal{O}(|V|^2)$ memory ($400$ entries for $20$ nodes, but $1{,}000{,}000$ entries for $1{,}000$ nodes), wasting space on non-existent edges. An adjacency list consumes only $\mathcal{O}(|V| + |E|)$ memory and allows traversing incident edges in $\mathcal{O}(\deg v)$ rather than scanning $|V|$ matrix columns.

2. **Q: How are road intersections and roadways mapped into graph entities?**  
   **A:** Intersections, toll barriers, and transit hubs are mapped to **vertices (nodes)** $V$. Road corridors are mapped to **edges** $E$. Edge weights represent dynamic **travel times in minutes** rather than static distances.

3. **Q: Why is effective travel time a better weight metric than physical distance?**  
   **A:** A $10\text{ km}$ freeway with an $80\text{ km/h}$ limit takes $7.5\text{ minutes}$, while a $6\text{ km}$ congested alleyway crawling at $15\text{ km/h}$ takes $24\text{ minutes}$. Minimizing distance would route vehicles through congested alleys. Minimizing travel time guarantees true optimal arrival.

4. **Q: How does the engine mathematically handle one-way streets versus dual carriageways?**  
   **A:** Each edge struct contains an `isBidirectional` flag. When true, the edge is registered into the adjacency lists of both endpoints $(u \to v)$ and $(v \to u)$. For one-way roads, it is registered solely in the source node's list.

### Topic 2: Priority Queues & Dijkstra's Algorithm
5. **Q: Why is Dijkstra's algorithm classified as a greedy algorithm?**  
   **A:** At each step, it irrevocably selects the vertex with the currently known minimum tentative distance from the unvisited frontier. It never reconsiders or revisits a settled node because with non-negative edge weights, no subsequent path through other unvisited nodes can yield a shorter distance.

6. **Q: Why does Dijkstra fail or produce incorrect results with negative edge weights?**  
   **A:** Dijkstra assumes that once a node is extracted from the priority queue, its shortest path is permanently finalized. If negative edge weights exist, traversing a future edge could reduce the distance to an already-settled node, violating Dijkstra's greedy invariant. (Bellman-Ford is required for negative weights).

7. **Q: Why implement a custom Min-Heap instead of using C++ `std::priority_queue`?**  
   **A:** `std::priority_queue` lacks a `decreaseKey` method. Updating an existing node's priority requires pushing duplicate entries, inflating queue size to $|E|$ and degrading operations to $\mathcal{O}(\log E)$. Our custom `MinHeap` uses an internal hash map to track node indices, enabling true $\mathcal{O}(\log V)$ `decreaseKey` and strictly bounding queue size to $|V|$.

8. **Q: What is the exact theoretical time complexity of Dijkstra with our custom Min-Heap?**  
   **A:** Each of the $|V|$ vertices is inserted once and extracted once ($\mathcal{O}(|V| \log |V|)$). In the worst case, every edge $e \in |E|$ triggers a relaxation and a `decreaseKey` operation ($\mathcal{O}(|E| \log |V|)$). Total time complexity is $\mathcal{O}((|V| + |E|) \log |V|)$.

### Topic 3: A\* Search & Heuristic Formulation
9. **Q: How does A\* search differ fundamentally from Dijkstra's algorithm?**  
   **A:** Dijkstra evaluates nodes strictly by accumulated cost from source $g(u)$. A\* evaluates nodes by estimated total cost $f(u) = g(u) + h(u)$, where $h(u)$ is a directed heuristic estimating the remaining distance to the target. This prioritizes exploration toward the destination, avoiding exhaustive radial expansion.

10. **Q: What does it mean for a heuristic to be "admissible"?**  
    **A:** A heuristic $h(u)$ is admissible if it never overestimates the true cost to reach the goal: $h(u) \le h^*(u)$ for all $u \in V$.

11. **Q: Prove that the Euclidean distance divided by maximum speed is admissible.**  
    **A:** The straight-line Euclidean distance $\|u - t\|_2$ is the absolute shortest physical path between two points. Since no vehicle can legally exceed the maximum network speed $v_{\max}$, the minimum possible travel time is $\|u - t\|_2 / v_{\max}$. Because actual road distance $\ge$ straight-line distance and actual speed $\le v_{\max}$, the estimate is always $\le$ true remaining travel time. Thus, admissibility is guaranteed.

12. **Q: What happens if an inadmissible heuristic is used in A\*?**  
    **A:** If $h(u) > h^*(u)$, A\* may overestimate the cost of the optimal path, prune it from early consideration, and terminate prematurely with a sub-optimal path.

13. **Q: What is the relationship between Dijkstra and A\*?**  
    **A:** Dijkstra's algorithm is a special case of A\* where $h(u) = 0$ for all nodes.

### Topic 4: Breadth-First Search (BFS) & Depth-First Search (DFS)
14. **Q: Why does BFS guarantee the shortest path on unweighted graphs but fail on traffic networks?**  
    **A:** BFS traverses nodes in order of edge hops. In unweighted graphs, each hop has identical cost, so fewer hops equals shorter distance. In road networks, edges have vastly differing travel times. A 2-hop route through heavy traffic may take $40\text{ minutes}$, while a 4-hop highway detour may take only $15\text{ minutes}$.

15. **Q: Why does DFS produce meandering, high-cost routes?**  
    **A:** DFS explores as deep as possible along each branch before backtracking. It possesses no cost function or frontier priority, greedily following whichever adjacent edge appears first in memory until it hits a dead end or reaches the target.

### Topic 5: Kruskal's Algorithm & Disjoint Set Union (DSU)
16. **Q: What is a Minimum Spanning Tree (MST)?**  
    **A:** For a connected, undirected weighted graph $G = (V, E)$, an MST is an acyclic subgraph $T \subseteq E$ that connects all $|V|$ vertices with exactly $|V| - 1$ edges while minimizing the sum of edge weights.

17. **Q: Why is DSU required in Kruskal's algorithm?**  
    **A:** Kruskal processes edges in ascending order of weight. To prevent adding an edge that creates a cyclic loop, DSU checks whether both endpoints already belong to the same connected component (`find(u) == find(v)`).

18. **Q: Explain Path Compression in DSU.**  
    **A:** During the `find(u)` operation, each visited node updates its parent pointer directly to the representative root of the tree. This flattens the tree hierarchy so future lookups execute in $\mathcal{O}(1)$ time.

19. **Q: Explain Union by Rank in DSU.**  
    **A:** When uniting two disjoint trees, the root of the tree with smaller rank (depth) is made a child of the root with larger rank. If both have identical rank, one becomes parent and its rank increments by 1. This prevents unbalanced linked-list chains, bounding tree height to $\mathcal{O}(\log N)$.

20. **Q: What is the amortized complexity of DSU with both optimizations?**  
    **A:** The amortized time per operation is $\mathcal{O}(\alpha(N))$, where $\alpha$ is the Inverse Ackermann function. For all physically realizable inputs ($N \le 10^{80}$), $\alpha(N) \le 4$, making operations practically constant time $\mathcal{O}(1)$.

21. **Q: Why choose Kruskal's algorithm over Prim's algorithm for urban network backbone design?**  
    **A:** Road networks are sparse ($|E| \ll |V|^2$). Kruskal's sorting of edges $\mathcal{O}(|E| \log |E|)$ followed by near-constant DSU checks is simple, highly cache-efficient, and operates directly on global roadway contracts.

### Topic 6: Dynamic Traffic Simulation & Incident Management
22. **Q: How does the engine model a road closure due to an accident?**  
    **A:** The edge's `isBlocked` flag is set to `true`. When algorithms traverse adjacent edges, the edge relaxation check evaluates `if (e.isBlocked) continue;` or treats $w(e) = \infty$, rendering the corridor impassable.

23. **Q: What is dynamic detour rerouting and how does the engine execute it?**  
    **A:** When an active route corridor is blocked, the engine triggers a re-run of Dijkstra or A\* from the vehicle's current hub to the original destination. The algorithm automatically navigates the remaining open network, finding the next least-cost alternative path.

24. **Q: How does the engine simulate rush-hour traffic surges?**  
    **A:** Corridors have dynamic multipliers $c(e) \in [1.0, 10.0]$. A rush-hour surge scales these multipliers upwards, reducing effective speeds $v_{\text{eff}} = s / c$ and scaling edge travel times proportionally.

25. **Q: What guarantees that the C++ code won't experience memory leaks during continuous execution?**  
    **A:** The implementation adheres strictly to **RAII (Resource Acquisition Is Initialization)**. All graph nodes, edges, heaps, and result paths use standard automatic memory management (`std::vector`, `std::unordered_map`, `std::string`) with zero manual calls to `malloc` or `new`.

---

## 21. Real-World Applications

1. **Autonomous Vehicle Fleet Dispatch:** Autonomous delivery fleets dynamically balance energy consumption and delivery deadlines across metropolitan road networks.
2. **Emergency First-Responder Navigation:** Fire and ambulance services automatically bypass sudden disaster blockages and congested corridors.
3. **Smart City Traffic Operations Centers:** Municipal traffic authorities identify network bottlenecks, dynamically adjust traffic signal timings, and simulate roadwork detour impacts before commencing construction.
4. **Telecom & Utility Backbone Planning:** Fiber-optic and power grid deployments utilize Kruskal's Minimum Spanning Tree to connect all municipal districts with minimal conduit installation cost.

---

## 22. Limitations

1. **Static Speed Limits during Traversal:** Edge travel times are evaluated when the node is settled; they do not model predictive time-dependent traffic profiles (e.g., edge cost changing 15 minutes in the future).
2. **Deterministic Vehicle Volume:** Congestion multipliers are injected via deterministic factors rather than microscopic agent-based vehicular physics (e.g., car-following models).
3. **Turn Penalties Excluded:** The current graph model treats intersection transitions as zero-cost, omitting penalties for difficult left turns across multi-lane avenues.

---

## 23. Future Scope

1. **Time-Dependent Dijkstra (TDD):** Implementing time-varying edge weight functions $w(e, t)$ to account for scheduled rush-hour curves.
2. **Turn Restrictions & Lane Modeling:** Expanding the adjacency model to incorporate dual-node graph transformations supporting turn-prohibition matrices and traffic light delay cycles.
3. **Contraction Hierarchies (CH):** Preprocessing the metropolitan network using node ordering and shortcut edges to achieve sub-millisecond queries on multi-million node continental networks.
4. **Real-Time GTFS & OpenStreetMap Integration:** Ingesting live OpenStreetMap (OSM) PBF data and municipal transit feeds via REST APIs.

---

## 24. References & Academic Citations

1. **Dijkstra, E. W.** (1959). *A note on two problems in connexion with graphs*. Numerische Mathematik, 1(1), 269–271.
2. **Hart, P. E., Nilsson, N. J., & Raphael, B.** (1968). *A formal basis for the heuristic determination of minimum cost paths*. IEEE Transactions on Systems Science and Cybernetics, 4(2), 100–107.
3. **Kruskal, J. B.** (1956). *On the shortest spanning subtree of a graph and the traveling salesman problem*. Proceedings of the American Mathematical Society, 7(1), 48–50.
4. **Tarjan, R. E.** (1975). *Efficiency of a good but not linear set union algorithm*. Journal of the ACM, 22(2), 215–225.
5. **Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C.** (2009). *Introduction to Algorithms* (3rd ed.). MIT Press.

---

<p align="center">
  <b>&copy; 2026 Department of Computer Engineering &bull; Intelligent Route Optimization & Traffic Simulation Engine</b><br>
  <i>Crafted with Academic Excellence in Modern C++ (C++17)</i>
</p>
