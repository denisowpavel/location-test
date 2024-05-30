import { ISite } from './interfaces';
import { Halfedge } from './halfedge';

export class Cell {
  site: ISite;
  halfedges: Halfedge[];
  closeMe: boolean;

  constructor(site: ISite) {
    this.site = site;
    this.halfedges = [];
    this.closeMe = false;
  }

  private init(site: ISite) {
    this.site = site;
    this.halfedges = [];
    this.closeMe = false;
    return this;
  }

  private prepareHalfedges() {
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

  private getNeighborIds() {
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

  private getBbox() {
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

  private pointIntersection(x: number, y: number) {
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
