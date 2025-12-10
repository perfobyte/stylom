export default (
    function(Node, text, children) {
        return new Node(this.DECLARATION_VALUE_NODE, text, children, this);
    }
);
