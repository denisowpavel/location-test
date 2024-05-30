/*
	The MIT License

	Copyright (c) 2011 Mike Chambers

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

/**
 * A QuadTree implementation in JavaScript, a 2d spatial subdivision algorithm.
 * @module QuadTree
 **/

/****************** QuadTree ****************/

interface Bounds {
  x: Number;
  y: Number;
  width: Number;
  height: Number;
}

/**
 * QuadTree data structure.
 * @class QuadTree
 * @constructor
 * @param {Object} An object representing the bounds of the top level of the QuadTree. The object
 * should contain the following properties : x, y, width, height
 * @param {Boolean} pointQuad Whether the QuadTree will contain points (true), or items with bounds
 * (width / height)(false). Default value is false.
 * @param {Number} maxDepth The maximum number of levels that the quadtree will create. Default is 4.
 * @param {Number} maxChildren The maximum number of children that a node can contain before it is split into sub-nodes.
 **/

class QuadTree {
  /**
   * The root node of the QuadTree which covers the entire area being segmented.
   * @property root
   * @type Node
   **/
  root?: Node;

  constructor(
    bounds: Bounds,
    pointQuad: boolean,
    maxDepth: number,
    maxChildren: number
  ) {
    let node: Node;
    if (pointQuad) {
      node = new Node(bounds, 0, maxDepth, maxChildren);
    } else {
      node = new BoundsNode(bounds, 0, maxDepth, maxChildren);
    }

    this.root = node;
  }

  /**
   * Inserts an item into the QuadTree.
   * @method insert
   * @param {Object|Array} item The item or Array of items to be inserted into the QuadTree. The item should expose x, y
   * properties that represents its position in 2D space.
   **/
  insert(item: any): void {
    if (item instanceof Array) {
      const len = item.length;

      for (let i = 0; i < len; i++) {
        this.root?.insert(item[i]);
      }
    } else {
      this.root?.insert(item);
    }
  }

  /**
   * Clears all nodes and children from the QuadTree
   * @method clear
   **/
  clear(): void {
    this.root?.clear();
  }

  /**
   * Retrieves all items / points in the same node as the specified item / point. If the specified item
   * overlaps the bounds of a node, then all children in both nodes will be returned.
   * @method retrieve
   * @param {Object} item An object representing a 2D coordinate point (with x, y properties), or a shape
   * with dimensions (x, y, width, height) properties.
   **/
  retrieve(item: any): any[] {
    //get a copy of the array of items
    const out = this.root?.retrieve(item).slice(0);
    return out;
  }
}

/************** Node ********************/

class Node {
  nodes: Node[];
  children: any[];
  _bounds: Bounds;
  _depth: number;
  _maxChildren: number;
  _maxDepth: number;
  static TOP_LEFT = 0;
  static TOP_RIGHT = 1;
  static BOTTOM_LEFT = 2;
  static BOTTOM_RIGHT = 3;

  constructor(
    bounds: Bounds,
    depth: number,
    maxDepth?: number,
    maxChildren?: number
  ) {
    this._bounds = bounds;
    this.children = [];
    this.nodes = [];

    if (maxChildren) {
      this._maxChildren = maxChildren;
    }

    if (maxDepth) {
      this._maxDepth = maxDepth;
    }

    if (depth) {
      this._depth = depth;
    }
  }

  insert(item: any): void {
    if (this.nodes.length) {
      const index = this._findIndex(item);

      this.nodes[index].insert(item);

      return;
    }

    this.children.push(item);

    const len = this.children.length;
    if (!(this._depth >= this._maxDepth) && len > this._maxChildren) {
      this.subdivide();

      for (let i = 0; i < len; i++) {
        this.insert(this.children[i]);
      }

      this.children.length = 0;
    }
  }

  retrieve(item: any): any[] {
    if (this.nodes.length) {
      const index = this._findIndex(item);

      return this.nodes[index].retrieve(item);
    }

    return this.children;
  }

