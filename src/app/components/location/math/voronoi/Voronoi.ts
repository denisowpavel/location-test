

class CircleEvent {
  arc: any;
  rbLeft: any;
  rbNext: any;
  rbParent: any;
  rbPrevious: any;
  rbRed: boolean;
  rbRight: any;
  site: any;
  x: number;
  y: number;
  ycenter: number;

  constructor() {
    this.arc = null;
    this.rbLeft = null;
    this.rbNext = null;
    this.rbParent = null;
    this.rbPrevious = null;
    this.rbRed = false;
    this.rbRight = null;
    this.site = null;
    this.x = this.y = this.ycenter = 0;
  }
}

class Voronoi {
  vertices: any;
  edges: any;
  cells: any;
  toRecycle: any;
  beachsectionJunkyard: any[];
  circleEventJunkyard: any[];
  vertexJunkyard: any[];
  edgeJunkyard: any[];
  cellJunkyard: any[];
  site: any[];
  Halfedge: typeof Halfedge;

  constructor() {
    this.vertices = null;
    this.edges = null;
    this.cells = null;
    this.toRecycle = null;
    this.beachsectionJunkyard = [];
    this.circleEventJunkyard = [];
    this.vertexJunkyard = [];
    this.edgeJunkyard = [];
    this.cellJunkyard = [];
  }

  constructor(site: any) {
    this.site = site;
  }
  reset(): void {
    if (!this.beachline) {
      this.beachline = new this.RBTree();
    }
    // Move leftover beachsections to the beachsection junkyard.
    if (this.beachline.root) {
      let beachsection = this.beachline.getFirst(this.beachline.root);
      while (beachsection) {
        this.beachsectionJunkyard.push(beachsection); // mark for reuse
        beachsection = beachsection.rbNext;
      }
    }
    this.beachline.root = null;
    if (!this.circleEvents) {
      this.circleEvents = new this.RBTree();
    }
    this.circleEvents.root = this.firstCircleEvent = null;
    this.vertices = [];
    this.edges = [];
    this.cells = [];
  }

  equalWithEpsilon(a: number, b: number): boolean {
    return this.abs(a - b) < 1e-9;
  }
  greaterThanWithEpsilon(a: number, b: number): boolean {
    return a - b > 1e-9;
  }
  greaterThanOrEqualWithEpsilon(a: number, b: number): boolean {
    return b - a < 1e-9;
  }
  lessThanWithEpsilon(a: number, b: number): boolean {
    return b - a > 1e-9;
  }
  lessThanOrEqualWithEpsilon(a: number, b: number): boolean {
    return a - b < 1e-9;
  }
}

class RBTree {
  root: Node | null;

  constructor() {
    this.root = null;
  }

  rbInsertSuccessor(node: Node, successor: Node) {
    let parent: Node | null;
    if (node) {
      successor.rbPrevious = node;
      successor.rbNext = node.rbNext;
      if (node.rbNext) {
        node.rbNext.rbPrevious = successor;
      }
      node.rbNext = successor;
      if (node.rbRight) {
        node = node.rbRight;
        while (node.rbLeft) {
          node = node.rbLeft;
        }
        node.rbLeft = successor;
      } else {
        node.rbRight = successor;
      }
      parent = node;
    } else if (this.root) {
      node = this.getFirst(this.root);
      successor.rbPrevious = null;
      successor.rbNext = node;
      node.rbPrevious = successor;
      node.rbLeft = successor;
      parent = node;
    } else {
      successor.rbPrevious = successor.rbNext = null;
      this.root = successor;
      parent = null;
    }
    successor.rbLeft = successor.rbRight = null;
    successor.rbParent = parent;
    successor.rbRed = true;
    let grandpa: Node | null, uncle: Node | null;
    node = successor;
    while (parent && parent.rbRed) {
      grandpa = parent.rbParent;
      if (parent === grandpa.rbLeft) {
        uncle = grandpa.rbRight;
        if (uncle && uncle.rbRed) {
          parent.rbRed = uncle.rbRed = false;
          grandpa.rbRed = true;
          node = grandpa;
        } else {
          if (node === parent.rbRight) {
            this.rbRotateLeft(parent);
            node = parent;
            parent = node.rbParent;
          }
          parent.rbRed = false;
          grandpa.rbRed = true;
          this.rbRotateRight(grandpa);
        }
      } else {
        uncle = grandpa.rbLeft;
        if (uncle && uncle.rbRed) {
          parent.rbRed = uncle.rbRed = false;
          grandpa.rbRed = true;
          node = grandpa;
        } else {
          if (node === parent.rbLeft) {
            this.rbRotateRight(parent);
            node = parent;
            parent = node.rbParent;
          }
          parent.rbRed = false;
          grandpa.rbRed = true;
          this.rbRotateLeft(grandpa);
        }
      }
      parent = node.rbParent;
    }
    this.root.rbRed = false;
  }

