#include "Algorithms.hpp"
#include "MinHeap.hpp"
#include "DisjointSet.hpp"

#include <queue>
#include <stack>
#include <unordered_set>
#include <algorithm>
#include <sstream>
#include <iomanip>

namespace {
    void reconstructPath(
        const std::unordered_map<std::string, std::string>& prev,
        const std::unordered_map<std::string, std::string>& prevEdge,
        const std::string& targetId,
        const std::string& sourceId,
        std::vector<std::string>& path,
        std::vector<std::string>& pathEdges
    ) {
        std::string curr = targetId;
        while (!curr.empty()) {
            path.push_back(curr);
            auto edgeIt = prevEdge.find(curr);
            if (edgeIt != prevEdge.end() && !edgeIt->second.empty()) {
                pathEdges.push_back(edgeIt->second);
            }
            if (curr == sourceId) break;

            auto prevIt = prev.find(curr);
            curr = (prevIt != prev.end()) ? prevIt->second : "";
        }
        std::reverse(path.begin(), path.end());
        std::reverse(pathEdges.begin(), pathEdges.end());
    }

    void calculateMetrics(
        const Graph& graph,
        const std::vector<std::string>& pathEdges,
        double& totalTime,
        double& totalDistance
    ) {
        totalTime = 0.0;
        totalDistance = 0.0;
        for (const auto& edgeId : pathEdges) {
            const Edge* e = graph.getEdge(edgeId);
            if (e) {
                totalTime += e->getEffectiveTravelTime();
                totalDistance += e->baseDistance;
            }
        }
    }
}

// ==========================================
// 1. DIJKSTRA'S ALGORITHM
// ==========================================
RouteResult Algorithms::runDijkstra(const Graph& graph, const std::string& sourceId, const std::string& targetId) {
    auto startClock = std::chrono::high_resolution_clock::now();

    std::unordered_map<std::string, double> dist;
    std::unordered_map<std::string, std::string> prev;
    std::unordered_map<std::string, std::string> prevEdge;
    std::unordered_set<std::string> visited;
    std::vector<std::string> logs;

    for (const auto& node : graph.getAllNodes()) {
        dist[node.id] = std::numeric_limits<double>::infinity();
        prev[node.id] = "";
        prevEdge[node.id] = "";
    }

    dist[sourceId] = 0.0;
    MinHeap<std::string, double> pq;
    pq.push(sourceId, 0.0);

    logs.push_back("Initialize Dijkstra: Distance to Source [" + sourceId + "] = 0 mins.");

    bool found = false;

    while (!pq.isEmpty()) {
        auto top = pq.pop();
        std::string u = top.id;
        double currentDist = top.priority;

        if (visited.find(u) != visited.end()) continue;
        visited.insert(u);

        std::ostringstream ss;
        ss << "Extracted [" << u << "] from Min-Heap (dist: " << std::fixed << std::setprecision(1) << currentDist << "m).";
        logs.push_back(ss.str());

        if (u == targetId) {
            found = true;
            break;
        }

        for (const auto& neighbor : graph.getNeighbors(u)) {
            const std::string& v = neighbor.targetNodeId;
            double weight = neighbor.weight;

            if (neighbor.isBlocked || std::isinf(weight)) {
                logs.push_back("Corridor [" + u + " <-> " + v + "] is BLOCKED.");
                continue;
            }

            if (visited.find(v) != visited.end()) continue;

            double alt = currentDist + weight;
            if (alt < dist[v]) {
                dist[v] = alt;
                prev[v] = u;
                prevEdge[v] = neighbor.edgeId;
                pq.push(v, alt);

                std::ostringstream relaxLog;
                relaxLog << "Relaxed [" << u << " -> " << v << "]: new dist = " << std::fixed << std::setprecision(1) << alt << "m.";
                logs.push_back(relaxLog.str());
            }
        }
    }

    auto endClock = std::chrono::high_resolution_clock::now();
    double execTimeUs = std::chrono::duration<double, std::micro>(endClock - startClock).count();

    RouteResult result;
    result.algorithm = "Dijkstra's (Min-Heap)";
    result.nodesExplored = static_cast<int>(visited.size());
    result.executionTimeMicroseconds = execTimeUs;
    result.stepLogs = logs;

    if (!found || std::isinf(dist[targetId])) {
        result.success = false;
        result.travelTimeMinutes = std::numeric_limits<double>::infinity();
        result.pathDistanceKm = 0.0;
        result.hops = 0;
        return result;
    }

    reconstructPath(prev, prevEdge, targetId, sourceId, result.path, result.pathEdges);
    calculateMetrics(graph, result.pathEdges, result.travelTimeMinutes, result.pathDistanceKm);
    result.hops = std::max(0, static_cast<int>(result.path.size()) - 1);
    result.success = true;

    return result;
}

