#include "Graph.hpp"
#include <random>
#include <algorithm>

void Graph::addNode(const std::string& id, const std::string& label, const std::string& type, double x, double y, double z) {
    nodes[id] = Node{id, label, type, x, y, z};
    if (adjacency.find(id) == adjacency.end()) {
        adjacency[id] = std::vector<std::string>();
    }
}

void Graph::addEdge(const std::string& id, const std::string& from, const std::string& to, double baseDistance, double speedLimit, double trafficMultiplier, bool isBlocked, bool isBidirectional, const std::string& label) {
    std::string edgeLabel = label.empty() ? (from + " <-> " + to) : label;
    edges[id] = Edge{id, from, to, baseDistance, speedLimit, trafficMultiplier, isBlocked, isBidirectional, edgeLabel};

    adjacency[from].push_back(id);
    if (isBidirectional) {
        adjacency[to].push_back(id);
    }
}

const Node* Graph::getNode(const std::string& id) const {
    auto it = nodes.find(id);
    return it != nodes.end() ? &(it->second) : nullptr;
}

const Edge* Graph::getEdge(const std::string& id) const {
    auto it = edges.find(id);
    return it != edges.end() ? &(it->second) : nullptr;
}

Edge* Graph::getEdgeMutable(const std::string& id) {
    auto it = edges.find(id);
    return it != edges.end() ? &(it->second) : nullptr;
}

std::vector<Node> Graph::getAllNodes() const {
    std::vector<Node> result;
    result.reserve(nodes.size());
    for (const auto& pair : nodes) {
        result.push_back(pair.second);
    }
    return result;
}

std::vector<Edge> Graph::getAllEdges() const {
    std::vector<Edge> result;
    result.reserve(edges.size());
    for (const auto& pair : edges) {
        result.push_back(pair.second);
    }
    return result;
}

std::vector<Graph::NeighborInfo> Graph::getNeighbors(const std::string& nodeId) const {
    std::vector<NeighborInfo> neighbors;
    auto it = adjacency.find(nodeId);
    if (it == adjacency.end()) return neighbors;

    for (const auto& edgeId : it->second) {
        auto edgeIt = edges.find(edgeId);
        if (edgeIt == edges.end()) continue;

        const Edge& edge = edgeIt->second;
        std::string target = (edge.from == nodeId) ? edge.to : edge.from;

        neighbors.push_back(NeighborInfo{
            target,
            edge.id,
            edge.getEffectiveTravelTime(),
            edge.baseDistance,
            edge.isBlocked
        });
    }

    return neighbors;
}

double Graph::getEuclideanDistance(const std::string& nodeAId, const std::string& nodeBId) const {
    const Node* a = getNode(nodeAId);
    const Node* b = getNode(nodeBId);
    if (!a || !b) return 0.0;

    double dx = a->x - b->x;
    double dy = a->y - b->y;
    double dz = a->z - b->z;
    return std::sqrt(dx * dx + dy * dy + dz * dz);
}

void Graph::setTrafficMultiplier(const std::string& edgeId, double multiplier) {
    Edge* edge = getEdgeMutable(edgeId);
    if (edge) {
        edge->trafficMultiplier = std::max(1.0, multiplier);
    }
}

bool Graph::toggleRoadBlock(const std::string& edgeId) {
    Edge* edge = getEdgeMutable(edgeId);
    if (edge) {
        edge->isBlocked = !edge->isBlocked;
        return edge->isBlocked;
    }
    return false;
}

void Graph::clearAllBlocks() {
    for (auto& pair : edges) {
        pair.second.isBlocked = false;
    }
}

void Graph::resetAllTraffic() {
    for (auto& pair : edges) {
        pair.second.trafficMultiplier = 1.0;
    }
}

void Graph::surgeRandomTraffic() {
    static std::mt19937 rng(42);
    std::uniform_real_distribution<double> dist(1.0, 4.5);

    for (auto& pair : edges) {
        pair.second.trafficMultiplier = dist(rng);
    }
}

