/**
 * Disjoint Set Union (DSU / Union-Find) data structure.
 * Employs Path Compression and Union by Rank for near O(1) amortized operations (Inverse Ackermann α(N)).
 */
export class DisjointSet {
  constructor(elements = []) {
    this.parent = new Map();
    this.rank = new Map();
    this.componentsCount = 0;

    for (const elem of elements) {
      this.makeSet(elem);
    }
  }

  makeSet(elem) {
    if (!this.parent.has(elem)) {
      this.parent.set(elem, elem);
      this.rank.set(elem, 0);
      this.componentsCount++;
    }
  }

  find(elem) {
    if (!this.parent.has(elem)) {
      this.makeSet(elem);
      return elem;
    }

    if (this.parent.get(elem) !== elem) {
      // Path compression: points directly to root representative
      this.parent.set(elem, this.find(this.parent.get(elem)));
    }
    return this.parent.get(elem);
  }

  union(elemA, elemB) {
    const rootA = this.find(elemA);
    const rootB = this.find(elemB);

    if (rootA === rootB) {
      return false; // Cycle detected: both already in same component
    }

    const rankA = this.rank.get(rootA) || 0;
    const rankB = this.rank.get(rootB) || 0;

    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
    }

    this.componentsCount--;
    return true;
  }

  connected(elemA, elemB) {
    return this.find(elemA) === this.find(elemB);
  }

  getComponentCount() {
    return this.componentsCount;
  }
}
