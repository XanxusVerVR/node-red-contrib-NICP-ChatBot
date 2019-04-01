const q = require("./lib/xanxus-queue");
const speechConversationContext = require("./lib/SpeechConversationContext");
const SpeechConversationContext = speechConversationContext.SpeechConversationContext;
const _ = require("underscore");
const rp = require("request-promise");
const moment = require("moment");
const crypto = require("crypto"); //引用可以產生亂數字串的模組
const cors = require("cors");
const clc = require("cli-color");
const green = clc.greenBright;
const white = clc.white;
const grey = clc.blackBright;
module.exports = function (RED) {

    function SpeechConfig(config) {

        RED.nodes.createNode(this, config);
        this.botName = config.botName;
        this.sendAPIUrl = config.sendAPIUrl;
        this.webhookPath = `/nicp${config.webhookPath}`;
        this.isHttps = config.isHttps;
        this.serverLocation = config.serverLocation;

        let context = new SpeechConversationContext();

        const node = this;

        let corsHandler = function (req, res, next) {
            next();
        };

        if (RED.settings.httpNodeCors) {
            corsHandler = cors(RED.settings.httpNodeCors);
            RED.httpNode.options("*", corsHandler);
        }
        let postCallback = function _postCallback(req, res) {
            let response = {
                date: moment().format("YYYY-MM-DD HH:mm:ss")
            };
            if (!req.body.hasOwnProperty("roleName") || !req.body.hasOwnProperty("senderId") || !req.body.hasOwnProperty("message") || !req.body.message.hasOwnProperty("text")) {
                response.statusCode = 400;
            }
            else {
                response.statusCode = 200;
            }
            let msg = {
                payload: {
                    botName: node.botName,
                    chatId: req.body.senderId,
                    roleName: req.body.roleName,
                    messageId: crypto.randomBytes(43).toString("hex"),
                    type: "message",
                    content: req.body.message.text,
                    date: req.body.date,
                },
                originalMessage: {
                    transport: "speech",
                    chat: {
                        id: req.body.senderId
                    }
                }
            };
            msg.context = context;
            if (msg.context.speechOutNodeId) {//這裡就等於在呼叫get()了
                RED.events.emit("node:" + msg.context.speechOutNodeId, msg);
                msg.context.speechOutNodeId = "";
            }
            else {
                node.emit("relay", msg);
            }
            res.status(response.statusCode).send(response);
        };

        RED.httpNode.post(node.webhookPath, corsHandler, postCallback);

        if (!_.isEmpty(node.webhookPath) && !_.isEmpty(node.serverLocation)) {
            console.log(grey("--------------- Speech Webhook Start ----------------"));
            let port;
            let uiPort = RED.settings.get("uiPort");
            if (node.isHttps) {
                port = "";
            }
            else {
                port = ":" + uiPort;
            }
            console.log(green("Webhook URL: ") + white("" + (node.isHttps ? "https" : "http") + "://" + (node.serverLocation ? node.serverLocation : "localhost") + port + node.webhookPath));
            console.log(grey("--------------- Speech Webhook End ----------------"));
        }

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
        this.track = config.track;
        this.outputs = config.outputs;

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

        //當Speech Out沒有選擇或設置某個角色時，credentials會null，所以這裡一定要做一個判斷
        let outputRoleUserID;
        if (node.speechConfigRoleNode) {
            outputRoleUserID = node.speechConfigRoleNode.credentials.targetUserID;
        }
        else {
            outputRoleUserID = "";
        }

        let handler = function _handler(msg) {
            node.send(msg);
        };
        RED.events.on("node:" + node.id, handler);

        let inputCallback = function _inputCallback(msg) {
            if (node.track && !_.isEmpty(node.wires[0])) {
                msg.context.speechOutNodeId = node.id;
            }
            let options = {
                method: "POST",
                uri: node.botConfigData.sendAPIUrl,
                body: {
                    roleName: msg.payload.botName,
                    recipientId: msg.payload.chatId,//老闆的ID 這裡要再做個處理，如果節點上有設置角色，那就用節點的，不然就用原本前面流程的顧客ID ??
                    originalSenderId: "1254459154682919",//Messenger端的顧客User ID
                    message: {
                        text: msg.payload.content
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
        node.on("close", function () {
            RED.events.removeListener("node:" + node.id, handler);
        });
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