Graph Graph::createDefaultGrid() {
    Graph g;

    // 20 Tactical City Hub Nodes mapped in 3D Space (X, Y, Z)
    struct NodeData {
        const char* id;
        const char* label;
        const char* type;
        double x, y, z;
    } defaultNodes[] = {
        // Sector A (West Commercial Core)
        {"A1", "Sky-Port Terminal", "port", -18.0, 1.5, -14.0},
        {"A2", "Alpha Highway Gate", "highway", -9.0, 0.8, -14.0},
        {"A3", "Financial Monolith", "commercial", -18.0, 0.0, -5.0},
        {"A4", "Downtown Transit Node", "hub", -9.0, 0.0, -5.0},
        {"A5", "West Residential Spoke", "residential", -18.0, 0.0, 5.0},
        {"A6", "West Canal Crossing", "bridge", -9.0, 0.2, 5.0},
        {"A7", "Cargo Logistics Deck", "industrial", -18.0, 0.0, 14.0},
        {"A8", "Southwest Substation", "utility", -9.0, 0.0, 14.0},

        // Sector B (Central Spine & Elevated Expressway)
        {"B1", "North Bypass Flyover", "highway", 0.0, 3.5, -14.0},
        {"B2", "Grand Central Plaza", "hub", 0.0, 0.0, -5.0},
        {"B3", "Cyber Tower Interchange", "hub", 0.0, 1.2, 5.0},
        {"B4", "South Expressway Link", "highway", 0.0, 3.0, 14.0},

        // Sector C (East High-Tech & Medical District)
        {"C1", "Quantum Tech Park", "tech", 9.0, 0.5, -14.0},
        {"C2", "East Skyway Pylon", "highway", 18.0, 2.0, -14.0},
        {"C3", "Trauma Medical Center", "hospital", 9.0, 0.0, -5.0},
        {"C4", "Biotech Labs Campus", "tech", 18.0, 0.0, -5.0},
        {"C5", "East Canal Bridge", "bridge", 9.0, 0.2, 5.0},
        {"C6", "University Complex", "university", 18.0, 0.0, 5.0},
        {"C7", "East Waterfront Pier", "port", 9.0, 0.0, 14.0},
        {"C8", "Southeast Arcology", "residential", 18.0, 0.0, 14.0}
    };

    for (const auto& n : defaultNodes) {
        g.addNode(n.id, n.label, n.type, n.x, n.y, n.z);
    }

    struct EdgeData {
        const char* from;
        const char* to;
        double dist;
        double speed;
        double traffic;
    } defaultEdges[] = {
        {"A1", "A2", 9.0, 80.0, 1.0},
        {"A1", "A3", 9.0, 60.0, 1.0},
        {"A2", "A4", 9.0, 60.0, 1.4},
        {"A3", "A4", 9.0, 50.0, 1.8},
        {"A3", "A5", 10.0, 60.0, 1.0},
        {"A4", "A6", 10.0, 55.0, 1.2},
        {"A5", "A6", 9.0, 50.0, 1.0},
        {"A5", "A7", 9.0, 60.0, 1.0},
        {"A6", "A8", 9.0, 55.0, 1.0},
        {"A7", "A8", 9.0, 60.0, 1.0},

        // Inter-sector A to B
        {"A2", "B1", 9.5, 90.0, 1.2},
        {"A4", "B2", 9.0, 45.0, 2.2}, // Downtown congestion
        {"A6", "B3", 9.5, 60.0, 1.3},
        {"A8", "B4", 9.5, 70.0, 1.0},

        // Sector B Spine
        {"B1", "B2", 10.0, 70.0, 1.5},
        {"B2", "B3", 10.0, 40.0, 2.5}, // CBD core bottleneck
        {"B3", "B4", 10.0, 75.0, 1.1},

        // Inter-sector B to C
        {"B1", "C1", 9.5, 80.0, 1.1},
        {"B2", "C3", 9.0, 50.0, 1.9}, // Hospital approach
        {"B3", "C5", 9.5, 60.0, 1.2},
        {"B4", "C7", 9.5, 70.0, 1.0},

        // Sector C Internal
        {"C1", "C2", 9.0, 80.0, 1.0},
        {"C1", "C3", 9.0, 60.0, 1.4},
        {"C2", "C4", 9.0, 70.0, 1.0},
        {"C3", "C4", 9.0, 50.0, 1.6},
        {"C3", "C5", 10.0, 55.0, 1.2},
        {"C4", "C6", 10.0, 60.0, 1.0},
        {"C5", "C6", 9.0, 50.0, 1.0},
        {"C5", "C7", 9.0, 60.0, 1.0},
        {"C6", "C8", 9.0, 55.0, 1.0},
        {"C7", "C8", 9.0, 60.0, 1.0},

        // Express Diagonals & Flyovers
        {"A1", "A4", 13.0, 90.0, 1.0},
        {"A4", "B1", 13.5, 85.0, 1.1},
        {"B1", "C4", 13.5, 85.0, 1.0},
        {"A6", "B4", 13.5, 80.0, 1.0},
        {"B4", "C5", 13.5, 80.0, 1.0}
    };

    int edgeIdx = 1;
    for (const auto& e : defaultEdges) {
        std::string edgeId = "e_" + std::string(e.from) + "_" + std::string(e.to);
        std::string label = "Corridor " + std::to_string(edgeIdx++);
        g.addEdge(edgeId, e.from, e.to, e.dist, e.speed, e.traffic, false, true, label);
    }

    return g;
}
