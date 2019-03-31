const q = require("./lib/xanxus-queue");
const _ = require("underscore");
const rp = require("request-promise");
const moment = require("moment");
const request = require("request");
const cors = require("cors");
// console.log(moment().format("YYYY-MM-DD HH:mm:ss"));//2019-03-31 22:38:10
const clc = require("cli-color");
const green = clc.greenBright;
const white = clc.white;
const redBright = clc.redBright;

module.exports = function (RED) {

    function SpeechConfig(config) {

        RED.nodes.createNode(this, config);
        this.botName = config.botName;
        this.sendAPIUrl = config.sendAPIUrl;
        this.webhookPath = `/nicp${config.webhookPath}`;
        this.isHttps = config.isHttps;
        this.serverLocation = config.serverLocation;

        const node = this;

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
            msg.payload.botName = node.botName;
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

        if (!_.isEmpty(node.botConfigData)) {
            node.status({
                fill: "green",
                shape: "ring",
                text: "connected"
            });
        }
        else {
            node.status({
                fill: "red",
                shape: "ring",
                text: "disconnected"
            });
        }

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
        this.speechConfigRoleNode = RED.nodes.getNode(config.speechConfigRoleNode);
        this.outputs = config.outputs;

        const node = this;

        //當Speech Out沒有選擇或設置某個角色時，credentials會null，所以這裡一定要做一個判斷
        let outputRoleUserID;
        if (node.speechConfigRoleNode) {
            outputRoleUserID = node.speechConfigRoleNode.credentials.targetUserID;
        }
        else {
            outputRoleUserID = "";
        }
        console.log(`outputRoleUserID:`);
        console.log(outputRoleUserID);

        let inputCallback = function _inputCallback(msg) {
            console.log(msg);
            let options = {
                method: "POST",
                uri: node.botConfigData.sendAPIUrl,
                body: {
                    roleName: msg.payload.botName,
                    recipientId: "8012012189105650",//老闆的ID 這裡要再做個處理，如果節點上有設置角色，那就用節點的，不然就用原本前面流程的顧客ID ??
                    originalSenderId: "1254459154682919",//Messenger端的顧客User ID
                    message: {
                        text: "老闆，26桌的顧客要開電扇，你要讓他開嗎？"
                    }
                },
                json: true // Automatically stringifies the body to JSON
            };

            rp(options)
                .then(function (parsedBody) {
                })
                .catch(function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
        };
        node.on("input", inputCallback);
    }
    RED.nodes.registerType("NICP-Speech Out", SpeechOut);










    //定義角色的節點在這
    function SpeechRole(config) {
        RED.nodes.createNode(this, config);
    }
    RED.nodes.registerType("NICP-Speech Config Role", SpeechRole, {
        credentials: {
            targetUserID: {
                type: "text"
            }
        }
    });
};