  rbRemoveNode(node: Node) {
    if (node.rbNext) {
      node.rbNext.rbPrevious = node.rbPrevious;
    }
    if (node.rbPrevious) {
      node.rbPrevious.rbNext = node.rbNext;
    }
    node.rbNext = node.rbPrevious = null;
    const parent = node.rbParent;
    const left = node.rbLeft;
    const right = node.rbRight;
    let next: Node | null;
    if (!left) {
      next = right;
    } else if (!right) {
      next = left;
    } else {
      next = this.getFirst(right);
    }
    if (parent) {
      if (parent.rbLeft === node) {
        parent.rbLeft = next;
      } else {
        parent.rbRight = next;
      }
    } else {
      this.root = next;
    }
    let isRed: boolean;
    if (left && right) {
      isRed = next.rbRed;
      next.rbRed = node.rbRed;
      next.rbLeft = left;
      left.rbParent = next;
      if (next !== right) {
        let parent = next.rbParent;
        next.rbParent = node.rbParent;
        node = next.rbRight;
        parent.rbLeft = node;
        next.rbRight = right;
        right.rbParent = next;
      } else {
        next.rbParent = parent;
        parent = next;
        node = next.rbRight;
      }
    } else {
      isRed = node.rbRed;
      node = next;
    }
    if (node) {
      node.rbParent = parent;
    }
    if (isRed) {
      return;
    }
    if (node && node.rbRed) {
      node.rbRed = false;
      return;
    }
    let sibling: Node | null;
    do {
      if (node === this.root) {
        break;
      }
      if (node === parent.rbLeft) {
        sibling = parent.rbRight;
        if (sibling.rbRed) {
          sibling.rbRed = false;
          parent.rbRed = true;
          this.rbRotateLeft(parent);
          sibling = parent.rbRight;
        }
        if (
          (sibling.rbLeft && sibling.rbLeft.rbRed) ||
          (sibling.rbRight && sibling.rbRight.rbRed)
        ) {
          if (!sibling.rbRight || !sibling.rbRight.rbRed) {
            sibling.rbLeft.rbRed = false;
            sibling.rbRed = true;
            this.rbRotateRight(sibling);
            sibling = parent.rbRight;
          }
          sibling.rbRed = parent.rbRed;
          parent.rbRed = sibling.rbRight.rbRed = false;
          this.rbRotateLeft(parent);
          node = this.root;
          break;
        }
      } else {
        sibling = parent.rbLeft;
        if (sibling.rbRed) {
          sibling.rbRed = false;
          parent.rbRed = true;
          this.rbRotateRight(parent);
          sibling = parent.rbLeft;
        }
        if (
          (sibling.rbLeft && sibling.rbLeft.rbRed) ||
          (sibling.rbRight && sibling.rbRight.rbRed)
        ) {
          if (!sibling.rbLeft || !sibling.rbLeft.rbRed) {
            sibling.rbRight.rbRed = false;
            sibling.rbRed = true;
            this.rbRotateLeft(sibling);
            sibling = parent.rbLeft;
          }
          sibling.rbRed = parent.rbRed;
          parent.rbRed = sibling.rbLeft.rbRed = false;
          this.rbRotateRight(parent);
          node = this.root;
          break;
        }
      }
      sibling.rbRed = true;
      node = parent;
      parent = parent.rbParent;
    } while (!node.rbRed);
    if (node) {
      node.rbRed = false;
    }
  }

  rbRotateLeft(node: Node) {
    const p = node;
    const q = node.rbRight;
    const parent = p.rbParent;
    if (parent) {
      if (parent.rbLeft === p) {
        parent.rbLeft = q;
      } else {
        parent.rbRight = q;
      }
    } else {
      this.root = q;
    }
    q.rbParent = parent;
    p.rbParent = q;
    p.rbRight = q.rbLeft;
    if (p.rbRight) {
      p.rbRight.rbParent = p;
    }
    q.rbLeft = p;
  }

  rbRotateRight(node: Node) {
    const p = node;
    const q = node.rbLeft;
    const parent = p.rbParent;
    if (parent) {
      if (parent.rbLeft === p) {
        parent.rbLeft = q;
      } else {
        parent.rbRight = q;
      }
    } else {
      this.root = q;
    }
    q.rbParent = parent;
    p.rbParent = q;
    p.rbLeft = q.rbRight;
    if (p.rbLeft) {
      p.rbLeft.rbParent = p;
    }
    q.rbRight = p;
  }

  getFirst(node: Node) {
    while (node.rbLeft) {
      node = node.rbLeft;
    }
    return node;
  }

  getLast(node: Node) {
    while (node.rbRight) {
      node = node.rbRight;
    }
    return node;
  }

  Vertex(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  Edge(lSite: any, rSite: any) {
    this.lSite = lSite;
    this.rSite = rSite;
    this.va = this.vb = null;
  }

  createHalfedge(edge: Edge, lSite: Site, rSite: Site | null): Halfedge {
    return new this.Halfedge(edge, lSite, rSite);
  }
}

// ---------------------------------------------------------------------------
// Cell methods

class Cell {
  site: any;
  halfedges: any[];
  closeMe: boolean;

  constructor(site: any) {
    this.site = site;
    this.halfedges = [];
    this.closeMe = false;
  }

  init(site: any) {
    this.site = site;
    this.halfedges = [];
    this.closeMe = false;
    return this;
  }

  prepareHalfedges() {
    const halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let edge;

    while (iHalfedge--) {
      edge = halfedges[iHalfedge].edge;
      if (!edge.vb || !edge.va) {
        halfedges.splice(iHalfedge, 1);
      }
    }

    halfedges.sort((a, b) => b.angle - a.angle);
    return halfedges.length;
  }

