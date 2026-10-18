# 🚦 Intelligent Route Optimization & Traffic Simulation Engine

A Data Structures and Algorithms (DSA) mini-project modeling a metropolitan road network as a dynamic weighted graph. The engine implements, visualizes, and compares fundamental graph search and optimization algorithms while dynamically simulating real-world traffic congestion, rush-hour bottlenecks, and unexpected road closures.

---

## 🌟 Key Features

1. **Route Optimization**:
   - Computes optimal travel paths between any selected origin and destination intersections.
   - Real-time road weight formulation incorporating physical distance, posted speed limits, and live traffic congestion multipliers.

2. **Algorithm Comparison Suite**:
   - Compare **Dijkstra's Algorithm**, **A\* Search**, **Breadth-First Search (BFS)**, and **Depth-First Search (DFS)** side-by-side on identical graph states.
   - Comprehensive performance metrics:
     - ⏱️ **Est. Travel Time** (Weighted Cost in minutes)
     - 🛣️ **Path Distance** (Physical km)
     - 🔀 **Road Hops** (Number of edges traversed)
     - 🔍 **Nodes Explored** (Search space expansion)
     - ⚡ **Execution Speed** (Microsecond / millisecond benchmark using `performance.now()`)

3. **Step-by-Step Algorithm Playback & Debugger**:
   - Interactive progress scrubber to inspect each algorithm step-by-step.
   - Live visual cues for **Unvisited**, **Priority Queue Frontier**, **Currently Visited**, and **Final Route**.
   - Inspection of priority queue / open set snapshots and human-readable decision logs.

4. **Dynamic Traffic & Incident Simulation**:
   - Adjustable congestion multipliers ($1.0\times$ Free Flow, $1.5\times$ Moderate, $2.5\times$ Heavy, $4.0\times+$ Gridlock).
   - "Surge Traffic" button to simulate metropolitan rush hour conditions.
   - "Simulate Accident" button to block critical arteries and trigger automatic dynamic detour rerouting.

5. **Network Connectivity & Minimum Spanning Tree (MST)**:
   - Implementation of **Kruskal's Algorithm** with **Disjoint Set Union (DSU)**.
   - Visualizes cycle detection and calculates the minimum infrastructure backbone required to maintain 100% city sector connectivity.

6. **Interactive Canvas Visualizer**:
   - Smooth mouse pan and zoom navigation (zoom to cursor, fit to screen, reset).
   - Animated traffic particle flow along roads with speed proportional to current congestion.
   - Glowing neon optimal path trail with animated direction dashes.
   - Direct click-to-edit for both intersections and road segments.

7. **City Presets & Sandbox**:
   - **Neo Metropolis (Flagship)**: Polycentric city with airport expressways, hospital corridors, and river bridges.
   - **Twin Cities & Island Bridges**: Two urban cores connected by chokepoint bridges — ideal for demonstrating road closure detours.
   - **Manhattan Grid**: Rectangular avenues and cross-streets bisected by diagonal Broadway.
   - **Old European Radial & Ring Road**: Circular ring boulevards with a congested historic cathedral core.
   - **Sandbox Mode**: Click to place custom intersections, drag to connect roads, and export/import graph JSON.

---

## 🧠 Core DSA Concepts Implemented

| Data Structure / Algorithm | File Location | Key Characteristics & Big-O Complexity |
| :--- | :--- | :--- |
| **Binary Min-Heap (Priority Queue)** | [`src/dsa/PriorityQueue.js`](file:///c:/Users/Dev%20Chahar/OneDrive/Desktop/DSA_Mini_Project/src/dsa/PriorityQueue.js) | Array-based binary tree with `bubbleUp` and `bubbleDown`. Insert & Extract-Min in $\mathcal{O}(\log V)$. |
| **Disjoint Set Union (DSU)** | [`src/dsa/DisjointSet.js`](file:///c:/Users/Dev%20Chahar/OneDrive/Desktop/DSA_Mini_Project/src/dsa/DisjointSet.js) | Path compression + Union by Rank. Near $\mathcal{O}(1)$ amortized cycle check ($\alpha(V)$). |
| **Dijkstra's Algorithm** | [`src/dsa/graphAlgorithms.js`](file:///c:/Users/Dev%20Chahar/OneDrive/Desktop/DSA_Mini_Project/src/dsa/graphAlgorithms.js) | Guaranteed minimum travel time on non-negative weighted graphs: $\mathcal{O}((V + E) \log V)$. |
| **A\* Search Algorithm** | [`src/dsa/graphAlgorithms.js`](file:///c:/Users/Dev%20Chahar/OneDrive/Desktop/DSA_Mini_Project/src/dsa/graphAlgorithms.js) | Heuristic-guided exploration using Euclidean distance divided by max highway speed: $f(n) = g(n) + h(n)$. |
| **Breadth-First Search (BFS)** | [`src/dsa/graphAlgorithms.js`](file:///c:/Users/Dev%20Chahar/OneDrive/Desktop/DSA_Mini_Project/src/dsa/graphAlgorithms.js) | First-In-First-Out (FIFO) queue for unweighted shortest hop path: $\mathcal{O}(V + E)$. |
| **Depth-First Search (DFS)** | [`src/dsa/graphAlgorithms.js`](file:///c:/Users/Dev%20Chahar/OneDrive/Desktop/DSA_Mini_Project/src/dsa/graphAlgorithms.js) | Last-In-First-Out (LIFO) stack for deep path exploration: $\mathcal{O}(V + E)$. |
| **Kruskal's MST Algorithm** | [`src/dsa/graphAlgorithms.js`](file:///c:/Users/Dev%20Chahar/OneDrive/Desktop/DSA_Mini_Project/src/dsa/graphAlgorithms.js) | Greedy edge sorting + DSU cycle prevention: $\mathcal{O}(E \log E)$. |

---

## 📐 Mathematical Formulation of Edge Weights

For any road segment $e = (u, v)$ with physical distance $d$ (km), speed limit $s$ (km/h), and congestion multiplier $c \ge 1.0$:

$$\text{Effective Speed } v_{\text{eff}} = \max\left(5, \frac{s}{c}\right) \text{ km/h}$$

$$\text{Travel Time Weight } w(e) = \begin{cases} 
\infty & \text{if road is blocked/closed} \\ 
\left(\frac{d}{v_{\text{eff}}}\right) \times 60 \text{ minutes} & \text{otherwise} 
\end{cases}$$

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Launch
```bash
# Clone or navigate to the project directory
cd DSA_Mini_Project

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173/
```

### Production Build
To create an optimized production build:
```bash
npm run build
```

---

## 🕹️ Interactive Controls Guide

- **Pan Canvas**: Click and drag on empty canvas background.
- **Zoom Canvas**: Use mouse scroll wheel or top-right zoom buttons ($+ / - / \text{Fit}$).
- **Select Origin / Destination**: Click on any intersection on the canvas, or select from the left sidebar dropdowns.
- **Block a Road**: Click any road line on the canvas to open the road inspector, then click **"Block Road"**.
- **Adjust Traffic**: Open any road inspector and move the congestion slider ($1.0\times$ to $4.0\times$).
- **Step-by-Step Playback**: Use the playback bar at the bottom to step forward, backward, or adjust simulation speed.
- **Compare Algorithms**: Click **"Compare Algorithms"** in the top navigation bar to view side-by-side benchmark bar charts.
- **DSA Academy**: Click **"DSA Academy"** in the top bar to inspect Big-O complexities and pseudocode.
