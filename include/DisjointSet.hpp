#ifndef DISJOINT_SET_HPP
#define DISJOINT_SET_HPP

#include <string>
#include <unordered_map>
#include <vector>

/**
 * Disjoint Set Union (DSU / Union-Find) data structure in C++.
 * Employs Path Compression and Union by Rank for near O(1) amortized operations (Inverse Ackermann α(N)).
 */
class DisjointSet {
private:
    std::unordered_map<std::string, std::string> parent;
    std::unordered_map<std::string, int> rank;
    size_t componentCount;

public:
    DisjointSet() : componentCount(0) {}

    explicit DisjointSet(const std::vector<std::string>& elements) : componentCount(0) {
        for (const auto& elem : elements) {
            makeSet(elem);
        }
    }

    void makeSet(const std::string& elem) {
        if (parent.find(elem) == parent.end()) {
            parent[elem] = elem;
            rank[elem] = 0;
            componentCount++;
        }
    }

    std::string find(const std::string& elem) {
        if (parent.find(elem) == parent.end()) {
            makeSet(elem);
            return elem;
        }

        if (parent[elem] != elem) {
            // Path compression
            parent[elem] = find(parent[elem]);
        }
        return parent[elem];
    }

    bool unionSets(const std::string& a, const std::string& b) {
        std::string rootA = find(a);
        std::string rootB = find(b);

        if (rootA == rootB) {
            return false; // Already in the same set -> cycle detected
        }

        int rankA = rank[rootA];
        int rankB = rank[rootB];

        if (rankA < rankB) {
            parent[rootA] = rootB;
        } else if (rankA > rankB) {
            parent[rootB] = rootA;
        } else {
            parent[rootB] = rootA;
            rank[rootA]++;
        }

        componentCount--;
        return true;
    }

    bool connected(const std::string& a, const std::string& b) {
        return find(a) == find(b);
    }

    size_t getComponentCount() const {
        return componentCount;
    }
};

#endif // DISJOINT_SET_HPP
