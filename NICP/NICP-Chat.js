const q = require("./lib/xanxus-queue");
const textConversationContext = require("./lib/TextConversationContext");
const TextConversationContext = textConversationContext.TextConversationContext;
const _ = require("underscore");
const prettyjson = require('prettyjson');
const rp = require("request-promise");
const moment = require("moment");
const crypto = require("crypto"); //引用可以產生亂數字串的模組
const cors = require("cors");
const clc = require("cli-color");
const green = clc.greenBright;
const white = clc.white;
const grey = clc.blackBright;
module.exports = function (RED) {
    // 此區塊的程式，只有在Node-RED一啟動的時候，才會執行一次
    const facebookWithTextContext = new TextConversationContext();
    let count = 1;
    const queryQueue = new q();
    function ChatConfig(config) {
        // 每次Node-RED啟動時、重新部署時 會執行一次

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
            if (queryQueue.size() != 0) {
                console.log(queryQueue.size());
                msg.query = queryQueue.last();
                queryQueue.remove();
            }
            msg.context = context;
            let _textOutNodeId = facebookWithTextContext.textOutNodeId;
            // console.log(`這次的Chat In msg是：`);
            // console.log(prettyjson.render(msg, { noColor: false }));
            if (msg.context.textOutNodeId) {//這裡就等於在呼叫get()了。這是要給Chat節點自己的Track Conversation用的
                console.log(`-----------------分枝1 Chat節點自己的Track Conversation-----------------`);
                RED.events.emit("node:" + msg.context.textOutNodeId, msg);
                msg.context.textOutNodeId = "";
            }
            else if ((count != 0 || !_.isEmpty(_textOutNodeId)) && msg.originalMessage.transport == "facebook" || msg.originalMessage.transport == "slack") {// 如果它存在，表示對話正在進行中，且是由Facebook轉交給Chat節點
                // facebookWithTextContext.textOutNodeId = "";
                console.log(`-----------------分枝2 Facebook In後面接Chat Out的Track Conversation，這時count是: ${count}-----------------`);
                RED.events.emit("facebookWithText:" + _textOutNodeId, msg);
                // facebookWithTextContext.clear();
            }
            else {// 將訊息傳給 Chat In
                console.log(`-----------------分枝3-----------------`);
                node.emit("relay", msg);
            }
            res.status(response.statusCode).send(response);
        };

        RED.httpNode.post(node.webhookPath, corsHandler, postCallback);

        if (!_.isEmpty(node.webhookPath) && !_.isEmpty(node.serverLocation)) {
            console.log(grey("--------------- Chat Webhook Start ----------------"));
            let port;
            let uiPort = RED.settings.get("uiPort");
            if (node.isHttps) {
                port = "";
            }
            else {
                port = ":" + uiPort;
            }
            console.log(green("Webhook URL: ") + white("" + (node.isHttps ? "https" : "http") + "://" + (node.serverLocation ? node.serverLocation : "localhost") + port + node.webhookPath));
            console.log(grey("--------------- Chat Webhook End ----------------"));
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
    RED.nodes.registerType("NICP-Chat Config", ChatConfig);










    function TextIn(config) {

        RED.nodes.createNode(this, config);

        this.botConfigData = RED.nodes.getNode(config.botConfigData);
        this.name = config.name || "My Chat In Node";

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

        // 這一段竟然會讓測試程式抓不到config的資料
        node.botConfigData.on("relay", function (msg, error) {
            if (error != null) {
                node.error(error);
            } else {
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("NICP-Chat In", TextIn);







    function TextOut(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Chat Out Node";
        this.botConfigData = RED.nodes.getNode(config.botConfigData);
        this.textConfigRoleNode = RED.nodes.getNode(config.textConfigRoleNode);
        this.track = config.track;
        this.outputs = config.outputs;

        let isFirst = false;//用來表示是不是第一次訊息
        const originalMessengeUserIdQueue = new q();//儲存顧客的使用者ID
        const msgQueue = new q();

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

        //當Chat Out沒有選擇或設置某個角色時，credentials會null，所以這裡一定要做一個判斷
        let outputRoleUserID;
        if (node.textConfigRoleNode) {
            outputRoleUserID = node.textConfigRoleNode.credentials.targetUserID;
        }
        else {
            outputRoleUserID = "";
        }

        // 將訊息傳給外部訊息平台
        let sendMessage = function _sendMessage(msg, node) {
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

        //用來給text節點自己用的Handler，如流程中in跟out只有text節點，且有對話追蹤
        let textHandler = function _textHandler(msg) {
            node.send(msg);
        };

        //用來給facebook in 連接到 text out，且text out有設定對話追蹤的流程用的Handler
        let facebookHandler = function _facebookHandler(msg) {
            let m = originalMessengeUserIdQueue.last();
            msg.payload.chatId = m;//將Track Conversation之後使用者的輸出的UserID設為最一開始Facebook In進來的
            originalMessengeUserIdQueue.remove();
            node.send(msg);
            count--;

            // 當訊息的queue裡面有東西，也就是不是0，那就要再把其他使用者的請求訊息送出給老闆
            if (msgQueue.size() != 0) {
                let msgAndNodeObject = msgQueue.last();
                setTimeout(function () {
                    sendMessage(msgAndNodeObject.waiteThisFacebookOutNodeMsg, msgAndNodeObject.waiteThisFacebookOutNode);
                }, 600);
                msgQueue.remove();
            }
            // 如果是0，表示訊息queue沒存東西，那就設回false，回到初始狀態，好讓下次新的對話能回到初始狀態，從頭開始
            else {
                isFirst = false;
            }
        };

        RED.events.on("facebookWithText:" + node.id, facebookHandler);
        RED.events.on("node:" + node.id, textHandler);

        let inputCallback = function _inputCallback(msg) {
            console.log(`Chat Out InputCallback !`);
            console.log(prettyjson.render(msg, { noColor: false }));
            originalMessengeUserIdQueue.add(msg.payload.chatId);
            if (node.track && !_.isEmpty(node.wires[0])) {
                if (msg.originalMessage.transport == "facebook" || msg.originalMessage.transport == "slack") {
                    facebookWithTextContext.textOutNodeId = node.id;
                    facebookWithTextContext.transport = msg.originalMessage.transport;
                    facebookWithTextContext.chatId = msg.payload.chatId;
                    if (msg.query) {
                        queryQueue.add(msg.query);
                    }
                }
                // 如果msg是由Facebook In傳進來，那msg不會有context物件。也就是當msg是由Chat In進來，這裡的動作才要做。
                if (!_.isEmpty(msg.context)) {
                    msg.context.textOutNodeId = node.id;
                }
            }
            // 當第一次訊息已經送出，就不要寄出第二次之後的訊息，先把它存到Queue裡
            // 當這個Chat Out後面沒有接節點了，表示流程要結束。所以如果後面有接節點，表示流程還沒結束，這時就要把訊息存到Queue中
            if (isFirst && !_.isEmpty(node.wires[0])) {
                msgQueue.add({
                    waiteThisFacebookOutNodeMsg: msg,
                    waiteThisFacebookOutNode: node
                });
                count++;
            }
            else {
                isFirst = true;// 第一次訊息進來了，設為true，記錄一下
                sendMessage(msg, node);
            }
        };
        node.on("input", inputCallback);
        node.on("close", function () {
            isFirst = false;
            originalMessengeUserIdQueue.clear();
            msgQueue.clear();
            RED.events.removeListener("node:" + node.id, textHandler);
            RED.events.removeListener("facebookWithText:" + node.id, facebookHandler);
            // RED.events.removeAllListeners(); //這行很像會影響到Facebook的Webhook端點，就是重新部署後，明明有接收到Messenger傳來的訊息，但流程中訊息卻沒輸出、出現。
        });
    }
    RED.nodes.registerType("NICP-Chat Out", TextOut);










    //定義角色的節點在這
    function TextRole(config) {
        RED.nodes.createNode(this, config);
    }
    RED.nodes.registerType("NICP-Chat Config Role", TextRole, {
        credentials: {
            targetUserID: {
                type: "text"
            }
        }
    });
};