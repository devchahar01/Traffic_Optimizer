#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>

#ifdef _WIN32
#include <windows.h>
#endif

#include "Graph.hpp"
#include "Algorithms.hpp"

// ANSI Color Constants for Cyber-Command Aesthetic
namespace Colors {
    const char* RESET   = "\033[0m";
    const char* BOLD    = "\033[1m";
    const char* CYAN    = "\033[96m";
    const char* GREEN   = "\033[92m";
    const char* YELLOW  = "\033[93m";
    const char* RED     = "\033[91m";
    const char* MAGENTA = "\033[95m";
    const char* BLUE    = "\033[94m";
    const char* GRAY    = "\033[90m";
    const char* BG_DARK = "\033[40m";
}

void enableVirtualTerminal() {
#ifdef _WIN32
    HANDLE hOut = GetStdHandle(STD_OUTPUT_HANDLE);
    if (hOut != INVALID_HANDLE_VALUE) {
        DWORD dwMode = 0;
        if (GetConsoleMode(hOut, &dwMode)) {
            dwMode |= ENABLE_VIRTUAL_TERMINAL_PROCESSING;
            SetConsoleMode(hOut, dwMode);
        }
    }
#endif
}

void printBanner() {
    std::cout << Colors::CYAN << Colors::BOLD;
    std::cout << "================================================================================\n";
    std::cout << "       NEXUS-3D // C++ INTELLIGENT ROUTE & TRAFFIC SIMULATION ENGINE            \n";
    std::cout << "        High-Performance DSA Engine & Dynamic Graph Benchmarking Suite          \n";
    std::cout << "================================================================================\n";
    std::cout << Colors::RESET;
}

void printRouteResult(const RouteResult& res) {
    std::cout << "\n" << Colors::BOLD << Colors::CYAN << "--- " << res.algorithm << " Result ---" << Colors::RESET << "\n";
    if (!res.success) {
        std::cout << Colors::RED << "[!] Route Unreachable: Network is disconnected or corridors are closed." << Colors::RESET << "\n";
        return;
    }

    std::cout << Colors::GREEN << "Optimal Path: ";
    for (size_t i = 0; i < res.path.size(); ++i) {
        std::cout << Colors::BOLD << res.path[i] << Colors::RESET;
        if (i < res.path.size() - 1) std::cout << " -> ";
    }
    std::cout << "\n";

    std::cout << Colors::GRAY << "--------------------------------------------------------------------------------\n" << Colors::RESET;
    std::cout << std::left << std::setw(24) << "Est. Travel Time:" << Colors::YELLOW << Colors::BOLD << std::fixed << std::setprecision(2) << res.travelTimeMinutes << " mins" << Colors::RESET << "\n";
    std::cout << std::left << std::setw(24) << "Physical Distance:" << Colors::CYAN << res.pathDistanceKm << " km" << Colors::RESET << "\n";
    std::cout << std::left << std::setw(24) << "Road Hops (Segments):" << Colors::CYAN << res.hops << Colors::RESET << "\n";
    std::cout << std::left << std::setw(24) << "Nodes Explored:" << Colors::MAGENTA << res.nodesExplored << " hubs" << Colors::RESET << "\n";
    std::cout << std::left << std::setw(24) << "Algorithm Runtime:" << Colors::GREEN << std::fixed << std::setprecision(2) << res.executionTimeMicroseconds << " microseconds (" << (res.executionTimeMicroseconds / 1000.0) << " ms)" << Colors::RESET << "\n";
    std::cout << Colors::GRAY << "--------------------------------------------------------------------------------\n" << Colors::RESET;
}