  getNeighborIds() {
    const neighbors = [];
    let iHalfedge = this.halfedges.length;
    let edge;

    while (iHalfedge--) {
      edge = this.halfedges[iHalfedge].edge;
      if (edge.lSite !== null && edge.lSite.voronoiId != this.site.voronoiId) {
        neighbors.push(edge.lSite.voronoiId);
      } else if (
        edge.rSite !== null &&
        edge.rSite.voronoiId != this.site.voronoiId
      ) {
        neighbors.push(edge.rSite.voronoiId);
      }
    }

    return neighbors;
  }

  getBbox() {
    const halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let xmin = Infinity;
    let ymin = Infinity;
    let xmax = -Infinity;
    let ymax = -Infinity;
    let v, vx, vy;

    while (iHalfedge--) {
      v = halfedges[iHalfedge].getStartpoint();
      vx = v.x;
      vy = v.y;
      if (vx < xmin) {
        xmin = vx;
      }
      if (vy < ymin) {
        ymin = vy;
      }
      if (vx > xmax) {
        xmax = vx;
      }
      if (vy > ymax) {
        ymax = vy;
      }
    }

    return {
      x: xmin,
      y: ymin,
      width: xmax - xmin,
      height: ymax - ymin,
    };
  }

  pointIntersection(x: number, y: number) {
    const halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let halfedge;
    let p0, p1, r;

    while (iHalfedge--) {
      halfedge = halfedges[iHalfedge];
      p0 = halfedge.getStartpoint();
      p1 = halfedge.getEndpoint();
      r = (y - p0.y) * (p1.x - p0.x) - (x - p0.x) * (p1.y - p0.y);

      if (!r) {
        return 0;
      }
      if (r > 0) {
        return -1;
      }
    }

    return 1;
  }
}

class Halfedge {
  site: Site;
  edge: Edge;
  angle: number;

  constructor(edge: Edge, lSite: Site, rSite: Site | null) {
    this.site = lSite;
    this.edge = edge;
    if (rSite) {
      this.angle = Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x);
    } else {
      const va = edge.va;
      const vb = edge.vb;
      this.angle =
        edge.lSite === lSite
          ? Math.atan2(vb.x - va.x, va.y - vb.y)
          : Math.atan2(va.x - vb.x, vb.y - va.y);
    }
  }

  getStartpoint(): Site {
    return this.edge.lSite === this.site ? this.edge.va : this.edge.vb;
  }

  getEndpoint(): Site {
    return this.edge.lSite === this.site ? this.edge.vb : this.edge.va;
  }

  createVertex(x: number, y: number): Vertex {
    let v: Vertex | undefined = this.vertexJunkyard.pop();
    if (!v) {
      v = { x, y };
    } else {
      v.x = x;
      v.y = y;
    }
    this.vertices.push(v);
    return v;
  }

  createEdge(
    lSite: any,
    rSite: any,
    va: Vertex | null,
    vb: Vertex | null
  ): Edge {
    let edge: Edge | undefined = this.edgeJunkyard.pop();
    if (!edge) {
      edge = { lSite, rSite, va: null, vb: null };
    } else {
      edge.lSite = lSite;
      edge.rSite = rSite;
      edge.va = edge.vb = null;
    }

    this.edges.push(edge);
    if (va) {
      this.setEdgeStartpoint(edge, lSite, rSite, va);
    }
    if (vb) {
      this.setEdgeEndpoint(edge, lSite, rSite, vb);
    }
    this.cells[lSite.voronoiId].halfedges.push(
      this.createHalfedge(edge, lSite, rSite)
    );
    this.cells[rSite.voronoiId].halfedges.push(
      this.createHalfedge(edge, rSite, lSite)
    );
    return edge;
  }

  createBorderEdge(lSite: any, va: Vertex, vb: Vertex): Edge {
    let edge: Edge | undefined = this.edgeJunkyard.pop();
    if (!edge) {
      edge = { lSite, rSite: null, va, vb };
    } else {
      edge.lSite = lSite;
      edge.rSite = null;
    }
    edge.va = va;
    edge.vb = vb;
    this.edges.push(edge);
    return edge;
  }

  setEdgeStartpoint(edge: Edge, lSite: any, rSite: any, vertex: Vertex) {
    if (!edge.va && !edge.vb) {
      edge.va = vertex;
      edge.lSite = lSite;
      edge.rSite = rSite;
    } else if (edge.lSite === rSite) {
      edge.vb = vertex;
    } else {
      edge.va = vertex;
    }
  }

  setEdgeEndpoint(edge: Edge, lSite: any, rSite: any, vertex: Vertex) {
    this.setEdgeStartpoint(edge, rSite, lSite, vertex);
  }

  createBeachsection(site: Site) {
    let beachsection: any = this.beachsectionJunkyard.pop();
    if (!beachsection) {
      beachsection = {};
    }
    beachsection.site = site;
    return beachsection;
  }

