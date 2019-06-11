const _ = require("underscore");
module.exports = function (RED) {
    "use strict";
    const RuleManager = require("./lib/RuleManager");
    const ruleManager = null;
    // let ConditionalTriggerContextFileData;
    function andGateNode(n) {

        RED.nodes.createNode(this, n);
        const flowContext = this.context().flow;//建立並取得context物件
        const node = this;

        this.rules = n.rules || [];
        this.topic = n.outputTopic || null;
        this.type = n.gateType || "and";
        this.emitOnlyIfTrue = n.emitOnlyIfTrue || false;

        node.status({ fill: "blue", shape: "ring", text: "Loading..." });
        node.ruleManager = new RuleManager(RED, node, node.type);
        node.ruleManager.storeRule(node.rules).then((result) => {
            if (result) {
                node.status({ fill: "green", shape: "dot", text: "TRUE" });
            }
            else {
                node.status({ fill: "red", shape: "dot", text: "FALSE" });
            }
            if (node.emitOnlyIfTrue && result || !node.emitOnlyIfTrue) {
                node.send({ topic: node.topic, payload: null, bool: result })
            }
        });
        let updateToContextFileRules = function _updateToContextFileRules(rules, topic, emitOnlyIfTrue) {
            node.ruleManager.storeRule(rules).then((result) => {
                // if (result) {
                //     node.status({ fill: "green", shape: "dot", text: "TRUE 02" });
                // }
                // else {
                //     node.status({ fill: "red", shape: "dot", text: "FALSE 02" });
                // }
                // if (emitOnlyIfTrue && result || !emitOnlyIfTrue) {
                //     node.send({ topic: topic, payload: null, bool: result })
                // }
            });
        };


        node.on('input', function (msg) {
            flowContext.get(n.type, "xanxusContext", function (err, contextFileSystemNodeTypeKey) {
                // contextFileSystemNodeTypeKey回傳是陣列，因他可能裝了很多某類型的節點，如裝很多FCF-Sample這節點，但每個陣列元素中的資料都不一樣
                if (contextFileSystemNodeTypeKey) {
                    for (let i = 0; i < contextFileSystemNodeTypeKey.length; i++) {
                        if (contextFileSystemNodeTypeKey[i].name === node.name) {
                            node.rules = contextFileSystemNodeTypeKey[i].rules;
                            node.outputTopic = contextFileSystemNodeTypeKey[i].outputTopic;
                            node.gateType = contextFileSystemNodeTypeKey[i].gateType;
                            node.emitOnlyIfTrue = contextFileSystemNodeTypeKey[i].emitOnlyIfTrue;
                            // ConditionalTriggerContextFileData = contextFileSystemNodeTypeKey[i];
                            updateToContextFileRules(node.rules, node.outputTopic, node.emitOnlyIfTrue);
                        }
                    }
                }
                else {
                    console.log("這個Conditional Trigger目前Context File沒有存他的外部設定檔");
                }
            });
            this.ruleManager.updateState(msg).then((result) => {
                if (result) {
                    node.status({ fill: "green", shape: "dot", text: "TRUE" });
                }
                else {
                    node.status({ fill: "red", shape: "dot", text: "FALSE" });
                }
                if (node.emitOnlyIfTrue && result || !node.emitOnlyIfTrue) {
                    node.send({ topic: node.topic, payload: msg.payload || null, bool: result });
                }
            });
        });
    }

    RED.nodes.registerType("NICP-ConditionalTrigger", andGateNode);
    // RED.httpAdmin.get("/NICP-ConditionalTrigger", RED.auth.needsPermission("NICP-ConditionalTrigger.read"), function (req, res) {
    //     res.json(ConditionalTriggerContextFileData);
    // });

};