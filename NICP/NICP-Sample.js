const request = require("request");
const _ = require("underscore");
const clc = require("cli-color");
const green = clc.greenBright;
const white = clc.white;
const redBright = clc.redBright;
module.exports = function (RED) {
    let getProperty = function _getProperty(node, msg, done) {
        if (node.propertyType === "jsonata") {
            RED.util.evaluateJSONataExpression(node.property, msg, (err, value) => {
                if (err) {
                    done(RED._("switch.errors.invalid-expr", { error: err.message }));
                } else {
                    done(undefined, value);
                }
            });
        } else {
            RED.util.evaluateNodeProperty(node.property, node.propertyType, node, msg, (err, value) => {
                if (err) {
                    done(undefined, undefined);
                } else {
                    done(undefined, value);
                }
            });
        }
    };
    function Sample(config) {

        RED.nodes.createNode(this, config);

        const flowContext = this.context().flow;//建立並取得context物件

        this.propertyType = config.propertyType;
        
        const node = this;

        const inputCallback = function (msg) {
            //  取得名為xanxusContext這個Context檔案系統的檔案，config.type是現在這個節點的類型，所以會取得FCF-Sample這個key
            // 原始的寫法
            // const contextFileSystemNodeTypeKey = flowContext.get(config.type, "xanxusContext");
            // 非同步取值的寫法
            flowContext.get(config.type, "xanxusContext", function (err, contextFileSystemNodeTypeKey) {
                // contextFileSystemNodeTypeKey回傳是陣列，因他可能裝了很多某類型的節點，如裝很多FCF-Sample這節點，但每個陣列元素中的資料都不一樣
                node.property = contextFileSystemNodeTypeKey[1].property || config.property;
                msg.property = node.property;
                node.send(msg);
            });
        };
        node.on("input", inputCallback);
    }
    RED.nodes.registerType("FCF-Sample", Sample);
};