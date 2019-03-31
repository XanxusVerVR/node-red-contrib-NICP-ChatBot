const _ = require("underscore");
const clc = require("cli-color");
const green = clc.greenBright;
const white = clc.white;
const redBright = clc.redBright;

module.exports = function (RED) {

    function SpeechConfig(config) {

    }
    RED.nodes.registerType("NICP-Speech Config", SpeechConfig, {
        credentials: {
            token: {
                type: "text"
            }
        }
    });










    function SpeechIn(config) {

        RED.nodes.createNode(this, config);

        this.property = config.property;

        let node = this;

        let inputCallback = function (msg) {

        };
        node.on("input", inputCallback);
    }
    RED.nodes.registerType("NICP-Speech In", SpeechIn);







    function SpeechOut(config) {

        RED.nodes.createNode(this, config);

        this.property = config.property;

        let node = this;

        let inputCallback = function (msg) {

        };
        node.on("input", inputCallback);
    }
    RED.nodes.registerType("NICP-Speech Out", SpeechOut);
};