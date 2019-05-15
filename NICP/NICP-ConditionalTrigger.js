const _ = require("underscore");
module.exports = function (RED) {
    "use strict";
    const RuleManager = require("./lib/RuleManager");
    var ruleManager = null;

    function andGateNode(n) {
        RED.nodes.createNode(this, n);

        const flowContext = this.context().flow;//建立並取得context物件

        let contextFileSystemNodeTypeKey = flowContext.get(n.type, "xanxusContext");
        if (contextFileSystemNodeTypeKey) {
            // 找到由外部送進來的設定的資料，並取代掉Node-RED UI端設定的
            for (let i = 0; i < contextFileSystemNodeTypeKey.length; i++) {
                if (contextFileSystemNodeTypeKey[i].id == n.configDataId) {// 從檔案系統開始找，如果找到和剛剛傳進來的名稱一樣，表示要更新
                    n = contextFileSystemNodeTypeKey[i];
                }
            }
        }
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

    RED.nodes.registerType("NICP-ConditionalTrigger", andGateNode);
}