const colors = require("colors");
module.exports = function (RED) {
    function LowerCaseNode(config) {

        RED.nodes.createNode(this, config);

        this.name2 = config.name2;

        let node = this;

        node.on("input", function (msg) {
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });

    }
    RED.nodes.registerType("lower-case", LowerCaseNode);
};