// ==========================================
// 2. A* SEARCH ALGORITHM
// ==========================================
RouteResult Algorithms::runAStar(const Graph& graph, const std::string& sourceId, const std::string& targetId) {
    auto startClock = std::chrono::high_resolution_clock::now();

    const double maxHighwaySpeed = 90.0; // km/h
    auto heuristic = [&](const std::string& nodeId) -> double {
        double distKm = graph.getEuclideanDistance(nodeId, targetId);
        return (distKm / maxHighwaySpeed) * 60.0; // Admissible travel time in minutes
    };

    std::unordered_map<std::string, double> gScore;
    std::unordered_map<std::string, double> fScore;
    std::unordered_map<std::string, std::string> prev;
    std::unordered_map<std::string, std::string> prevEdge;
    std::unordered_set<std::string> visited;
    std::vector<std::string> logs;

    for (const auto& node : graph.getAllNodes()) {
        gScore[node.id] = std::numeric_limits<double>::infinity();
        fScore[node.id] = std::numeric_limits<double>::infinity();
        prev[node.id] = "";
        prevEdge[node.id] = "";
    }

    gScore[sourceId] = 0.0;
    double startH = heuristic(sourceId);
    fScore[sourceId] = startH;

    MinHeap<std::string, double> openSet;
    openSet.push(sourceId, startH);

    logs.push_back("A* Search initialized at [" + sourceId + "] with h(n) = " + std::to_string(startH) + "m.");

    bool found = false;

    while (!openSet.isEmpty()) {
        auto top = openSet.pop();
        std::string u = top.id;

        if (visited.find(u) != visited.end()) continue;
        visited.insert(u);

        if (u == targetId) {
            found = true;
            break;
        }

        double currentG = gScore[u];

        for (const auto& neighbor : graph.getNeighbors(u)) {
            const std::string& v = neighbor.targetNodeId;
            double weight = neighbor.weight;

            if (neighbor.isBlocked || std::isinf(weight)) continue;
            if (visited.find(v) != visited.end()) continue;

            double tentativeG = currentG + weight;
            if (tentativeG < gScore[v]) {
                gScore[v] = tentativeG;
                prev[v] = u;
                prevEdge[v] = neighbor.edgeId;

                double f = tentativeG + heuristic(v);
                fScore[v] = f;
                openSet.push(v, f);
            }
        }
    }

    auto endClock = std::chrono::high_resolution_clock::now();
    double execTimeUs = std::chrono::duration<double, std::micro>(endClock - startClock).count();

    RouteResult result;
    result.algorithm = "A* Search (Euclidean)";
    result.nodesExplored = static_cast<int>(visited.size());
    result.executionTimeMicroseconds = execTimeUs;
    result.stepLogs = logs;

    if (!found || std::isinf(gScore[targetId])) {
        result.success = false;
        result.travelTimeMinutes = std::numeric_limits<double>::infinity();
        result.pathDistanceKm = 0.0;
        result.hops = 0;
        return result;
    }

    reconstructPath(prev, prevEdge, targetId, sourceId, result.path, result.pathEdges);
    calculateMetrics(graph, result.pathEdges, result.travelTimeMinutes, result.pathDistanceKm);
    result.hops = std::max(0, static_cast<int>(result.path.size()) - 1);
    result.success = true;

    return result;
}

// ==========================================
// 3. BREADTH-FIRST SEARCH (BFS)
// ==========================================
RouteResult Algorithms::runBFS(const Graph& graph, const std::string& sourceId, const std::string& targetId) {
    auto startClock = std::chrono::high_resolution_clock::now();

    std::unordered_set<std::string> visited;
    std::unordered_map<std::string, std::string> prev;
    std::unordered_map<std::string, std::string> prevEdge;
    std::queue<std::string> q;

    visited.insert(sourceId);
    prev[sourceId] = "";
    prevEdge[sourceId] = "";
    q.push(sourceId);

    bool found = false;

    while (!q.empty()) {
        std::string u = q.front();
        q.pop();

        if (u == targetId) {
            found = true;
            break;
        }

        for (const auto& neighbor : graph.getNeighbors(u)) {
            const std::string& v = neighbor.targetNodeId;
            if (neighbor.isBlocked || std::isinf(neighbor.weight)) continue;

            if (visited.find(v) == visited.end()) {
                visited.insert(v);
                prev[v] = u;
                prevEdge[v] = neighbor.edgeId;
                q.push(v);
            }
        }
    }

    auto endClock = std::chrono::high_resolution_clock::now();
    double execTimeUs = std::chrono::duration<double, std::micro>(endClock - startClock).count();

    RouteResult result;
    result.algorithm = "Breadth-First Search (BFS)";
    result.nodesExplored = static_cast<int>(visited.size());
    result.executionTimeMicroseconds = execTimeUs;

    if (!found) {
        result.success = false;
        result.travelTimeMinutes = std::numeric_limits<double>::infinity();
        result.pathDistanceKm = 0.0;
        result.hops = 0;
        return result;
    }

    reconstructPath(prev, prevEdge, targetId, sourceId, result.path, result.pathEdges);
    calculateMetrics(graph, result.pathEdges, result.travelTimeMinutes, result.pathDistanceKm);
    result.hops = std::max(0, static_cast<int>(result.path.size()) - 1);
    result.success = true;

    return result;
}

