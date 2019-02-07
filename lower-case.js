const colors = require("colors");
module.exports = function (RED) {
    function LowerCaseNode(config) {

        RED.nodes.createNode(this, config);

        this.name2 = config.name2;

        let node = this;

        let inputCallback = function (msg) {
            msg.payload = msg.payload + "111";
            node.send(msg);
        };

        let inputCallback2 = function (msg) {
            msg.payload = msg.payload + "222";
            node.send(msg);
        };
        if (node.name == "aaa") {
            node.on("input", inputCallback);
        }
        else {
            node.on("input", inputCallback2);
        }

    }
    RED.nodes.registerType("lower-case", LowerCaseNode);
};