  leftBreakPoint(arc: any, directrix: number): number {
    const site = arc.site;
    const rfocx = site.x;
    const rfocy = site.y;
    const pby2 = rfocy - directrix;
    if (!pby2) {
      return rfocx;
    }
    const lArc = arc.rbPrevious;
    if (!lArc) {
      return -Infinity;
    }
    const lfocx = lArc.site.x;
    const lfocy = lArc.site.y;
    const plby2 = lfocy - directrix;
    if (!plby2) {
      return lfocx;
    }
    const hl = lfocx - rfocx;
    const aby2 = 1 / pby2 - 1 / plby2;
    const b = hl / plby2;
    if (aby2) {
      return (
        (-b +
          Math.sqrt(
            b * b -
              2 *
                aby2 *
                ((hl * hl) / (-2 * plby2) -
                  lfocy +
                  plby2 / 2 +
                  rfocy -
                  pby2 / 2)
          )) /
          aby2 +
        rfocx
      );
    }
    return (rfocx + lfocx) / 2;
  }

  rightBreakPoint(arc: any, directrix: number): number {
    const rArc = arc.rbNext;
    if (rArc) {
      return this.leftBreakPoint(rArc, directrix);
    }
    const site = arc.site;
    return site.y === directrix ? site.x : Infinity;
  }

  detachBeachsection(beachsection: any): void {
    this.detachCircleEvent(beachsection);
    this.beachline.rbRemoveNode(beachsection);
    this.beachsectionJunkyard.push(beachsection);
  }

  removeBeachsection(beachsection: any): void {
    const circle = beachsection.circleEvent;
    const x = circle.x;
    const y = circle.ycenter;
    const vertex = this.createVertex(x, y);
    const previous = beachsection.rbPrevious;
    const next = beachsection.rbNext;
    const disappearingTransitions = [beachsection];
    const abs_fn = Math.abs;

    this.detachBeachsection(beachsection);

    let lArc = previous;
    while (
      lArc.circleEvent &&
      abs_fn(x - lArc.circleEvent.x) < 1e-9 &&
      abs_fn(y - lArc.circleEvent.ycenter) < 1e-9
    ) {
      previous = lArc.rbPrevious;
      disappearingTransitions.unshift(lArc);
      this.detachBeachsection(lArc);
      lArc = previous;
    }
    disappearingTransitions.unshift(lArc);
    this.detachCircleEvent(lArc);

    let rArc = next;
    while (
      rArc.circleEvent &&
      abs_fn(x - rArc.circleEvent.x) < 1e-9 &&
      abs_fn(y - rArc.circleEvent.ycenter) < 1e-9
    ) {
      next = rArc.rbNext;
      disappearingTransitions.push(rArc);
      this.detachBeachsection(rArc);
      rArc = next;
    }
    disappearingTransitions.push(rArc);
    this.detachCircleEvent(rArc);

    const nArcs = disappearingTransitions.length;
    for (let iArc = 1; iArc < nArcs; iArc++) {
      rArc = disappearingTransitions[iArc];
      lArc = disappearingTransitions[iArc - 1];
      this.setEdgeStartpoint(rArc.edge, lArc.site, rArc.site, vertex);
    }

    lArc = disappearingTransitions[0];
    rArc = disappearingTransitions[nArcs - 1];
    rArc.edge = this.createEdge(lArc.site, rArc.site, undefined, vertex);

    this.attachCircleEvent(lArc);
    this.attachCircleEvent(rArc);
  }

