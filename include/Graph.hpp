#ifndef GRAPH_HPP
#define GRAPH_HPP

#include <string>
#include <vector>
#include <unordered_map>
#include <limits>
#include <cmath>

struct Node {
    std::string id;
    std::string label;
    std::string type;
    double x;
    double y;
    double z;
};

struct Edge {
    std::string id;
    std::string from;
    std::string to;
    double baseDistance;      // km
    double speedLimit;        // km/h
    double trafficMultiplier; // 1.0x to 10.0x
    bool isBlocked;           // Road closure
    bool isBidirectional;
    std::string label;

    double getEffectiveSpeed() const {
        double mult = std::max(1.0, trafficMultiplier);
        return std::max(5.0, speedLimit / mult);
    }

    double getEffectiveTravelTime() const {
        if (isBlocked) {
            return std::numeric_limits<double>::infinity();
        }
        return (baseDistance / getEffectiveSpeed()) * 60.0; // Minutes
    }
};

class Graph {
private:
    std::unordered_map<std::string, Node> nodes;
    std::unordered_map<std::string, Edge> edges;
    std::unordered_map<std::string, std::vector<std::string>> adjacency; // nodeId -> list of edgeIds

public:
    Graph() = default;

    void addNode(const std::string& id, const std::string& label, const std::string& type, double x, double y, double z);
    void addEdge(const std::string& id, const std::string& from, const std::string& to, double baseDistance, double speedLimit, double trafficMultiplier = 1.0, bool isBlocked = false, bool isBidirectional = true, const std::string& label = "");

    const Node* getNode(const std::string& id) const;
    const Edge* getEdge(const std::string& id) const;
    Edge* getEdgeMutable(const std::string& id);

    std::vector<Node> getAllNodes() const;
    std::vector<Edge> getAllEdges() const;

    struct NeighborInfo {
        std::string targetNodeId;
        std::string edgeId;
        double weight; // Effective travel time
        double distance;
        bool isBlocked;
    };

    std::vector<NeighborInfo> getNeighbors(const std::string& nodeId) const;

    double getEuclideanDistance(const std::string& nodeAId, const std::string& nodeBId) const;

    void setTrafficMultiplier(const std::string& edgeId, double multiplier);
    bool toggleRoadBlock(const std::string& edgeId);
    void clearAllBlocks();
    void resetAllTraffic();
    void surgeRandomTraffic();

    static Graph createDefaultGrid();
};

#endif // GRAPH_HPP
