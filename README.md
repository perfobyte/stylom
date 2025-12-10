# @perfobyte/stylom

CSS parser for all – a tiny low-level CSS AST parser that turns CSS text into a tree of nodes.

- Builds a simple `Node`-based AST  
- Keeps comments and whitespace  
- Can serialize nodes back to CSS via `to_string()`

---

## Installation

```bash
npm install @perfobyte/stylom
# or
yarn add @perfobyte/stylom
```

---

## Quick start

```js
import {
  parse,
  Node,
  STYLESHEET_NODE,
  stylesheet,
} from "@perfobyte/stylom";

(
    () => {
        var
            Container = Array,
            root = stylesheet(Node, new Container()),

            css_code = `
                .button {
                    color: red;
                    /* comment */
                }
            `

        ;
        return void (
            parse(css_code, root, 0, css_code.length, Node, Container),

            console.log("OUT:\n\n", root.to_string()),

            console.log(root.to_string() === css_code) // true
        );

        // OUT:
        //
        // .button {
        //   color: red;
        //   /* comment */
        // }
    }
)()

```

---

## API

### parse(source, global, index, length, Node, Container)
Parses CSS into the AST attached to `global.children`.

- source: string       CSS text
- global: Node         root node (usually STYLESHEET_NODE)
- index: number        start index (0)
- length: number       end index (source.length)
- Node                 exported Node constructor
- Container            array-like class for children

Returns: `0`, AST is built on global.children

---

### Node(type, data, children, parent)

AST node object.

Properties:
- node.type
- node.data
- node.children
- node.parent
- node.to_string()

---

### Node Types

| Constant                | Value |
|------------------------:|:-----:|
| STYLESHEET_NODE         |   0   |
| WHITESPACE_NODE         |   1   |
| COMMENT_NODE            |   2   |
| SELECTOR_NODE           |   3   |
| DECLARATION_KEY_NODE    |   4   |
| DECLARATION_VALUE_NODE  |   5   |
| BLOCK_NODE              |   6   |
| SEPARATOR_NODE          |   7   |

---

### Utility Exports

| Name                | Description                                |
|---------------------|--------------------------------------------|
| WHITESPACE          | Whitespace characters used during parsing  |
| DEFINITION_OF_VALUE | Characters that trigger value parsing      |
| NodeType            | Same constants grouped in one object       |

---

## License

MIT © perfobyte