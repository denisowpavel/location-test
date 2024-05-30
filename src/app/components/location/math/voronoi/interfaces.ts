import { Cell } from './cell';

export interface ISite {
  x: number;
  y: number;
  voronoiId?: number;
}

export interface IVertex {
  x: number;
  y: number;
}

export interface IEdge {
  va: IVertex | ISite;
  vb: IVertex | ISite;
  lSite?: ISite;
  rSite?: ISite;
}

export interface IDiagram {
  cells: Cell[];
  edges: IEdge[];
  vertices: IVertex[];
  execTime: number;
}

export interface IHalfedge {
  site: ISite;
  edge: IEdge;
  angle: number;
  neighbor?: ISite;

  getStartpoint: any;
  getEndpoint: any;
}

export interface ICircleEvent {
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
}
export interface IBbox {}

export interface ICircle {
  arc: any;
}
