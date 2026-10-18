/**
 * Haversine formula to compute great-circle distance between two (lat, lng) points in kilometers.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371.0; // Earth's mean radius in km
  const toRad = Math.PI / 180.0;

  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const phi1 = lat1 * toRad;
  const phi2 = lat2 * toRad;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * 2D Spatial Bounding Box for QuadTree partitioning.
 */
class BoundingBox {
  constructor(minLat, maxLat, minLng, maxLng) {
    this.minLat = minLat;
    this.maxLat = maxLat;
    this.minLng = minLng;
    this.maxLng = maxLng;
  }

  contains(lat, lng) {
    return lat >= this.minLat && lat <= this.maxLat &&
           lng >= this.minLng && lng <= this.maxLng;
  }

  intersectsCircle(lat, lng, radiusKm) {
    // 1 deg latitude ≈ 111 km
    const latDelta = radiusKm / 111.0;
    const lngDelta = radiusKm / (111.0 * Math.cos(lat * Math.PI / 180.0));

    return !(this.minLat > lat + latDelta ||
             this.maxLat < lat - latDelta ||
             this.minLng > lng + lngDelta ||
             this.maxLng < lng - lngDelta);
  }
}

/**
 * QuadTree spatial index enabling O(log N) nearest-node snapping for GIS coordinates.
 */
export class SpatialIndex {
  constructor(boundary, capacity = 4) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;

    this.northWest = null;
    this.northEast = null;
    this.southWest = null;
    this.southEast = null;
  }

  static fromNodes(nodes) {
    if (!nodes || nodes.length === 0) {
      return new SpatialIndex(new BoundingBox(0, 1, 0, 1));
    }

    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    for (const node of nodes) {
      if (node.lat < minLat) minLat = node.lat;
      if (node.lat > maxLat) maxLat = node.lat;
      if (node.lng < minLng) minLng = node.lng;
      if (node.lng > maxLng) maxLng = node.lng;
    }

    // Add small buffer to boundary
    const pad = 0.01;
    const boundary = new BoundingBox(minLat - pad, maxLat + pad, minLng - pad, maxLng + pad);
    const tree = new SpatialIndex(boundary);

    for (const node of nodes) {
      tree.insert(node);
    }

    return tree;
  }

  subdivide() {
    const { minLat, maxLat, minLng, maxLng } = this.boundary;
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;

    this.northWest = new SpatialIndex(new BoundingBox(midLat, maxLat, minLng, midLng), this.capacity);
    this.northEast = new SpatialIndex(new BoundingBox(midLat, maxLat, midLng, maxLng), this.capacity);
    this.southWest = new SpatialIndex(new BoundingBox(minLat, midLat, minLng, midLng), this.capacity);
    this.southEast = new SpatialIndex(new BoundingBox(minLat, midLat, midLng, maxLng), this.capacity);

    this.divided = true;

    // Distribute existing points to children
    for (const p of this.points) {
      this.insertToChildren(p);
    }
    this.points = [];
  }

  insertToChildren(point) {
    return (this.northWest.insert(point) ||
            this.northEast.insert(point) ||
            this.southWest.insert(point) ||
            this.southEast.insert(point));
  }

  insert(point) {
    if (!this.boundary.contains(point.lat, point.lng)) {
      return false;
    }

    if (!this.divided) {
      if (this.points.length < this.capacity) {
        this.points.push(point);
        return true;
      }
      this.subdivide();
    }

    return this.insertToChildren(point);
  }

  /**
   * Finds nearest graph node to query point (lat, lng) in O(log N) average time.
   */
  findNearest(lat, lng) {
    let bestNode = null;
    let bestDistKm = Infinity;

    const search = (node) => {
      if (!node) return;

      // Prune if bounding box cannot contain a closer point
      if (bestNode !== null && !node.boundary.intersectsCircle(lat, lng, bestDistKm)) {
        return;
      }

      // Check points in leaf
      for (const p of node.points) {
        const d = calculateHaversineDistance(lat, lng, p.lat, p.lng);
        if (d < bestDistKm) {
          bestDistKm = d;
          bestNode = p;
        }
      }

      if (node.divided) {
        // Search quadrants ordered by proximity to target
        const children = [node.northWest, node.northEast, node.southWest, node.southEast];
        children.sort((a, b) => {
          const midLatA = (a.boundary.minLat + a.boundary.maxLat) / 2;
          const midLngA = (a.boundary.minLng + a.boundary.maxLng) / 2;
          const midLatB = (b.boundary.minLat + b.boundary.maxLat) / 2;
          const midLngB = (b.boundary.minLng + b.boundary.maxLng) / 2;
          return calculateHaversineDistance(lat, lng, midLatA, midLngA) -
                 calculateHaversineDistance(lat, lng, midLatB, midLngB);
        });

        for (const child of children) {
          search(child);
        }
      }
    };

    search(this);
    return { node: bestNode, distanceKm: bestDistKm };
  }
}
