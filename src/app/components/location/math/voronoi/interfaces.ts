interface Site {
  x: number;
  y: number;
  voronoiId?: number;
}

interface Bbox {}

interface Circle {
  arc: any;
}

interface Cell {}

interface Vertex {
  x: number;
  y: number;
}


interface Edge {
  va: Vertex  |Site;
  vb: Vertex | Site;
  lSite?: Site;
  rSite?: Site;
}


interface Diagram {
  cells: Cell[];
  edges: Edge[];
  vertices: Vertex[];
  execTime: number;
}

interface Vertex {
  x: number;
  y: number;
}



interface Halfedge {
  site: Site;
  edge: Edge;
  angle: number;
  neighbor?: Site;
  
  getStartpoint: any;
  getEndpoint: any;
}
