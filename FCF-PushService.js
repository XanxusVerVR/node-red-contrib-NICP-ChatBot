const clc = require("cli-color");
const green = clc.greenBright;
const white = clc.white;
const cors = require("cors");
module.exports = function (RED) {
    function PushService(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Push Service Node";

        let node = this;

        let corsHandler = function (req, res, next) {
            next();
        };

        if (RED.settings.httpNodeCors) {
            corsHandler = cors(RED.settings.httpNodeCors);
            RED.httpNode.options("*", corsHandler);
        }

        let postCallback = function (req, res) {
            let msg = {
                payload: {
                    userID: req.body.UserID,
                    content: req.body.Message
                }
            };
            node.send(msg);
            res.status(200).send("POST request is success!");
        };

        RED.httpNode.post(config.url, corsHandler, postCallback);

        if (!config.url) {
            config.url = "/您設置的URL樣式";
        }

        console.log(green(`Push Service節點的ID: `) + white(node.id) + green(` 提供的URL樣式為 `) + white(`https://your_domain${config.url}`));
    }
    RED.nodes.registerType("FCF-PushService", PushService);
};