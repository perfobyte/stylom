export default (
    function(Node, text, children) {
        return new Node(this.DECLARATION_KEY_NODE, text, children, this);
    }
);
