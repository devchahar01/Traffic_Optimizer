#ifndef MIN_HEAP_HPP
#define MIN_HEAP_HPP

#include <vector>
#include <unordered_map>
#include <stdexcept>
#include <iostream>

/**
 * Custom Binary Min-Heap Priority Queue implementation in C++.
 * Guarantees O(log n) insertions, O(log n) extract-min, and O(log n) decrease-key
 * via an internal hash map tracking node indices.
 */
template <typename T, typename Priority = double>
class MinHeap {
public:
    struct Element {
        T id;
        Priority priority;
    };

private:
    std::vector<Element> heap;
    std::unordered_map<T, size_t> nodeIndexMap;

    size_t getParent(size_t i) const { return (i - 1) / 2; }
    size_t getLeftChild(size_t i) const { return 2 * i + 1; }
    size_t getRightChild(size_t i) const { return 2 * i + 2; }

    void swapElements(size_t i, size_t j) {
        Element temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;

        nodeIndexMap[heap[i].id] = i;
        nodeIndexMap[heap[j].id] = j;
    }

    void bubbleUp(size_t index) {
        size_t current = index;
        while (current > 0) {
            size_t parent = getParent(current);
            if (heap[current].priority < heap[parent].priority) {
                swapElements(current, parent);
                current = parent;
            } else {
                break;
            }
        }
    }

    void bubbleDown(size_t index) {
        size_t current = index;
        size_t length = heap.size();

        while (getLeftChild(current) < length) {
            size_t smallest = current;
            size_t left = getLeftChild(current);
            size_t right = getRightChild(current);

            if (left < length && heap[left].priority < heap[smallest].priority) {
                smallest = left;
            }

            if (right < length && heap[right].priority < heap[smallest].priority) {
                smallest = right;
            }

            if (smallest != current) {
                swapElements(current, smallest);
                current = smallest;
            } else {
                break;
            }
        }
    }

public:
    MinHeap() = default;

    bool isEmpty() const {
        return heap.empty();
    }

    size_t size() const {
        return heap.size();
    }

    bool contains(const T& id) const {
        return nodeIndexMap.find(id) != nodeIndexMap.end();
    }

    void push(const T& id, Priority priority) {
        if (contains(id)) {
            size_t idx = nodeIndexMap[id];
            if (priority < heap[idx].priority) {
                heap[idx].priority = priority;
                bubbleUp(idx);
            }
            return;
        }

        Element item{id, priority};
        heap.push_back(item);
        size_t index = heap.size() - 1;
        nodeIndexMap[id] = index;
        bubbleUp(index);
    }

    Element pop() {
        if (heap.empty()) {
            throw std::runtime_error("Cannot pop from an empty MinHeap.");
        }

        if (heap.size() == 1) {
            Element root = heap.back();
            heap.pop_back();
            nodeIndexMap.erase(root.id);
            return root;
        }

        Element root = heap[0];
        nodeIndexMap.erase(root.id);

        heap[0] = heap.back();
        heap.pop_back();
        nodeIndexMap[heap[0].id] = 0;

        bubbleDown(0);
        return root;
    }

    Element peek() const {
        if (heap.empty()) {
            throw std::runtime_error("Cannot peek into an empty MinHeap.");
        }
        return heap[0];
    }
};

#endif // MIN_HEAP_HPP
