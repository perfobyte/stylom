export default (
    function(Node, text) {
        return new Node(this.COMMENT_NODE, text, null, this);
    }
);
