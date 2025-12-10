export default (
    function(Node, children) {
        return new Node(this.BLOCK_NODE, "", children, this);
    }
);
