var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/conf/NodeType.js
var NodeType_exports = {};
__export(NodeType_exports, {
  BLOCK_NODE: () => BLOCK_NODE,
  COMMENT_NODE: () => COMMENT_NODE,
  DECLARATION_KEY_NODE: () => DECLARATION_KEY_NODE,
  DECLARATION_VALUE_NODE: () => DECLARATION_VALUE_NODE,
  SELECTOR_NODE: () => SELECTOR_NODE,
  SEPARATOR_NODE: () => SEPARATOR_NODE,
  STYLESHEET_NODE: () => STYLESHEET_NODE,
  WHITESPACE_NODE: () => WHITESPACE_NODE
});
var STYLESHEET_NODE = 0;
var WHITESPACE_NODE = 1;
var COMMENT_NODE = 2;
var SELECTOR_NODE = 3;
var DECLARATION_KEY_NODE = 4;
var DECLARATION_VALUE_NODE = 5;
var BLOCK_NODE = 6;
var SEPARATOR_NODE = 7;

// src/conf/WHITESPACE.js
var WHITESPACE_default = [
  "	",
  // TAB
  "\n",
  // LF
  "\f",
  // FF
  "\r",
  // CR
  " "
  // SPACE
];

// src/conf/DEFINITION_OF_VALUE.js
var DEFINITION_OF_VALUE_default = [":", "{"];

// src/f/parse.js
var parse_default = (source, global, index, length, Node2, Container) => {
  var code = 0, children = global.children, parent = global, stage = 0, i = -1, j = 0, z = 0, value_start = 0, raw_value_end = 0, value_end = 0, value_text_end = 0, cut = 0, chars = "", another_chars = "", char = "", WHITESPACE = global.WHITESPACE, DEFINITION_OF_VALUE = global.DEFINITION_OF_VALUE, has_value = false, node_children = null, node = null, selected_chars = "", in_block = 0;
  a: while (index < length) {
    char = source[index];
    if (stage === 0) {
      if (in_block && char === "}") {
        chars && (children.push(parent.whitespace(Node2, chars)), chars = "");
        children = (parent = parent.parent).children;
        in_block--;
        index++;
      } else if (WHITESPACE.includes(char)) {
        chars += char;
        index++;
      } else {
        chars && (children.push(parent.whitespace(Node2, chars)), chars = "");
        stage = char === "/" && source[index + 1] === "*" ? (index += 2, 2) : 1;
      }
    } else if (stage === 1) {
      do {
        chars += char;
        if (++index >= length) {
          i = -1;
          break;
        }
        ;
        char = source[index];
      } while ((i = DEFINITION_OF_VALUE.indexOf(char)) === -1 && index < length);
      j = z = index++ - 1;
      while (WHITESPACE.includes(source[j])) {
        j--;
      }
      ;
      if (j < z) {
        cut = chars.length - z + j;
        another_chars = chars.substring(cut);
        chars = chars.substring(0, cut);
      } else {
        another_chars = "";
      }
      if (i === 0) {
        children.push(parent.declaration_key(Node2, chars, null));
        chars = "";
        another_chars && (another_chars = (children.push(parent.whitespace(Node2, another_chars)), ""));
        children.push(parent.colon(Node2, parent));
        stage = 3;
      } else if (i === 1) {
        children.push(parent.selector(Node2, chars, null));
        chars = "";
        another_chars && (another_chars = (children.push(parent.whitespace(Node2, another_chars)), ""));
        node_children = new Container();
        node = parent.block(Node2, node_children);
        in_block++;
        children.push(node);
        parent = node;
        children = node_children;
        stage = 0;
      } else {
        children.push(parent.selector(Node2, chars, null));
        chars = "";
        another_chars = "";
        stage = 0;
      }
      ;
    } else if (stage === 2) {
      i = index;
      while (i < length && !(source[i] === "*" && source[i + 1] === "/")) {
        i++;
      }
      ;
      children.push(parent.comment(Node2, source.substring(index, i)));
      index = i + 2;
      stage = 0;
    } else if (stage === 3) {
      i = index;
      while (i < length && WHITESPACE.includes(source[i])) {
        i++;
      }
      ;
      if (i > index) {
        children.push(parent.whitespace(Node2, source.substring(index, i)));
      }
      value_start = i;
      while (i < length && source[i] !== ";" && source[i] !== "}") {
        i++;
      }
      ;
      value_end = (raw_value_end = i) - 1;
      while (value_end >= value_start && WHITESPACE.includes(source[value_end])) {
        value_end--;
      }
      ;
      has_value = value_end >= value_start;
      value_text_end = has_value ? value_end + 1 : value_start;
      children.push(
        parent.declaration_value(
          Node2,
          source.substring(value_start, value_text_end),
          null
        )
      );
      if (value_text_end < raw_value_end) {
        children.push(
          parent.whitespace(
            Node2,
            source.substring(value_text_end, raw_value_end)
          )
        );
      }
      if (i < length && source[i] === ";") {
        children.push(parent.semicolon(Node2, parent));
        index = i + 1;
      } else {
        index = i;
      }
      stage = 0;
    }
  }
  ;
  chars && children.push(parent.whitespace(Node2, chars));
  return code;
};