void runBenchmarkComparison(const Graph& graph, const std::string& source, const std::string& target) {
    std::cout << "\n" << Colors::CYAN << Colors::BOLD;
    std::cout << "================================================================================\n";
    std::cout << "           MULTI-ALGORITHM PERFORMANCE BENCHMARK MATRIX (C++)                  \n";
    std::cout << "                 Origin: [" << source << "]  -->  Destination: [" << target << "]               \n";
    std::cout << "================================================================================\n";
    std::cout << Colors::RESET;

    RouteResult dijkstra = Algorithms::runDijkstra(graph, source, target);
    RouteResult astar    = Algorithms::runAStar(graph, source, target);
    RouteResult bfs      = Algorithms::runBFS(graph, source, target);
    RouteResult dfs      = Algorithms::runDFS(graph, source, target);

    std::vector<RouteResult> results = {dijkstra, astar, bfs, dfs};

    // Table Header
    std::cout << Colors::BOLD;
    std::cout << std::left 
              << std::setw(28) << "Algorithm"
              << std::setw(16) << "Travel Time"
              << std::setw(14) << "Distance"
              << std::setw(10) << "Hops"
              << std::setw(12) << "Explored"
              << std::setw(16) << "Runtime (us)"
              << "\n";
    std::cout << Colors::GRAY << "--------------------------------------------------------------------------------\n" << Colors::RESET;

    for (const auto& r : results) {
        std::string algoColor = Colors::CYAN;
        if (r.algorithm.find("Dijkstra") != std::string::npos) algoColor = Colors::CYAN;
        else if (r.algorithm.find("A*") != std::string::npos) algoColor = Colors::GREEN;
        else if (r.algorithm.find("BFS") != std::string::npos) algoColor = Colors::YELLOW;
        else if (r.algorithm.find("DFS") != std::string::npos) algoColor = Colors::MAGENTA;

        std::cout << algoColor << std::left << std::setw(28) << r.algorithm << Colors::RESET;

        if (r.success) {
            std::cout << std::left 
                      << std::setw(16) << (std::to_string(static_cast<int>(r.travelTimeMinutes)) + "." + std::to_string(static_cast<int>(r.travelTimeMinutes * 10) % 10) + " min")
                      << std::setw(14) << (std::to_string(static_cast<int>(r.pathDistanceKm)) + " km")
                      << std::setw(10) << r.hops
                      << std::setw(12) << (std::to_string(r.nodesExplored) + " hubs")
                      << std::setw(16) << (std::to_string(static_cast<int>(r.executionTimeMicroseconds)) + " us")
                      << "\n";
        } else {
            std::cout << Colors::RED << "NO FEASIBLE PATH FOUND" << Colors::RESET << "\n";
        }
    }
    std::cout << Colors::GRAY << "--------------------------------------------------------------------------------\n" << Colors::RESET;

    std::cout << Colors::BOLD << Colors::YELLOW << "Architectural Takeaways:\n" << Colors::RESET;
    std::cout << " * " << Colors::CYAN << "Dijkstra" << Colors::RESET << " guarantees minimal travel time with Min-Heap O((V+E)log V).\n";
    std::cout << " * " << Colors::GREEN << "A* Search" << Colors::RESET << " achieves identical optimal travel time while exploring fewer nodes via Euclidean heuristic.\n";
    std::cout << " * " << Colors::YELLOW << "BFS" << Colors::RESET << " minimizes hop count (intersections), ignoring travel congestion.\n";
    std::cout << " * " << Colors::MAGENTA << "DFS" << Colors::RESET << " explores deep branches, yielding meandering routes with higher total travel time.\n";
}

void printMST(const Graph& graph) {
    std::cout << "\n" << Colors::BOLD << Colors::YELLOW;
    std::cout << "================================================================================\n";
    std::cout << "           KRUSKAL'S MINIMUM SPANNING TREE (MST) & DSU INFRASTRUCTURE           \n";
    std::cout << "================================================================================\n";
    std::cout << Colors::RESET;

    MSTResult mst = Algorithms::runKruskalMST(graph);

    double totalGridDist = 0.0;
    for (const auto& e : graph.getAllEdges()) {
        if (!e.isBlocked) totalGridDist += e.baseDistance;
    }

    double savings = totalGridDist > 0 ? ((totalGridDist - mst.totalDistanceKm) / totalGridDist) * 100.0 : 0.0;

    std::cout << Colors::GREEN << "[+] Connected Components: " << (mst.isConnected ? "1 (Full Connectivity Achieved)" : "Fragmented") << Colors::RESET << "\n";
    std::cout << "Total Network Backbone Distance: " << Colors::CYAN << Colors::BOLD << mst.totalDistanceKm << " km" << Colors::RESET << " (vs " << totalGridDist << " km full grid)\n";
    std::cout << "Infrastructure Material Savings: " << Colors::GREEN << Colors::BOLD << std::fixed << std::setprecision(1) << savings << "% less roadway" << Colors::RESET << "\n";
    std::cout << "Corridors in Minimum Spanning Tree: " << Colors::YELLOW << mst.edgesCount << Colors::RESET << "\n";
    std::cout << "Cycles Prevented via DSU: " << Colors::RED << mst.rejectedEdges.size() << " cyclic loops averted" << Colors::RESET << "\n";
    std::cout << "DSU Execution Time: " << Colors::GREEN << mst.executionTimeMicroseconds << " microseconds\n" << Colors::RESET;
}