  addBeachsection(site: any): void {
    const x = site.x;
    const directrix = site.y;

    let lArc, rArc, dxl, dxr;
    let node = this.beachline.root;

    while (node) {
      dxl = this.leftBreakPoint(node, directrix) - x;
      if (dxl > 1e-9) {
        node = node.rbLeft;
      } else {
        dxr = x - this.rightBreakPoint(node, directrix);
        if (dxr > 1e-9) {
          if (!node.rbRight) {
            lArc = node;
            break;
          }
          node = node.rbRight;
        } else {
          if (dxl > -1e-9) {
            lArc = node.rbPrevious;
            rArc = node;
          } else if (dxr > -1e-9) {
            lArc = node;
            rArc = node.rbNext;
          } else {
            lArc = rArc = node;
          }
          break;
        }
      }
    }

    const newArc = this.createBeachsection(site);
    this.beachline.rbInsertSuccessor(lArc, newArc);

    if (!lArc && !rArc) {
      return;
    }

    if (lArc === rArc) {
      this.detachCircleEvent(lArc);
      rArc = this.createBeachsection(lArc.site);
      this.beachline.rbInsertSuccessor(newArc, rArc);
      newArc.edge = rArc.edge = this.createEdge(lArc.site, newArc.site);
      this.attachCircleEvent(lArc);
      this.attachCircleEvent(rArc);
      return;
    }

    if (lArc && !rArc) {
      newArc.edge = this.createEdge(lArc.site, newArc.site);
      return;
    }

    if (!lArc && rArc) {
      throw new Error("Voronoi.addBeachsection(): What is this I don't even");
    }

    this.detachCircleEvent(lArc);
    this.detachCircleEvent(rArc);

    const lSite = lArc.site;
    const ax = lSite.x;
    const ay = lSite.y;
    const bx = site.x - ax;
    const by = site.y - ay;
    const rSite = rArc.site;
    const cx = rSite.x - ax;
    const cy = rSite.y - ay;
    const d = 2 * (bx * cy - by * cx);
    const hb = bx * bx + by * by;
    const hc = cx * cx + cy * cy;
    const vertex = this.createVertex(
      (cy * hb - by * hc) / d + ax,
      (bx * hc - cx * hb) / d + ay
    );

    this.setEdgeStartpoint(rArc.edge, lSite, rSite, vertex);

    newArc.edge = this.createEdge(lSite, site, undefined, vertex);
    rArc.edge = this.createEdge(site, rSite, undefined, vertex);

    this.attachCircleEvent(lArc);
    this.attachCircleEvent(rArc);
  }
  attachCircleEvent(arc: any) {
    var lArc = arc.rbPrevious,
      rArc = arc.rbNext;
    if (!lArc || !rArc) {
      return;
    } // does that ever happen?
    var lSite = lArc.site,
      cSite = arc.site,
      rSite = rArc.site;

    // If site of left beachsection is same as site of
    // right beachsection, there can't be convergence
    if (lSite === rSite) {
      return;
    }

    // Find the circumscribed circle for the three sites associated
    // with the beachsection triplet.
    // rhill 2011-05-26: It is more efficient to calculate in-place
    // rather than getting the resulting circumscribed circle from an
    // object returned by calling Voronoi.circumcircle()
    // http://mathforum.org/library/drmath/view/55002.html
    // Except that I bring the origin at cSite to simplify calculations.
    // The bottom-most part of the circumcircle is our Fortune 'circle
    // event', and its center is a vertex potentially part of the final
    // Voronoi diagram.
    var bx = cSite.x,
      by = cSite.y,
      ax = lSite.x - bx,
      ay = lSite.y - by,
      cx = rSite.x - bx,
      cy = rSite.y - by;

    // If points l->c->r are clockwise, then center beach section does not
    // collapse, hence it can't end up as a vertex (we reuse 'd' here, which
    // sign is reverse of the orientation, hence we reverse the test.
    // http://en.wikipedia.org/wiki/Curve_orientation#Orientation_of_a_simple_polygon
    // rhill 2011-05-21: Nasty finite precision error which caused circumcircle() to
    // return infinites: 1e-12 seems to fix the problem.
    var d = 2 * (ax * cy - ay * cx);
    if (d >= -2e-12) {
      return;
    }

    var ha = ax * ax + ay * ay,
      hc = cx * cx + cy * cy,
      x = (cy * ha - ay * hc) / d,
      y = (ax * hc - cx * ha) / d,
      ycenter = y + by;

    // Important: ybottom should always be under or at sweep, so no need
    // to waste CPU cycles by checking

    // recycle circle event object if possible
    var circleEvent = this.circleEventJunkyard.pop();
    if (!circleEvent) {
      circleEvent = new CircleEvent();
    }
    circleEvent.arc = arc;
    circleEvent.site = cSite;
    circleEvent.x = x + bx;
    circleEvent.y = ycenter + this.sqrt(x * x + y * y); // y bottom
    circleEvent.ycenter = ycenter;
    arc.circleEvent = circleEvent;

    // find insertion point in RB-tree: circle events are ordered from
    // smallest to largest
    var predecessor = null,
      node = this.circleEvents.root;
    while (node) {
      if (
        circleEvent.y < node.y ||
        (circleEvent.y === node.y && circleEvent.x <= node.x)
      ) {
        if (node.rbLeft) {
          node = node.rbLeft;
        } else {
          predecessor = node.rbPrevious;
          break;
        }
      } else {
        if (node.rbRight) {
          node = node.rbRight;
        } else {
          predecessor = node;
          break;
        }
      }
    }
    this.circleEvents.rbInsertSuccessor(predecessor, circleEvent);
    if (!predecessor) {
      this.firstCircleEvent = circleEvent;
    }
  }
  detachCircleEvent(arc: any) {
    var circleEvent = arc.circleEvent;
    if (circleEvent) {
      if (!circleEvent.rbPrevious) {
        this.firstCircleEvent = circleEvent.rbNext;
      }
      this.circleEvents.rbRemoveNode(circleEvent); // remove from RB-tree
      this.circleEventJunkyard.push(circleEvent);
      arc.circleEvent = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Diagram completion methods

  // connect dangling edges (not if a cursory test tells us
  // it is not going to be visible.
  // return value:
  //   false: the dangling endpoint couldn't be connected
  //   true: the dangling endpoint could be connected
  connectEdge(edge: any, bbox: any) {
    // skip if end point already connected
    var vb = edge.vb;
    if (!!vb) {
      return true;
    }

    // make local copy for performance purpose
    var va = edge.va,
      xl = bbox.xl,
      xr = bbox.xr,
      yt = bbox.yt,
      yb = bbox.yb,
      lSite = edge.lSite,
      rSite = edge.rSite,
      lx = lSite.x,
      ly = lSite.y,
      rx = rSite.x,
      ry = rSite.y,
      fx = (lx + rx) / 2,
      fy = (ly + ry) / 2,
      fm,
      fb;

    // if we reach here, this means cells which use this edge will need
    // to be closed, whether because the edge was removed, or because it
    // was connected to the bounding box.
    this.cells[lSite.voronoiId].closeMe = true;
    this.cells[rSite.voronoiId].closeMe = true;

    // get the line equation of the bisector if line is not vertical
    if (ry !== ly) {
      fm = (lx - rx) / (ry - ly);
      fb = fy - fm * fx;
    }

    // remember, direction of line (relative to left site):
    // upward: left.x < right.x
    // downward: left.x > right.x
    // horizontal: left.x == right.x
    // upward: left.x < right.x
    // rightward: left.y < right.y
    // leftward: left.y > right.y
    // vertical: left.y == right.y

    // depending on the direction, find the best side of the
    // bounding box to use to determine a reasonable start point

    // special case: vertical line
    if (fm === undefined) {
      // doesn't intersect with viewport
      if (fx < xl || fx >= xr) {
        return false;
      }
      // downward
      if (lx > rx) {
        if (!va) {
          va = this.createVertex(fx, yt);
        } else if (va.y >= yb) {
          return false;
        }
        vb = this.createVertex(fx, yb);
      }
      // upward
      else {
        if (!va) {
          va = this.createVertex(fx, yb);
        } else if (va.y < yt) {
          return false;
        }
        vb = this.createVertex(fx, yt);
      }
    }
    // closer to vertical than horizontal, connect start point to the
    // top or bottom side of the bounding box
    else if (fm < -1 || fm > 1) {
      // downward
      if (lx > rx) {
        if (!va) {
          va = this.createVertex((yt - fb) / fm, yt);
        } else if (va.y >= yb) {
          return false;
        }
        vb = this.createVertex((yb - fb) / fm, yb);
      }
      // upward
      else {
        if (!va) {
          va = this.createVertex((yb - fb) / fm, yb);
        } else if (va.y < yt) {
          return false;
        }
        vb = this.createVertex((yt - fb) / fm, yt);
      }
    }
    // closer to horizontal than vertical, connect start point to the
    // left or right side of the bounding box
    else {
      // rightward
      if (ly < ry) {
        if (!va) {
          va = this.createVertex(xl, fm * xl + fb);
        } else if (va.x >= xr) {
          return false;
        }
        vb = this.createVertex(xr, fm * xr + fb);
      }
      // leftward
      else {
        if (!va) {
          va = this.createVertex(xr, fm * xr + fb);
        } else if (va.x < xl) {
          return false;
        }
        vb = this.createVertex(xl, fm * xl + fb);
      }
    }
    edge.va = va;
    edge.vb = vb;

    return true;
  }

  // line-clipping code taken from:
  //   Liang-Barsky function by Daniel White
  //   http://www.skytopia.com/project/articles/compsci/clipping.html
  // Thanks!
  // A bit modified to minimize code paths
  clipEdge(edge: any, bbox: any) {
    var ax = edge.va.x,
      ay = edge.va.y,
      bx = edge.vb.x,
      by = edge.vb.y,
      t0 = 0,
      t1 = 1,
      dx = bx - ax,
      dy = by - ay;
    // left
    var q = ax - bbox.xl;
    if (dx === 0 && q < 0) {
      return false;
    }
    var r = -q / dx;
    if (dx < 0) {
      if (r < t0) {
        return false;
      }
      if (r < t1) {
        t1 = r;
      }
    } else if (dx > 0) {
      if (r > t1) {
        return false;
      }
      if (r > t0) {
        t0 = r;
      }
    }
    // right
    q = bbox.xr - ax;
    if (dx === 0 && q < 0) {
      return false;
    }
    r = q / dx;
    if (dx < 0) {
      if (r > t1) {
        return false;
      }
      if (r > t0) {
        t0 = r;
      }
    } else if (dx > 0) {
      if (r < t0) {
        return false;
      }
      if (r < t1) {
        t1 = r;
      }
    }
    // top
    q = ay - bbox.yt;
    if (dy === 0 && q < 0) {
      return false;
    }
    r = -q / dy;
    if (dy < 0) {
      if (r < t0) {
        return false;
      }
      if (r < t1) {
        t1 = r;
      }
    } else if (dy > 0) {
      if (r > t1) {
        return false;
      }
      if (r > t0) {
        t0 = r;
      }
    }
    // bottom
    q = bbox.yb - ay;
    if (dy === 0 && q < 0) {
      return false;
    }
    r = q / dy;
    if (dy < 0) {
      if (r > t1) {
        return false;
      }
      if (r > t0) {
        t0 = r;
      }
    } else if (dy > 0) {
      if (r < t0) {
        return false;
      }
      if (r < t1) {
        t1 = r;
      }
    }

    // if we reach this point, Voronoi edge is within bbox

    // if t0 > 0, va needs to change
    // rhill 2011-06-03: we need to create a new vertex rather
    // than modifying the existing one, since the existing
    // one is likely shared with at least another edge
    if (t0 > 0) {
      edge.va = this.createVertex(ax + t0 * dx, ay + t0 * dy);
    }

    // if t1 < 1, vb needs to change
    // rhill 2011-06-03: we need to create a new vertex rather
    // than modifying the existing one, since the existing
    // one is likely shared with at least another edge
    if (t1 < 1) {
      edge.vb = this.createVertex(ax + t1 * dx, ay + t1 * dy);
    }

    // va and/or vb were clipped, thus we will need to close
    // cells which use this edge.
    if (t0 > 0 || t1 < 1) {
      this.cells[edge.lSite.voronoiId].closeMe = true;
      this.cells[edge.rSite.voronoiId].closeMe = true;
    }

    return true;
  }

  // Connect/cut edges at bounding box
  clipEdges(bbox: any) {
    // connect all dangling edges to bounding box
    // or get rid of them if it can't be done
    var edges = this.edges,
      iEdge = edges.length,
      edge,
      abs_fn = Math.abs;

    // iterate backward so we can splice safely
    while (iEdge--) {
      edge = edges[iEdge];
      // edge is removed if:
      //   it is wholly outside the bounding box
      //   it is looking more like a point than a line
      if (
        !this.connectEdge(edge, bbox) ||
        !this.clipEdge(edge, bbox) ||
        (abs_fn(edge.va.x - edge.vb.x) < 1e-9 &&
          abs_fn(edge.va.y - edge.vb.y) < 1e-9)
      ) {
        edge.va = edge.vb = null;
        edges.splice(iEdge, 1);
      }
    }
  }

  // Close the cells.
  // The cells are bound by the supplied bounding box.
  // Each cell refers to its associated site, and a list
  // of halfedges ordered counterclockwise.
  closeCells(bbox: any) {
    var xl = bbox.xl,
      xr = bbox.xr,
      yt = bbox.yt,
      yb = bbox.yb,
      cells = this.cells,
      iCell = cells.length,
      cell,
      iLeft,
      halfedges,
      nHalfedges,
      edge,
      va,
      vb,
      vz,
      lastBorderSegment,
      abs_fn = Math.abs;

    while (iCell--) {
      cell = cells[iCell];
      // prune, order halfedges counterclockwise, then add missing ones
      // required to close cells
      if (!cell.prepareHalfedges()) {
        continue;
      }
      if (!cell.closeMe) {
        continue;
      }
      // find first 'unclosed' point.
      // an 'unclosed' point will be the end point of a halfedge which
      // does not match the start point of the following halfedge
      halfedges = cell.halfedges;
      nHalfedges = halfedges.length;
      // special case: only one site, in which case, the viewport is the cell
      // ...

      // all other cases
      iLeft = 0;
      while (iLeft < nHalfedges) {
        va = halfedges[iLeft].getEndpoint();
        vz = halfedges[(iLeft + 1) % nHalfedges].getStartpoint();
        // if end point is not equal to start point, we need to add the missing
        // halfedge(s) to close the cell
        if (abs_fn(va.x - vz.x) >= 1e-9 || abs_fn(va.y - vz.y) >= 1e-9) {
          break;
        }
        iLeft++;
      }
      if (iLeft === nHalfedges) {
        continue;
      }
      // if we reach this point, cell needs to be closed by walking
      // counterclockwise along the bounding box until it connects
      // to next halfedge in the list

      // find entry point:
      switch (true) {
        // walk downward along left side
        case this.equalWithEpsilon(va.x, xl) &&
          this.lessThanWithEpsilon(va.y, yb):
          lastBorderSegment = this.equalWithEpsilon(vz.x, xl);
          vb = this.createVertex(xl, lastBorderSegment ? vz.y : yb);
          edge = this.createBorderEdge(cell.site, va, vb);
          iLeft++;
          halfedges.splice(
            iLeft,
            0,
            this.createHalfedge(edge, cell.site, null)
          );
          if (lastBorderSegment) {
            break;
          }
          va = vb;

        // walk rightward along bottom side
        case this.equalWithEpsilon(va.y, yb) &&
          this.lessThanWithEpsilon(va.x, xr):
          lastBorderSegment = this.equalWithEpsilon(vz.y, yb);
          vb = this.createVertex(lastBorderSegment ? vz.x : xr, yb);
          edge = this.createBorderEdge(cell.site, va, vb);
          iLeft++;
          halfedges.splice(
            iLeft,
            0,
            this.createHalfedge(edge, cell.site, null)
          );
          if (lastBorderSegment) {
            break;
          }
          va = vb;

        // walk upward along right side
        case this.equalWithEpsilon(va.x, xr) &&
          this.greaterThanWithEpsilon(va.y, yt):
          lastBorderSegment = this.equalWithEpsilon(vz.x, xr);
          vb = this.createVertex(xr, lastBorderSegment ? vz.y : yt);
          edge = this.createBorderEdge(cell.site, va, vb);
          iLeft++;
          halfedges.splice(
            iLeft,
            0,
            this.createHalfedge(edge, cell.site, null)
          );
          if (lastBorderSegment) {
            break;
          }
          va = vb;

        // walk leftward along top side
        case this.equalWithEpsilon(va.y, yt) &&
          this.greaterThanWithEpsilon(va.x, xl):
          lastBorderSegment = this.equalWithEpsilon(vz.y, yt);
          vb = this.createVertex(lastBorderSegment ? vz.x : xl, yt);
          edge = this.createBorderEdge(cell.site, va, vb);
          iLeft++;
          halfedges.splice(
            iLeft,
            0,
            this.createHalfedge(edge, cell.site, null)
          );
          if (lastBorderSegment) {
            break;
          }
          va = vb;

          // walk downward along left side
          lastBorderSegment = this.equalWithEpsilon(vz.x, xl);
          vb = this.createVertex(xl, lastBorderSegment ? vz.y : yb);
          edge = this.createBorderEdge(cell.site, va, vb);
          iLeft++;
          halfedges.splice(
            iLeft,
            0,
            this.createHalfedge(edge, cell.site, null)
          );
          if (lastBorderSegment) {
            break;
          }
          va = vb;

          // walk rightward along bottom side
          lastBorderSegment = this.equalWithEpsilon(vz.y, yb);
          vb = this.createVertex(lastBorderSegment ? vz.x : xr, yb);
          edge = this.createBorderEdge(cell.site, va, vb);
          iLeft++;
          halfedges.splice(
            iLeft,
            0,
            this.createHalfedge(edge, cell.site, null)
          );
          if (lastBorderSegment) {
            break;
          }
          va = vb;

          // walk upward along right side
          lastBorderSegment = this.equalWithEpsilon(vz.x, xr);
          vb = this.createVertex(xr, lastBorderSegment ? vz.y : yt);
          edge = this.createBorderEdge(cell.site, va, vb);
          iLeft++;
          halfedges.splice(
            iLeft,
            0,
            this.createHalfedge(edge, cell.site, null)
          );
          break;

        default:
          throw 'Voronoi.closeCells() > this makes no sense!';
      }

      // At this point, all halfedges should be connected, or else
      // this means something went horribly wrong.
      if (abs_fn(vb.x - vz.x) >= 1e-9 || abs_fn(vb.y - vz.y) >= 1e-9) {
        throw 'Voronoi.closeCells() > Could not close the Voronoi cell!\n  (See https://github.com/gorhill/Javascript-Voronoi/issues/15)';
      }
      // cell.closeMe = false;
    }
  }

  public quantizeSites(sites: Site[]): void {
    const ε: number = this.EPSILON;
    let n: number = sites.length;
    let site: Site;
    while (n--) {
      site = sites[n];
      site.x = Math.floor(site.x / ε) * ε;
      site.y = Math.floor(site.y / ε) * ε;
    }
  }

  // ---------------------------------------------------------------------------
  // Helper: Recycle diagram: all vertex, edge and cell objects are
  // "surrendered" to the Voronoi object for reuse.
  // TODO: rhill-voronoi-core v2: more performance to be gained
  // when I change the semantic of what is returned.

  public recycle(diagram: Diagram): void {
    if (diagram) {
      if (diagram instanceof Diagram) {
        this.toRecycle = diagram;
      } else {
        throw 'Voronoi.recycleDiagram() > Need a Diagram object.';
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Top-level Fortune loop

  // rhill 2011-05-19:
  //   Voronoi sites are kept client-side now, to allow
  //   user to freely modify content. At compute time,
  //   *references* to sites are copied locally.

  public compute(sites: Site[], bbox: Bbox): Diagram {
    // to measure execution time
    const startTime: Date = new Date();

    // init internal state
    this.reset();

    // any diagram data available for recycling?
    // I do that here so that this is included in execution time
    if (this.toRecycle) {
      this.vertexJunkyard = this.vertexJunkyard.concat(this.toRecycle.vertices);
      this.edgeJunkyard = this.edgeJunkyard.concat(this.toRecycle.edges);
      this.cellJunkyard = this.cellJunkyard.concat(this.toRecycle.cells);
      this.toRecycle = null;
    }

    // Initialize site event queue
    const siteEvents: Site[] = sites.slice(0);
    siteEvents.sort(function (a, b) {
      let r = b.y - a.y;
      if (r) {
        return r;
      }
      return b.x - a.x;
    });

    // process queue
    let site: Site | undefined = siteEvents.pop();
    let siteid: number = 0;
    let xsitex: number | undefined, // to avoid duplicate sites
      xsitey: number | undefined;
    const cells: Cell[] = this.cells;
    let circle: Circle | undefined;

    // main loop
    for (;;) {
      // we need to figure whether we handle a site or circle event
      // for this we find out if there is a site event and it is
      // 'earlier' than the circle event
      circle = this.firstCircleEvent;

      // add beach section
      if (
        site &&
        (!circle ||
          site.y < circle.y ||
          (site.y === circle.y && site.x < circle.x))
      ) {
        // only if site is not a duplicate
        if (site.x !== xsitex || site.y !== xsitey) {
          // first create cell for new site
          cells[siteid] = this.createCell(site);
          site.voronoiId = siteid++;
          // then create a beachsection for that site
          this.addBeachsection(site);
          // remember last site coords to detect duplicate
          xsitey = site.y;
          xsitex = site.x;
        }
        site = siteEvents.pop();
      }

      // remove beach section
      else if (circle) {
        this.removeBeachsection(circle.arc);
      }

      // all done, quit
      else {
        break;
      }
    }

    // wrapping-up:
    //   connect dangling edges to bounding box
    //   cut edges as per bounding box
    //   discard edges completely outside bounding box
    //   discard edges which are point-like
    this.clipEdges(bbox);

    //   add missing edges in order to close opened cells
    this.closeCells(bbox);

    // to measure execution time
    const stopTime: Date = new Date();

    // prepare return values
    const diagram: Diagram = new Diagram();
    diagram.cells = this.cells;
    diagram.edges = this.edges;
    diagram.vertices = this.vertices;
    diagram.execTime = stopTime.getTime() - startTime.getTime();

    // clean up
    this.reset();

    return diagram;
  }
}
