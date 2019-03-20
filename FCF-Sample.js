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
        this.propertyType = config.propertyType;
        this.property = config.property;
        let node = this;

        let inputCallback = function (msg) {
            console.log("msg:");
            console.log(msg);
            getProperty(node, msg, (err, property) => {
                if (err) {
                    node.warn(err);
                    done();
                } else {
                    // 印出找到的值
                    console.log(property);
                }
            });
        };
        node.on("input", inputCallback);

    }
    RED.nodes.registerType("FCF-Sample", Sample);
};