void displayNodes(const Graph& graph) {
    std::cout << "\n" << Colors::BOLD << Colors::CYAN << "--- Tactical 20-Node City Grid ---" << Colors::RESET << "\n";
    auto nodes = graph.getAllNodes();
    std::sort(nodes.begin(), nodes.end(), [](const Node& a, const Node& b) { return a.id < b.id; });

    for (size_t i = 0; i < nodes.size(); ++i) {
        std::cout << Colors::CYAN << "[" << nodes[i].id << "] " << Colors::RESET 
                  << std::left << std::setw(26) << nodes[i].label 
                  << Colors::GRAY << "(" << nodes[i].type << ")" << Colors::RESET;
        if ((i + 1) % 2 == 0) std::cout << "\n";
        else std::cout << "\t";
    }
    std::cout << "\n";
}

int main() {
    enableVirtualTerminal();
    printBanner();

    Graph graph = Graph::createDefaultGrid();
    std::string sourceId = "A1";
    std::string destinationId = "C8";

    bool running = true;
    while (running) {
        std::cout << "\n" << Colors::BOLD << Colors::BLUE << "[STATUS]" << Colors::RESET
                  << " Origin: " << Colors::GREEN << "[" << sourceId << "]" << Colors::RESET
                  << " | Destination: " << Colors::CYAN << "[" << destinationId << "]" << Colors::RESET
                  << " | Hubs: " << graph.getAllNodes().size()
                  << " | Corridors: " << graph.getAllEdges().size()
                  << "\n";

        std::cout << Colors::BOLD << Colors::GRAY << "--------------------------------------------------------------------------------\n" << Colors::RESET;
        std::cout << Colors::BOLD << "COMMAND MENU:\n" << Colors::RESET;
        std::cout << "  " << Colors::CYAN << "1." << Colors::RESET << " Run Dijkstra's Algorithm (Min-Heap)\n";
        std::cout << "  " << Colors::GREEN << "2." << Colors::RESET << " Run A* Search Algorithm (Euclidean Heuristic)\n";
        std::cout << "  " << Colors::YELLOW << "3." << Colors::RESET << " Run Breadth-First Search (BFS - Fewest Hops)\n";
        std::cout << "  " << Colors::MAGENTA << "4." << Colors::RESET << " Run Depth-First Search (DFS - Deep Dive)\n";
        std::cout << "  " << Colors::CYAN << "5." << Colors::RESET << " Multi-Algorithm Benchmark Comparison Matrix\n";
        std::cout << "  " << Colors::YELLOW << "6." << Colors::RESET << " Run Kruskal's Minimum Spanning Tree (MST with DSU)\n";
        std::cout << "  " << Colors::RED << "7." << Colors::RESET << " Simulate Corridor Closure / Accident (Detour Rerouting)\n";
        std::cout << "  " << Colors::YELLOW << "8." << Colors::RESET << " Surge Rush-Hour Traffic Multipliers\n";
        std::cout << "  " << Colors::CYAN << "9." << Colors::RESET << " View All 20 City Hubs & Intersections\n";
        std::cout << " " << Colors::GREEN << "10." << Colors::RESET << " Change Source / Destination Hubs\n";
        std::cout << " " << Colors::GRAY << "11." << Colors::RESET << " Reset Graph to Factory State\n";
        std::cout << "  " << Colors::RED << "0." << Colors::RESET << " Exit Engine\n";
        std::cout << Colors::BOLD << "Select Action (0-11): " << Colors::RESET;

        int choice = -1;
        if (!(std::cin >> choice)) {
            std::cin.clear();
            std::string discard;
            std::cin >> discard;
            continue;
        }

        switch (choice) {
            case 1: {
                RouteResult res = Algorithms::runDijkstra(graph, sourceId, destinationId);
                printRouteResult(res);
                break;
            }
            case 2: {
                RouteResult res = Algorithms::runAStar(graph, sourceId, destinationId);
                printRouteResult(res);
                break;
            }
            case 3: {
                RouteResult res = Algorithms::runBFS(graph, sourceId, destinationId);
                printRouteResult(res);
                break;
            }
            case 4: {
                RouteResult res = Algorithms::runDFS(graph, sourceId, destinationId);
                printRouteResult(res);
                break;
            }
            case 5: {
                runBenchmarkComparison(graph, sourceId, destinationId);
                break;
            }
            case 6: {
                printMST(graph);
                break;
            }
            case 7: {
                // Find a corridor on current Dijkstra route and block it
                RouteResult curr = Algorithms::runDijkstra(graph, sourceId, destinationId);
                if (curr.success && !curr.pathEdges.empty()) {
                    std::string edgeToBlock = curr.pathEdges[curr.pathEdges.size() / 2];
                    graph.toggleRoadBlock(edgeToBlock);
                    std::cout << Colors::RED << "\n[!] ACCIDENT REPORTED: Corridor [" << edgeToBlock << "] is now CLOSED / BLOCKED!\n" << Colors::RESET;
                    std::cout << Colors::YELLOW << "[*] Computing Dynamic Alternative Detour...\n" << Colors::RESET;
                    RouteResult detour = Algorithms::runDijkstra(graph, sourceId, destinationId);
                    printRouteResult(detour);
                    if (detour.success) {
                        double delay = detour.travelTimeMinutes - curr.travelTimeMinutes;
                        std::cout << Colors::YELLOW << "Detour Delay Impact: +" << std::fixed << std::setprecision(2) << delay << " mins added to route to bypass closure.\n" << Colors::RESET;
                    }
                } else {
                    std::cout << Colors::RED << "No active path available to block.\n" << Colors::RESET;
                }
                break;
            }
            case 8: {
                graph.surgeRandomTraffic();
                std::cout << Colors::YELLOW << "\n[!] RUSH HOUR TRAFFIC SURGE INJECTED: Congestion multipliers scaled up across network.\n" << Colors::RESET;
                RouteResult res = Algorithms::runDijkstra(graph, sourceId, destinationId);
                printRouteResult(res);
                break;
            }
            case 9: {
                displayNodes(graph);
                break;
            }
            case 10: {
                std::cout << "Enter Source Hub ID (e.g. A1, B2, C3): ";
                std::string s;
                std::cin >> s;
                std::cout << "Enter Destination Hub ID (e.g. C8, A7, B4): ";
                std::string d;
                std::cin >> d;

                if (graph.getNode(s) && graph.getNode(d)) {
                    sourceId = s;
                    destinationId = d;
                    std::cout << Colors::GREEN << "[+] Endpoints updated to [" << s << "] -> [" << d << "]\n" << Colors::RESET;
                } else {
                    std::cout << Colors::RED << "[!] Invalid Hub IDs entered. Keeping previous endpoints.\n" << Colors::RESET;
                }
                break;
            }
            case 11: {
                graph = Graph::createDefaultGrid();
                std::cout << Colors::GREEN << "[+] Network reset to default conditions. All road closures cleared.\n" << Colors::RESET;
                break;
            }
            case 0: {
                running = false;
                std::cout << Colors::CYAN << "\nExiting Traffic Optimizer Engine. Goodbye!\n" << Colors::RESET;
                break;
            }
            default:
                std::cout << Colors::RED << "Invalid option. Please choose between 0 and 11.\n" << Colors::RESET;
                break;
        }
    }

    return 0;
}