  _findIndex(item: any): number {
    const b = this._bounds;
    const left = item.x > b.x + b.width / 2 ? false : true;
    const top = item.y > b.y + b.height / 2 ? false : true;

    //top left
    let index = Node.TOP_LEFT;
    if (left) {
      //left side
      if (!top) {
        //bottom left
        index = Node.BOTTOM_LEFT;
      }
    } else {
      //right side
      if (top) {
        //top right
        index = Node.TOP_RIGHT;
      } else {
        //bottom right
        index = Node.BOTTOM_RIGHT;
      }
    }

    return index;
  }

  subdivide(): void {
    const depth = this._depth + 1;

    const bx = this._bounds.x;
    const by = this._bounds.y;

    //floor the values
    const b_w_h = (this._bounds.width / 2) | 0;
    const b_h_h = (this._bounds.height / 2) | 0;
    const bx_b_w_h = bx + b_w_h;
    const by_b_h_h = by + b_h_h;

    //top left
    this.nodes[Node.TOP_LEFT] = new Node(
      {
        x: bx,
        y: by,
        width: b_w_h,
        height: b_h_h,
      },
      depth
    );

    //top right
    this.nodes[Node.TOP_RIGHT] = new Node(
      {
        x: bx_b_w_h,
        y: by,
        width: b_w_h,
        height: b_h_h,
      },
      depth
    );

    //bottom left
    this.nodes[Node.BOTTOM_LEFT] = new Node(
      {
        x: bx,
        y: by_b_h_h,
        width: b_w_h,
        height: b_h_h,
      },
      depth
    );

    //bottom right
    this.nodes[Node.BOTTOM_RIGHT] = new Node(
      {
        x: bx_b_w_h,
        y: by_b_h_h,
        width: b_w_h,
        height: b_h_h,
      },
      depth
    );
  }

  clear(): void {
    this.children.length = 0;

    const len = this.nodes.length;
    for (let i = 0; i < len; i++) {
      this.nodes[i].clear();
    }

    this.nodes.length = 0;
  }
}

/******************** BoundsQuadTree ****************/

class BoundsNode extends Node {
  _stuckChildren: any[];
  _out: any[];

  constructor(
    bounds: Bounds,
    depth: number,
    maxChildren: number,
    maxDepth: number
  ) {
    super(bounds, depth, maxChildren, maxDepth);
    this._stuckChildren = [];
  }

  insert(item: any): void {
    if (this.nodes.length) {
      const index = this._findIndex(item);
      const node = this.nodes[index];

      //todo: make _bounds bounds
      if (
        item.x >= node._bounds.x &&
        item.x + item.width <= node._bounds.x + node._bounds.width &&
        item.y >= node._bounds.y &&
        item.y + item.height <= node._bounds.y + node._bounds.height
      ) {
        this.nodes[index].insert(item);
      } else {
        this._stuckChildren.push(item);
      }

      return;
    }

    this.children.push(item);

    const len = this.children.length;

    if (!(this._depth >= this._maxDepth) && len > this._maxChildren) {
      this.subdivide();

      for (let i = 0; i < len; i++) {
        this.insert(this.children[i]);
      }

      this.children.length = 0;
    }
  }

  getChildren(): any[] {
    return this.children.concat(this._stuckChildren);
  }

  retrieve(item: any): any[] {
    const out = this._out;
    out.length = 0;
    if (this.nodes.length) {
      const index = this._findIndex(item);

      out.push.apply(out, this.nodes[index].retrieve(item));
    }

    out.push.apply(out, this._stuckChildren);
    out.push.apply(out, this.children);

    return out;
  }

  clear(): void {
    this._stuckChildren.length = 0;

    //array
    this.children.length = 0;

    const len = this.nodes.length;

    if (!len) {
      return;
    }

    for (let i = 0; i < len; i++) {
      this.nodes[i].clear();
    }

    //array
    this.nodes.length = 0;

    //we could call the super clear function but for now, im just going to inline it
    //call the hidden super.clear, and make sure its called with this = this instance
    //Object.getPrototypeOf(BoundsNode.prototype).clear.call(this);
  }

  getChildCount(): void {}
}
