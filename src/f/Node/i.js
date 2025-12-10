import * as f from './f/i.js';
import {
    SEPARATOR_NODE,
} from './f/i.js';

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

    this.to_string = (this.to_string_map)[type];
};

Node.prototype = f;

export default Node;
