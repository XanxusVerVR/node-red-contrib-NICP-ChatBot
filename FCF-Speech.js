const q = require("./lib/xanxus-queue");
const _ = require("underscore");
const moment = require("moment");
const cors = require("cors");
// console.log(moment().format("YYYY-MM-DD HH:mm:ss"));//2019-03-31 22:38:10
const clc = require("cli-color");
const green = clc.greenBright;
const white = clc.white;
const redBright = clc.redBright;

module.exports = function (RED) {

    function SpeechConfig(config) {

        RED.nodes.createNode(this, config);

        this.sendAPIUrl = config.sendAPIUrl;
        this.webhookPath = `/nicp${config.webhookPath}`;
        this.isHttps = config.isHttps;
        this.serverLocation = config.serverLocation;

        const node = this;
        console.log(`node.webhookPath:`);
        console.log(node.webhookPath);
        let corsHandler = function (req, res, next) {
            next();
        };

        if (RED.settings.httpNodeCors) {
            corsHandler = cors(RED.settings.httpNodeCors);
            RED.httpNode.options("*", corsHandler);
        }
        let postCallback = function _postCallback(req, res) {
            let msg = {
                payload: req.body
            };
            node.emit("relay", msg);
            res.status(200).send("POST request is success!");
        };

        RED.httpNode.post(node.webhookPath, corsHandler, postCallback);

        node.on("close", function () {
            const node = this;
            RED.httpNode._router.stack.forEach(function (route, i, routes) {
                if (route.route && route.route.path === node.webhookPath) {
                    routes.splice(i, 1);
                }
            });
        });
    }
    RED.nodes.registerType("NICP-Speech Config", SpeechConfig);










    function SpeechIn(config) {

        RED.nodes.createNode(this, config);

        this.botConfigData = RED.nodes.getNode(config.botConfigData);
        this.name = config.name || "My Speech In Node";

        const node = this;

        node.botConfigData.on("relay", function (msg, error) {
            if (error != null) {
                node.error(error);
            } else {
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("NICP-Speech In", SpeechIn);







    function SpeechOut(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Speech Out Node";
        this.botConfigData = RED.nodes.getNode(config.botConfigData);
        this.outputs = config.outputs;

        const node = this;
        
        let inputCallback = function _inputCallback(msg) {

        };
        node.on("input", inputCallback);
    }
    RED.nodes.registerType("NICP-Speech Out", SpeechOut);
};