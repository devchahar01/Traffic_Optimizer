# 🚦 Intelligent Route Optimization & Traffic Simulation Engine (C++ & 3D Web)

A comprehensive Data Structures and Algorithms (DSA) project implementing a tactical 20-node city road network graph with dynamic edge weighting, traffic congestion scaling, unexpected road closures, dynamic detour rerouting, and Kruskal's Minimum Spanning Tree (MST).

---

## ⚡ C++ High-Performance DSA Engine

The core DSA engine is fully implemented in modern **C++ (C++17)** with zero external dependencies, featuring custom data structures and microsecond-level benchmarking.

### C++ Directory Structure
```
├── include/
│   ├── MinHeap.hpp        # Custom Binary Min-Heap Priority Queue O(log V) with index tracking
│   ├── DisjointSet.hpp    # Disjoint Set Union (DSU) with Path Compression & Union by Rank
│   ├── Graph.hpp          # Adjacency list, 3D vector coordinates, dynamic weights, blockages
│   └── Algorithms.hpp     # Dijkstra, A*, BFS, DFS, and Kruskal's MST
├── src/
│   ├── Graph.cpp          # 20-node cyber metropolis graph initialization & topology
│   ├── Algorithms.cpp     # Microsecond-accurate pathfinding & spanning tree implementations
│   └── main.cpp           # Interactive ANSI-colored command center CLI
├── build.bat              # One-click Windows build script (g++ -std=c++17 -O3)
├── run.bat                # One-click launcher
├── Makefile               # GNU makefile for Linux/macOS
└── CMakeLists.txt         # Standard CMake configuration
```

### 🔨 Compiling and Running the C++ Engine

#### On Windows (PowerShell / CMD):
```powershell
# Compile with g++
.\build.bat

# Launch the interactive C++ Command Center
.\run.bat
# or directly:
.\TrafficOptimizer.exe
```

#### On Linux / macOS:
```bash
make
./TrafficOptimizer.exe
```

---

## 📊 C++ Benchmark Results (Sample Output)

```text
================================================================================
           MULTI-ALGORITHM PERFORMANCE BENCHMARK MATRIX (C++)                  
                 Origin: [A1]  -->  Destination: [C8]               
================================================================================
Algorithm                   Travel Time     Distance      Hops      Explored    Runtime (us)    
--------------------------------------------------------------------------------
Dijkstra's (Min-Heap)       43.6 min        51 km         5         20 hubs     311 us          
A* Search (Euclidean)       43.6 min        51 km         5         10 hubs     68 us           
Breadth-First Search (BFS)  43.6 min        51 km         5         20 hubs     41 us           
Depth-First Search (DFS)    209.9 min       159 km        17        19 hubs     37 us           
--------------------------------------------------------------------------------
```

### 🧠 Core DSA Theoretical Complexity

| Algorithm | Data Structure | Time Complexity | Space Complexity | Optimality |
| :--- | :--- | :--- | :--- | :--- |
| **Dijkstra's Algorithm** | Binary Min-Heap ([`MinHeap.hpp`](include/MinHeap.hpp)) | $\mathcal{O}((V + E) \log V)$ | $\mathcal{O}(V)$ | Guaranteed optimal travel time |
| **A\* Search** | Min-Heap + Euclidean Heuristic | $\mathcal{O}((V + E) \log V)$ | $\mathcal{O}(V)$ | Guaranteed optimal with fewer nodes explored |
| **Breadth-First Search** | FIFO Queue | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ | Minimal hop count (unweighted) |
| **Depth-First Search** | LIFO Stack | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ | Suboptimal / meandering |
| **Kruskal's Algorithm** | Disjoint Set Union ([`DisjointSet.hpp`](include/DisjointSet.hpp)) | $\mathcal{O}(E \log E)$ | $\mathcal{O}(V)$ | Minimal total infrastructure cost |

---

## 🌐 3D Web Command Center (Three.js & R3F)

To run the interactive 3D tactical web application locally:
```powershell
npm.cmd run dev
```
Navigate to: `http://localhost:5173/`
