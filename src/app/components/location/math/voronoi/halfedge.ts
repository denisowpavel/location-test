import { ISite, IEdge, IVertex } from './interfaces';

export class Halfedge {
  edge: IEdge;
  site: ISite;
  angle: number;

  constructor(edge: IEdge, lSite: ISite, rSite: ISite) {
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

  getStartpoint(): IVertex {
    return this.edge.lSite === this.site ? this.edge.va : this.edge.vb;
  }

  getEndpoint(): IVertex {
    return this.edge.lSite === this.site ? this.edge.vb : this.edge.va;
  }
}
