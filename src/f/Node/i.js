import * as f from './f/i.js';

function Node(
    type,
    data,

    children,
    parent,
) {
    this.type = type;
    this.data = data;
    
    this.children = children;
    this.parent = parent;
};

Node.prototype = f;

export default Node;
