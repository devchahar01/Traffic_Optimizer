/**
 * High-performance Binary Min-Heap Priority Queue for Dijkstra and A*.
 * Guarantees O(log n) insertions and extractions, with index tracking for efficient updates.
 */
export class MinHeap {
  constructor() {
    this.heap = [];
    this.nodeIndexMap = new Map(); // nodeId -> index in heap
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  getParentIndex(i) {
    return Math.floor((i - 1) / 2);
  }

  getLeftChildIndex(i) {
    return 2 * i + 1;
  }

  getRightChildIndex(i) {
    return 2 * i + 2;
  }

  swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;

    this.nodeIndexMap.set(this.heap[i].id, i);
    this.nodeIndexMap.set(this.heap[j].id, j);
  }

  push(id, priority, data = {}) {
    // If element already exists, update priority if lower
    if (this.nodeIndexMap.has(id)) {
      const idx = this.nodeIndexMap.get(id);
      if (priority < this.heap[idx].priority) {
        this.heap[idx].priority = priority;
        this.heap[idx].data = data;
        this.bubbleUp(idx);
      }
      return;
    }

    const item = { id, priority, data };
    this.heap.push(item);
    const index = this.heap.length - 1;
    this.nodeIndexMap.set(id, index);
    this.bubbleUp(index);
  }

  pop() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) {
      const item = this.heap.pop();
      this.nodeIndexMap.delete(item.id);
      return item;
    }

    const root = this.heap[0];
    this.nodeIndexMap.delete(root.id);

    const last = this.heap.pop();
    this.heap[0] = last;
    this.nodeIndexMap.set(last.id, 0);

    this.bubbleDown(0);
    return root;
  }

  bubbleUp(index) {
    let current = index;
    while (current > 0) {
      const parent = this.getParentIndex(current);
      if (this.heap[current].priority < this.heap[parent].priority) {
        this.swap(current, parent);
        current = parent;
      } else {
        break;
      }
    }
  }

  bubbleDown(index) {
    let current = index;
    const length = this.heap.length;

    while (this.getLeftChildIndex(current) < length) {
      let smallest = current;
      const left = this.getLeftChildIndex(current);
      const right = this.getRightChildIndex(current);

      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }

      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }

      if (smallest !== current) {
        this.swap(current, smallest);
        current = smallest;
      } else {
        break;
      }
    }
  }

  contains(id) {
    return this.nodeIndexMap.has(id);
  }

  getSnapshot() {
    return this.heap.map(item => ({ id: item.id, priority: item.priority }));
  }
}
