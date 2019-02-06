const colors = require("colors");
module.exports = function (RED) {
    function LowerCaseNode(config) {

        RED.nodes.createNode(this, config);

        this.name2 = config.name2;

        let node = this;

        node.on("input", function (msg) {
            let resolvedTokens = {};
            let type = "flow";
            let target = node.context()["global"];
            console.log(target);
            let field = "aaa";
            let name = "flow.aaa";
            let store = undefined;
            target.get(field, store, (err, val) => {
                if (err) {
                    console.log(err);
                    // reject(err);
                } else {
                    /* resolvedTokens:
                        { 'flow.aaa': 321 }
                    */
                    resolvedTokens[name] = val;
                    // resolve();
                }
            });
            console.log(resolvedTokens);
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });

    }
    RED.nodes.registerType("lower-case", LowerCaseNode);
};