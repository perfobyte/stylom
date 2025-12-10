

export default (
    function(Node, parent) {
        return new Node(this.SEPARATOR_NODE, ":", null, parent);
    }
);