// ==========================================
// 4. DEPTH-FIRST SEARCH (DFS)
// ==========================================
RouteResult Algorithms::runDFS(const Graph& graph, const std::string& sourceId, const std::string& targetId) {
    auto startClock = std::chrono::high_resolution_clock::now();

    std::unordered_set<std::string> visited;
    std::unordered_map<std::string, std::string> prev;
    std::unordered_map<std::string, std::string> prevEdge;
    std::stack<std::string> s;

    s.push(sourceId);
    prev[sourceId] = "";
    prevEdge[sourceId] = "";

    bool found = false;

    while (!s.empty()) {
        std::string u = s.top();
        s.pop();

        if (visited.find(u) != visited.end()) continue;
        visited.insert(u);

        if (u == targetId) {
            found = true;
            break;
        }

        auto neighbors = graph.getNeighbors(u);
        // Reverse order for consistent exploration
        for (auto it = neighbors.rbegin(); it != neighbors.rend(); ++it) {
            const std::string& v = it->targetNodeId;
            if (it->isBlocked || std::isinf(it->weight)) continue;

            if (visited.find(v) == visited.end()) {
                prev[v] = u;
                prevEdge[v] = it->edgeId;
                s.push(v);
            }
        }
    }

    auto endClock = std::chrono::high_resolution_clock::now();
    double execTimeUs = std::chrono::duration<double, std::micro>(endClock - startClock).count();

    RouteResult result;
    result.algorithm = "Depth-First Search (DFS)";
    result.nodesExplored = static_cast<int>(visited.size());
    result.executionTimeMicroseconds = execTimeUs;

    if (!found) {
        result.success = false;
        result.travelTimeMinutes = std::numeric_limits<double>::infinity();
        result.pathDistanceKm = 0.0;
        result.hops = 0;
        return result;
    }

    reconstructPath(prev, prevEdge, targetId, sourceId, result.path, result.pathEdges);
    calculateMetrics(graph, result.pathEdges, result.travelTimeMinutes, result.pathDistanceKm);
    result.hops = std::max(0, static_cast<int>(result.path.size()) - 1);
    result.success = true;

    return result;
}

// ==========================================
// 5. KRUSKAL'S MINIMUM SPANNING TREE (MST)
// ==========================================
MSTResult Algorithms::runKruskalMST(const Graph& graph) {
    auto startClock = std::chrono::high_resolution_clock::now();

    auto allNodes = graph.getAllNodes();
    auto allEdges = graph.getAllEdges();

    std::vector<Edge> unblockedEdges;
    for (const auto& e : allEdges) {
        if (!e.isBlocked) unblockedEdges.push_back(e);
    }

    // Sort edges ascending by physical base distance
    std::sort(unblockedEdges.begin(), unblockedEdges.end(), [](const Edge& a, const Edge& b) {
        return a.baseDistance < b.baseDistance;
    });

    std::vector<std::string> nodeIds;
    for (const auto& n : allNodes) nodeIds.push_back(n.id);
    DisjointSet dsu(nodeIds);

    MSTResult result;
    result.totalDistanceKm = 0.0;
    result.totalTravelTimeMinutes = 0.0;

    for (const auto& edge : unblockedEdges) {
        if (dsu.unionSets(edge.from, edge.to)) {
            result.mstEdges.push_back(edge.id);
            result.totalDistanceKm += edge.baseDistance;
            result.totalTravelTimeMinutes += edge.getEffectiveTravelTime();

            if (result.mstEdges.size() == allNodes.size() - 1) {
                break; // MST full spanning tree achieved
            }
        } else {
            result.rejectedEdges.push_back(edge.id); // Cycle prevented
        }
    }

    auto endClock = std::chrono::high_resolution_clock::now();
    double execTimeUs = std::chrono::duration<double, std::micro>(endClock - startClock).count();

    result.edgesCount = result.mstEdges.size();
    result.isConnected = (dsu.getComponentCount() == 1);
    result.executionTimeMicroseconds = execTimeUs;

    return result;
}
