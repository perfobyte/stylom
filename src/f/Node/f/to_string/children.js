

export default (
    function() {
        return this.children.reduce(this.reduce_sm_to_string,"");
    }
);
