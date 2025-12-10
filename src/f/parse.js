
export default (
    (
        source,
        global,

        index,
        length,

        Node,
        Container,
    ) => {
        var
            code = 0,

            children = global.children,
            parent = global,

            stage = 0,

            i = -1,
            j = 0,
            z = 0,
            value_start = 0,
            raw_value_end = 0,
            value_end = 0,
            value_text_end = 0,

            cut = 0,

            chars = "",
            another_chars = "",

            char = "",
            
            WHITESPACE = global.WHITESPACE,
            DEFINITION_OF_VALUE = global.DEFINITION_OF_VALUE,

            has_value = false,

            node_children = null,
            node = null,

            selected_chars = "",

            in_block = 0
        ;
        
        a: while (index < length) {
            char = source[index];

            if (stage === 0) {
                // TEXT

                if (in_block && (char === "}")) {
                    chars && (
                        children.push(parent.whitespace(Node, chars)),
                        (chars = "")
                    );

                    children = (parent = parent.parent).children;
                    in_block--;
                    index++;
                }
                else if (WHITESPACE.includes(char)) {
                    chars += char;
                    index++;
                }
                else {
                    (chars) && (
                        children.push(parent.whitespace(Node, chars)),
                        (chars = "")
                    );

                    stage = (
                        ((char === "/")&&(source[index+1]==='*'))
                        ? (
                            (index+=2),
                            2
                        )
                        : (
                            1
                        )
                    );
                }
            }
            else if (stage === 1) {
                // KEY (SELECTOR, DECLARATION)

                do {
                    chars += char;
                    if ((++index) >= length) {
                        i = (-1);
                        break;
                    };
                    char = source[index];
                }
                while (((i = DEFINITION_OF_VALUE.indexOf(char)) === -1) && (index < length));

                j=(z=((index++)-1));

                while (WHITESPACE.includes(source[j])) {
                    j--;
                };

                if (j < z) {
                    cut = (chars.length-z+j);
                    another_chars = chars.substring(cut);
                    chars = chars.substring(0, cut);
                }
                else {
                    another_chars = "";
                }

                if (i === 0) {
                    children.push(parent.declaration_key(Node, chars, null));
                    chars = "";

                    (another_chars) &&= (
                        children.push(parent.whitespace(Node, another_chars)),
                        ("")
                    );

                    children.push(parent.colon(Node, parent));

                    stage = 3;
                }
                else if (i === 1) {
                    children.push(parent.selector(Node, chars, null));
                    chars = "";

                    (another_chars) &&= (
                        children.push(parent.whitespace(Node, another_chars)),
                        ("")
                    );

                    node_children = new Container();
                    node = parent.block(Node, node_children);
                    in_block++;

                    children.push(node);

                    parent = node;
                    children = node_children;

                    stage = 0;
                }
                else {
                    children.push(parent.selector(Node, chars, null));
                    chars = "";
                    another_chars = "";
                    stage = 0;
                };

                
            }
            else if (stage === 2) {
                i = index;
                while ((i<length)&&(!((source[i]==="*")&&(source[i+1]==="/")))) {
                    i++;
                };
                children.push(parent.comment(Node, source.substring(index, i)));
                index = i+2;
                stage = 0;
            }
            else if (stage === 3) {
                i = index;
                while ((i<length)&&(WHITESPACE.includes(source[i]))) {
                    i++;
                };
                
                if (i > index) {
                    children.push(parent.whitespace(Node, source.substring(index, i)));
                }

                value_start = i;

                while ((i<length)&&(source[i] !== ";")&&(source[i] !== "}")) {
                    i++;
                };

                value_end = (raw_value_end = i) - 1;

                while ((value_end >= value_start) && WHITESPACE.includes(source[value_end])) {
                    value_end--;
                };

                has_value = (value_end >= value_start);
                value_text_end = ((has_value) ? (value_end + 1) : (value_start));
                
                
                children.push(
                    parent.declaration_value(
                        Node,
                        (source.substring(value_start, value_text_end)),
                        null
                    )
                );

                if (value_text_end < raw_value_end) {
                    children.push(
                        parent.whitespace(
                            Node,
                            source.substring(value_text_end, raw_value_end)
                        )
                    );
                }

                if ((i < length) && (source[i] === ";")) {
                    children.push(parent.semicolon(Node, parent));
                    index = i + 1;
                }
                else {
                    index = i;
                }

                stage = 0;
            }
        };

        (chars)
        && 
        children.push(parent.whitespace(Node, chars));
        

        return code;
    }
);
