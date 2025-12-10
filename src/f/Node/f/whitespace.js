export default (
    function(Node, text) {
        return new Node(this.WHITESPACE_NODE, text,null,this);
    }
);
