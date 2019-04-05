const q = require("./lib/xanxus-queue");
const textConversationContext = require("./lib/TextConversationContext");
const TextConversationContext = textConversationContext.TextConversationContext;
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
    const facebookWithTextContext = new TextConversationContext();
    function TextConfig(config) {

        RED.nodes.createNode(this, config);
        this.botName = config.botName;
        this.sendAPIUrl = config.sendAPIUrl;
        this.webhookPath = `/nicp${config.webhookPath}`;
        this.isHttps = config.isHttps;
        this.serverLocation = config.serverLocation;

        const context = new TextConversationContext();

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
                    chatId: facebookWithTextContext.chatId || req.body.senderId,
                    roleName: req.body.roleName,
                    messageId: crypto.randomBytes(43).toString("hex"),
                    type: "message",
                    content: req.body.message.text,
                    date: req.body.date,
                },
                originalMessage: {
                    transport: facebookWithTextContext.transport || "text",
                    chat: {
                        id: req.body.senderId
                    }
                }
            };
            msg.context = context;
            if (msg.context.textOutNodeId) {//這裡就等於在呼叫get()了
                RED.events.emit("node:" + msg.context.textOutNodeId, msg);
                msg.context.textOutNodeId = "";
            }
            else if (!_.isEmpty(facebookWithTextContext.textOutNodeId)) {// 如果它存在，表示對話正在進行中，且是由Facebook轉交給Text節點
                RED.events.emit("facebookWithText:" + facebookWithTextContext.textOutNodeId, msg);
                facebookWithTextContext.clear();
            }
            else {// 將訊息傳給 Text In
                node.emit("relay", msg);
            }
            res.status(response.statusCode).send(response);
        };

        RED.httpNode.post(node.webhookPath, corsHandler, postCallback);

        if (!_.isEmpty(node.webhookPath) && !_.isEmpty(node.serverLocation)) {
            console.log(grey("--------------- Text Webhook Start ----------------"));
            let port;
            let uiPort = RED.settings.get("uiPort");
            if (node.isHttps) {
                port = "";
            }
            else {
                port = ":" + uiPort;
            }
            console.log(green("Webhook URL: ") + white("" + (node.isHttps ? "https" : "http") + "://" + (node.serverLocation ? node.serverLocation : "localhost") + port + node.webhookPath));
            console.log(grey("--------------- Text Webhook End ----------------"));
        }

        node.on("close", function () {
            const node = this;
            facebookWithTextContext.clear();
            RED.httpNode._router.stack.forEach(function (route, i, routes) {
                if (route.route && route.route.path === node.webhookPath) {
                    routes.splice(i, 1);
                }
            });
        });
    }
    RED.nodes.registerType("NICP-Text Config", TextConfig);










    function TextIn(config) {

        RED.nodes.createNode(this, config);

        this.botConfigData = RED.nodes.getNode(config.botConfigData);
        this.name = config.name || "My Text In Node";

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
    RED.nodes.registerType("NICP-Text In", TextIn);







    function TextOut(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Text Out Node";
        this.botConfigData = RED.nodes.getNode(config.botConfigData);
        this.textConfigRoleNode = RED.nodes.getNode(config.textConfigRoleNode);
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

        //當Text Out沒有選擇或設置某個角色時，credentials會null，所以這裡一定要做一個判斷
        let outputRoleUserID;
        if (node.textConfigRoleNode) {
            outputRoleUserID = node.textConfigRoleNode.credentials.targetUserID;
        }
        else {
            outputRoleUserID = "";
        }

        //用來給text節點自己用的Handler，如流程中in跟out只有text節點，且有對話追蹤
        let textHandler = function _textHandler(msg) {
            node.send(msg);
        };
        //用來給facebook in 連接到 text out，且text out有設定對話追蹤的流程用的Handler
        let facebookHandler = function _facebookHandler(msg) {
            RED.events.removeListener("facebookWithText:" + node.id, facebookHandler);
            node.send(msg);
        };
        RED.events.on("node:" + node.id, textHandler);

        let inputCallback = function _inputCallback(msg) {
            if (node.track && !_.isEmpty(node.wires[0])) {
                if (msg.originalMessage.transport == "facebook") {
                    facebookWithTextContext.textOutNodeId = node.id;
                    facebookWithTextContext.transport = msg.originalMessage.transport;
                    facebookWithTextContext.chatId = msg.payload.chatId;
                    RED.events.on("facebookWithText:" + node.id, facebookHandler);
                }
                // 如果msg是由Facebook In傳進來，那msg不會有context物件。也就是當msg是由Text In進來，這裡的動作才要做。
                if (!_.isEmpty(msg.context)) {
                    msg.context.textOutNodeId = node.id;
                }
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
            RED.events.removeListener("node:" + node.id, textHandler);
            RED.events.removeListener("facebookWithText:" + node.id, facebookHandler);
            RED.events.removeAllListeners();
        });
    }
    RED.nodes.registerType("NICP-Text Out", TextOut);










    //定義角色的節點在這
    function TextRole(config) {
        RED.nodes.createNode(this, config);
    }
    RED.nodes.registerType("NICP-Text Config Role", TextRole, {
        credentials: {
            targetUserID: {
                type: "text"
            }
        }
    });
};