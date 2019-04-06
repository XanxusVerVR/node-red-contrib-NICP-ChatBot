module.exports = function (RED) {
    "use strict";
    const RuleManager = require("./lib/RuleManager");
    var ruleManager = null;

    function andGateNode(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        this.rules = n.rules || [];
        this.topic = n.outputTopic || null;
        this.type = n.gateType || "and";
        this.emitOnlyIfTrue = n.emitOnlyIfTrue || false;
        node.status({ fill: "blue", shape: "ring", text: "Loading..." });

        this.ruleManager = new RuleManager(RED, node, this.type);
        this.ruleManager.storeRule(this.rules).then((result) => {
            if (result) {
                node.status({ fill: "green", shape: "dot", text: "TRUE" });
            }
            else {
                node.status({ fill: "red", shape: "dot", text: "FALSE" });
            }
            if (this.emitOnlyIfTrue && result || !this.emitOnlyIfTrue) {
                node.send({ topic: this.topic, payload: null, bool: result })
            }
        });

        node.on('input', function (msg) {
            this.ruleManager.updateState(msg).then((result) => {
                if (result) {
                    node.status({ fill: "green", shape: "dot", text: "TRUE" });
                }
                else {
                    node.status({ fill: "red", shape: "dot", text: "FALSE" });
                }
                if (this.emitOnlyIfTrue && result || !this.emitOnlyIfTrue) {
                    node.send({ topic: this.topic, payload: msg.payload || null, bool: result });
                }
            });
        });
    }

    RED.nodes.registerType("NICP-BooleanGate", andGateNode);
}