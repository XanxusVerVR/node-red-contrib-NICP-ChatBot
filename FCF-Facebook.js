const _ = require("underscore");
const moment = require("moment");
const ChatLog = require("./lib/chat-log");
const ChatContextStore = require("./lib/chat-context-store");
const helpers = require("./lib/facebook/facebook");
const utils = require("./lib/helpers/utils");
const util = require("util");
const request = require("request").defaults({
    encoding: null
});
const Bot = require("./lib/facebook/messenger-bot");
const clc = require("cli-color");

const DEBUG = false;
const green = clc.greenBright;
const white = clc.white;
const grey = clc.blackBright;

module.exports = function (RED) {

    function FacebookBotNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        this.botname = config.botname;
        this.log = config.log;

        this.usernames = [];
        if (config.usernames) {

            this.usernames = _(config.usernames.split(",")).chain()
                .map(function (userId) {
                    return userId.match(/^[a-zA-Z0-9_]+?$/) ? userId : null;
                })
                .compact()
                .value();
        }


        this.handleMessage = function (botMsg) {


            let facebookBot = node.bot;

            if (DEBUG) {
                // eslint-disable-next-line no-console
                console.log("START:-------");
                // eslint-disable-next-line no-console
                console.log(botMsg);
                // eslint-disable-next-line no-console
                console.log("END:-------");
            }

            // mark the original message with the platform
            botMsg = _.extend({}, botMsg, {
                transport: "facebook"
            });

            let userId = botMsg.sender.id;
            let chatId = botMsg.sender.id;
            let messageId = botMsg.message != null ? botMsg.message.mid : null;
            // todo fix this

            let isAuthorized = true;
            let chatContext = ChatContextStore.getOrCreateChatContext(node, chatId);

            let payload = null;
            // decode the message, eventually download stuff
            node.getMessageDetails(botMsg, node.bot)
                .then(function (obj) {
                    payload = obj;
                    return helpers.getOrFetchProfile(userId, node.bot);
                })
                .then(function (profile) {
                    // store some information
                    chatContext.set("chatId", chatId);
                    chatContext.set("messageId", messageId);
                    chatContext.set("userId", userId);
                    chatContext.set("firstName", profile.first_name);
                    chatContext.set("lastName", profile.last_name);
                    chatContext.set("authorized", isAuthorized);
                    chatContext.set("transport", "facebook");
                    chatContext.set("message", payload.content);

                    let chatLog = new ChatLog(chatContext);
                    return chatLog.log({
                        payload: payload,
                        originalMessage: {
                            transport: "facebook",
                            chat: {
                                id: chatId
                            }
                        },
                        chat: function () {
                            return ChatContextStore.getChatContext(node, chatId);
                        }
                    }, node.log);
                })
                .then(function (msg) {

                    let currentConversationNode = chatContext.get("currentConversationNode");
                    // if a conversation is going on, go straight to the conversation node, otherwise if authorized
                    // then first pin, if not second pin
                    if (currentConversationNode != null) {
                        // void the current conversation
                        chatContext.set("currentConversationNode", null);
                        // emit message directly the node where the conversation stopped
                        //使用者第一句話以外的訊息會從這裡觸發，並傳進來
                        RED.events.emit("node:" + currentConversationNode, msg);
                    } else {
                        // 使用者第一句話或訊息會從這裡觸發並接收進來
                        facebookBot.emit("relay", msg);
                    }

                })
                .catch(function (error) {
                    facebookBot.emit("relay", null, error);
                });
        };


        if (this.credentials) {
            this.token = this.credentials.token;
            this.app_secret = this.credentials.app_secret;
            this.verify_token = this.credentials.verify_token;
            this.webhookURL = this.credentials.webhookURL;

            if (this.token) {
                this.token = this.token.trim();

                if (!this.bot) {

                    this.bot = new Bot({
                        token: this.token,
                        verify: this.verify_token,
                        app_secret: this.app_secret,
                        webhookURL: this.webhookURL
                    });

                    let uiPort = RED.settings.get("uiPort");
                    // eslint-disable-next-line no-console
                    console.log("");
                    // eslint-disable-next-line no-console
                    console.log(grey("------ Facebook Webhook ----------------"));
                    // eslint-disable-next-line no-console
                    console.log(green("Webhook URL: ") + white("http://localhost" + (uiPort != "80" ? ":" + uiPort : "") +
                        "/redbot/facebook" + this.webhookURL));
                    // eslint-disable-next-line no-console
                    console.log(green("Verify token is: ") + white(this.verify_token));
                    // eslint-disable-next-line no-console
                    console.log("");
                    // mount endpoints on local express
                    this.bot.expressMiddleware(RED.httpNode);

                    this.bot.on("message", this.handleMessage);
                    this.bot.on("postback", this.handleMessage);
                    this.bot.on("account_linking", this.handleMessage);
                }
            }
        }

        this.on("close", function (done) {
            let endpoints = ["/facebook", "/facebook/_status"];
            // remove middleware for facebook callback
            RED.httpNode._router.stack.forEach(function (route, i, routes) {
                if (route.route && _.contains(endpoints, route.route.path)) {
                    routes.splice(i, 1);
                }
            });
            done();
        });

        this.isAuthorized = function (username, userId) {
            if (node.usernames.length > 0) {
                return node.usernames.indexOf(username) != -1 || node.usernames.indexOf(String(userId)) != -1;
            }
            return true;
        };

        // creates the message details object from the original message
        this.getMessageDetails = function (botMsg) {
            return new Promise(function (resolve, reject) {

                //let userId = botMsg.sender.id;
                let chatId = botMsg.sender.id;
                let messageId = botMsg.message != null ? botMsg.message.mid : null;

                if (!_.isEmpty(botMsg.account_linking)) {
                    resolve({
                        chatId: chatId,
                        messageId: messageId,
                        type: "account-linking",
                        content: botMsg.account_linking.authorization_code,
                        linkStatus: botMsg.account_linking.status,
                        date: moment(botMsg.timestamp),
                        inbound: true
                    });
                    return;
                }

                if (botMsg.message == null) {
                    reject("Unable to detect inbound message for Facebook");
                }

                let message = botMsg.message;
                if (!_.isEmpty(message.quick_reply)) {
                    resolve({
                        chatId: chatId,
                        messageId: messageId,
                        type: "message",
                        content: message.quick_reply.payload,
                        date: moment(botMsg.timestamp),
                        inbound: true
                    });
                    return;
                } else if (!_.isEmpty(message.text)) {
                    resolve({
                        chatId: chatId,
                        messageId: messageId,
                        type: "message",
                        content: message.text,
                        date: moment(botMsg.timestamp),
                        inbound: true
                    });
                    return;
                }

                if (_.isArray(message.attachments) && !_.isEmpty(message.attachments)) {
                    let attachment = message.attachments[0];
                    switch (attachment.type) {
                        case "image":
                            // download the image into a buffer
                            helpers.downloadFile(attachment.payload.url)
                                .then(function (buffer) {
                                    resolve({
                                        chatId: chatId,
                                        messageId: messageId,
                                        type: "photo",
                                        content: buffer,
                                        date: moment(botMsg.timestamp),
                                        inbound: true
                                    });
                                })
                                .catch(function () {
                                    reject("Unable to download " + attachment.payload.url);
                                });
                            break;
                        case "file":
                            // download the image into a buffer
                            helpers.downloadFile(attachment.payload.url)
                                .then(function (buffer) {
                                    resolve({
                                        chatId: chatId,
                                        messageId: messageId,
                                        type: "document",
                                        content: buffer,
                                        date: moment(botMsg.timestamp),
                                        inbound: true
                                    });
                                })
                                .catch(function () {
                                    reject("Unable to download " + attachment.payload.url);
                                });
                            break;
                        case "location":
                            resolve({
                                chatId: chatId,
                                messageId: messageId,
                                type: "location",
                                content: {
                                    latitude: attachment.payload.coordinates.lat,
                                    longitude: attachment.payload.coordinates.long
                                },
                                date: moment(botMsg.timestamp),
                                inbound: true
                            });
                            break;
                    }
                } else {
                    reject("Unable to detect inbound message for Facebook Messenger");
                }
            });
        };
    }

    RED.nodes.registerType("FCF-facebook-node", FacebookBotNode, {
        credentials: {
            token: {
                type: "text"
            },
            app_secret: {
                type: "text"
            },
            verify_token: {
                type: "text"
            },
            webhookURL: {
                type: "text"
            },
            key_pem: {
                type: "text"
            },
            cert_pem: {
                type: "text"
            }
        }
    });

    function FacebookInNode(config) {

        RED.nodes.createNode(this, config);
        let node = this;
        this.bot = config.bot;//config.bot是一個類似98bd3fe8.c4eb5這樣的字串
        this.config = RED.nodes.getNode(this.bot);

        if (this.config) {
            this.status({
                fill: "red",
                shape: "ring",
                text: "disconnected"
            });

            node.bot = this.config.bot;

            if (node.bot) {

                this.status({
                    fill: "green",
                    shape: "ring",
                    text: "connected"
                });

                node.bot.on("relay", function (message, error) {
                    if (error != null) {
                        node.error(error);
                    } else {
                        // 將使用者的第一個傳訊息給下個節點
                        node.send(message);
                    }
                });

            } else {
                node.warn("Please select a chatbot configuration in Facebook Messenger Receiver");
            }
        } else {
            node.warn("Missing configuration in Facebook Messenger Receiver");
        }
    }
    RED.nodes.registerType("FCF-facebook-receive", FacebookInNode);


    function FacebookOutNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        this.bot = config.bot;
        this.track = config.track;//當track有被使用者勾選，那facebook out後面可以再接其他節點，並且使用者的下一個訊息會重新路由至後面接的節點

        //這段主要在設置節點顯示的狀態
        this.config = RED.nodes.getNode(this.bot);
        if (this.config) {
            this.status({
                fill: "red",
                shape: "ring",
                text: "disconnected"
            });

            node.bot = this.config.bot;

            if (node.bot) {
                this.status({
                    fill: "green",
                    shape: "ring",
                    text: "connected"
                });
            } else {
                node.warn("no bot in config.");
            }
        } else {
            node.warn("no config.");
        }

        function sendMeta(msg) {
            return new Promise((resolve, reject) => {

                let type = msg.payload.type;
                let bot = node.bot;

                let reportError = (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                };

                //一般文字訊息type都是message
                switch (type) {
                    case "persistent-menu":
                        bot.setPersistentMenu(msg.payload.items, reportError);
                        break;
                    default:
                        //是message的話，就會跑到這裡，會reject()
                        reject();
                }
            });
        }

        function sendMessage(msg) {
            return new Promise((resolve, reject) => {

                let type = msg.payload.type;
                let bot = node.bot;
                let credentials = node.config.credentials;

                let reportError = (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                };

                switch (type) {
                    case "action":
                        request({
                            method: "POST",
                            json: {
                                recipient: {
                                    id: msg.payload.chatId
                                },
                                "sender_action": "typing_on"
                            },
                            url: "https://graph.facebook.com/v2.6/me/messages?access_token=" + credentials.token
                        }, reportError);
                        break;

                    case "request":
                        // todo error if not location
                        // send
                        bot.sendMessage(
                            msg.payload.chatId, {
                                text: msg.payload.content,
                                quick_replies: [{
                                    "content_type": "location"
                                }]
                            },
                            reportError
                        );
                        break;

                    case "account-link":
                        let attachment = {
                            "type": "template",
                            "payload": {
                                "template_type": "button",
                                "text": msg.payload.content,
                                "buttons": [{
                                    "type": "account_link",
                                    "url": msg.payload.authUrl
                                }]
                            }
                        };
                        bot.sendMessage(
                            msg.payload.chatId, {
                                attachment: attachment
                            },
                            reportError
                        );
                        break;

                    case "inline-buttons":
                        let quickReplies = _(msg.payload.buttons).map(function (button) {
                            let quickReply = {
                                content_type: "text",
                                title: button.label,
                                payload: !_.isEmpty(button.value) ? button.value : button.label
                            };
                            if (!_.isEmpty(button.image_url)) {
                                quickReply.image_url = button.image_url;
                            }
                            return quickReply;
                        });

                        // send
                        bot.sendMessage(
                            msg.payload.chatId, {
                                text: msg.payload.content,
                                quick_replies: quickReplies
                            },
                            reportError
                        );

                        break;

                    case "message":
                        bot.sendMessage(
                            msg.payload.chatId, {
                                text: msg.payload.content
                            },
                            reportError
                        );
                        break;

                    case "location":
                        let lat = msg.payload.content.latitude;
                        let lon = msg.payload.content.longitude;

                        let locationAttachment = {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": {
                                    "element": {
                                        "title": !_.isEmpty(msg.payload.place) ? msg.payload.place : "Position",
                                        "image_url": "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center=" +
                                            lat + "," + lon + "&zoom=16&markers=" + lat + "," + lon,
                                        "item_url": "http:\/\/maps.apple.com\/maps?q=" + lat + "," + lon + "&z=16"
                                    }
                                }
                            }
                        };

                        bot.sendMessage(
                            msg.payload.chatId, {
                                attachment: locationAttachment
                            },
                            reportError
                        );
                        break;

                    case "audio":
                        let audio = msg.payload.content;
                        helpers.uploadBuffer({
                            recipient: msg.payload.chatId,
                            type: "audio",
                            buffer: audio,
                            token: credentials.token,
                            filename: msg.payload.filename
                        }).catch(function (err) {
                            reject(err);
                        });
                        break;

                    case "document":
                        helpers.uploadBuffer({
                            recipient: msg.payload.chatId,
                            type: "file",
                            buffer: msg.payload.content,
                            token: credentials.token,
                            filename: msg.payload.filename,
                            mimeType: msg.payload.mimeType
                        }).catch(function (err) {
                            reject(err);
                        });
                        break;

                    case "photo":
                        let image = msg.payload.content;
                        helpers.uploadBuffer({
                            recipient: msg.payload.chatId,
                            type: "image",
                            buffer: image,
                            token: credentials.token,
                            filename: msg.payload.filename
                        }).catch(function (err) {
                            reject(err);
                        });
                        break;

                    default:
                        reject("Unable to prepare unknown message type");
                }
            });
        }

        // relay message
        //當使用者一說話，就會觸發這個註冊的函式來傳送訊息
        let handler = function (msg) {
            //使用者說的話(除了第一句)都會從這裡傳出去
            node.send(msg);
        };
        //這會註冊一次註冊所有存在的Facebook Out節點，並以類似這樣的node:f48a9360.2482c事件名稱註冊
        RED.events.on("node:" + config.id, handler);

        // cleanup on close
        this.on("close", function () {
            RED.events.removeListener("node:" + config.id, handler);
        });

        this.on("input", function (msg) {
            // 所有機器人要傳給使用者的訊息都會從這裡進來
            // check if the message is from facebook
            if (msg.originalMessage != null && msg.originalMessage.transport !== "facebook") {
                // exit, it"s not from facebook
                return;
            }

            // try to send the meta first (those messages that doesn"t require a valid payload)
            sendMeta(msg)//then()有兩個參數，第一個表示Promise成功(被實現)的function，第二個表示Promise回傳失敗時要做的事的function
                .then(function () {//如果這裡有傳參數進來，那整支程式就會停在這，且這個參數就是從sendMeta的reject方法傳進來的
                    // ok, meta sent, stop here
                }, function (error) {//一般使用者正常傳訊息會執行這裡，且error是undefined，undefined在if else判斷會是false，所以才會從這開始執行
                    // if here, either there was an error or no met message was sent
                    if (error != null) {//error是undefined，undefined和null是相等的，所以程式執行正常的話這裡會false，故這不會執行
                        node.error(error);
                    } else {
                        // check payload
                        let payloadError = utils.hasValidPayload(msg);
                        if (payloadError != null) {//不會跑到這if裡面
                            // invalid payload
                            node.error(payloadError);
                        } else {
                            // payload is valid, go on
                            let track = node.track;
                            let chatContext = msg.chat();
                            // check if this node has some wirings in the follow up pin, in that case
                            // the next message should be redirected here
                            if (chatContext != null && track && !_.isEmpty(node.wires[0])) {
                                chatContext.set("currentConversationNode", node.id);
                                chatContext.set("currentConversationNode_at", moment());
                            }
                            let chatLog = new ChatLog(chatContext);
                            chatLog.log(msg, node.config.log)
                                .then(function () {
                                    sendMessage(msg);
                                });
                        } // end valid payload
                    } // end no error
                }); // end then
        });
    }
    RED.nodes.registerType("FCF-facebook-send", FacebookOutNode);
};