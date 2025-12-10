export default (
    function(Node, text, children) {
        return new Node(this.SELECTOR_NODE, text, children, this);
    }
);
