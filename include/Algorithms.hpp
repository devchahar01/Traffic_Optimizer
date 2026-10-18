#ifndef ALGORITHMS_HPP
#define ALGORITHMS_HPP

#include "Graph.hpp"
#include <string>
#include <vector>
#include <chrono>

struct RouteResult {
    std::string algorithm;
    std::vector<std::string> path;
    std::vector<std::string> pathEdges;
    double travelTimeMinutes;
    double pathDistanceKm;
    int hops;
    int nodesExplored;
    double executionTimeMicroseconds;
    bool success;
    std::vector<std::string> stepLogs;
};

struct MSTResult {
    std::vector<std::string> mstEdges;
    std::vector<std::string> rejectedEdges;
    double totalDistanceKm;
    double totalTravelTimeMinutes;
    size_t edgesCount;
    bool isConnected;
    double executionTimeMicroseconds;
    std::vector<std::string> stepLogs;
};

class Algorithms {
public:
    static RouteResult runDijkstra(const Graph& graph, const std::string& sourceId, const std::string& targetId);
    static RouteResult runAStar(const Graph& graph, const std::string& sourceId, const std::string& targetId);
    static RouteResult runBFS(const Graph& graph, const std::string& sourceId, const std::string& targetId);
    static RouteResult runDFS(const Graph& graph, const std::string& sourceId, const std::string& targetId);
    static MSTResult runKruskalMST(const Graph& graph);
};

#endif // ALGORITHMS_HPP