// src/f/Node/f/i.js
var i_exports = {};
__export(i_exports, {
  BLOCK_NODE: () => BLOCK_NODE,
  COMMENT_NODE: () => COMMENT_NODE,
  DECLARATION_KEY_NODE: () => DECLARATION_KEY_NODE,
  DECLARATION_VALUE_NODE: () => DECLARATION_VALUE_NODE,
  DEFINITION_OF_VALUE: () => DEFINITION_OF_VALUE_default,
  NodeType: () => NodeType_exports,
  SELECTOR_NODE: () => SELECTOR_NODE,
  SEPARATOR_NODE: () => SEPARATOR_NODE,
  STYLESHEET_NODE: () => STYLESHEET_NODE,
  WHITESPACE: () => WHITESPACE_default,
  WHITESPACE_NODE: () => WHITESPACE_NODE,
  block: () => block_default,
  colon: () => colon_default,
  comment: () => comment_default,
  declaration_key: () => declaration_key_default,
  declaration_value: () => declaration_value_default,
  reduce_sm_to_string: () => reduce_sm_to_string_default,
  selector: () => selector_default,
  semicolon: () => semicolon_default,
  to_string_map: () => i_default,
  whitespace: () => whitespace_default
});

// src/f/Node/f/separator/colon.js
var colon_default = function(Node2, parent) {
  return new Node2(this.SEPARATOR_NODE, ":", null, parent);
};

// src/f/Node/f/separator/semicolon.js
var semicolon_default = function(Node2, parent) {
  return new Node2(this.SEPARATOR_NODE, ";", null, parent);
};

// src/f/Node/f/whitespace.js
var whitespace_default = function(Node2, text) {
  return new Node2(this.WHITESPACE_NODE, text, null, this);
};

// src/f/Node/f/selector.js
var selector_default = function(Node2, text, children) {
  return new Node2(this.SELECTOR_NODE, text, children, this);
};

// src/f/Node/f/block.js
var block_default = function(Node2, children) {
  return new Node2(this.BLOCK_NODE, "", children, this);
};

// src/f/Node/f/declaration_key.js
var declaration_key_default = function(Node2, text, children) {
  return new Node2(this.DECLARATION_KEY_NODE, text, children, this);
};

// src/f/Node/f/declaration_value.js
var declaration_value_default = function(Node2, text, children) {
  return new Node2(this.DECLARATION_VALUE_NODE, text, children, this);
};

// src/f/Node/f/comment.js
var comment_default = function(Node2, text) {
  return new Node2(this.COMMENT_NODE, text, null, this);
};

// src/f/Node/f/to_string/children.js
var children_default = function() {
  return this.children.reduce(this.reduce_sm_to_string, "");
};

// src/f/Node/f/to_string/data.js
var data_default = function() {
  return this.data;
};

// src/f/Node/f/to_string/block.js
var block_default2 = function() {
  return `{${this.children.reduce(this.reduce_sm_to_string, "")}}`;
};

// src/f/Node/f/to_string/comment.js
var comment_default2 = function() {
  return `/*${this.data}*/`;
};

// src/f/Node/f/to_string/i.js
var i_default = {
  0: children_default,
  1: data_default,
  2: comment_default2,
  3: data_default,
  4: data_default,
  5: data_default,
  6: block_default2,
  7: data_default
};

// src/f/Node/f/reduce_sm_to_string.js
var reduce_sm_to_string_default = (r, v) => r + v.to_string();

// src/f/Node/i.js
function Node(type, data, children, parent) {
  this.type = type;
  this.data = data;
  this.children = children;
  this.parent = parent;
  this.to_string = this.to_string_map[type];
}
Node.prototype = i_exports;
var i_default2 = Node;
export {
  BLOCK_NODE,
  COMMENT_NODE,
  DECLARATION_KEY_NODE,
  DECLARATION_VALUE_NODE,
  DEFINITION_OF_VALUE_default as DEFINITION_OF_VALUE,
  i_default2 as Node,
  NodeType_exports as NodeType,
  SELECTOR_NODE,
  SEPARATOR_NODE,
  STYLESHEET_NODE,
  WHITESPACE_default as WHITESPACE,
  WHITESPACE_NODE,
  parse_default as parse
};
//# sourceMappingURL=1.js.map
