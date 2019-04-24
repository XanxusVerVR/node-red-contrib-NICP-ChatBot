const _ = require("underscore");
const moment = require("moment");
const q = require("./lib/xanxus-queue");
const ChatLog = require("./lib/chat-log");
const ChatContextStore = require("./lib/chat-context-store");
const helpers = require("./lib/facebook/facebook");
const utils = require("./lib/helpers/utils");
const request = require("request").defaults({ encoding: null });
const Bot = require("./lib/facebook/messenger-bot");
const clc = require("cli-color");

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
        this.serverLocation = config.serverLocation;
        this.isHttps = config.isHttps;

        if (config.usernames) {

            this.usernames = _(config.usernames.split(",")).chain()
                .map(function (userId) {
                    return userId.match(/^[a-zA-Z0-9_]+?$/) ? userId : null;
                })
                .compact()
                .value();
        }
        this.handleMessage = function (botMsg) {
            /*
             { sender: { id: "10153461620831415" },
             recipient: { id: "141972351547" },
             timestamp: 1468868282071,
             message:
             { mid: "mid.1468868282014:a9429329545544f523",
             seq: 334,
             text: "test" },
             transport: "facebook" }
             */

            const facebookBot = this;

            // mark the original message with the platform
            botMsg = _.extend({}, botMsg, { transport: "facebook" });

            let userId = botMsg.sender.id;
            let chatId = botMsg.sender.id;
            let messageId = botMsg.message != null ? botMsg.message.mid : null;
            // todo fix this
            //let isAuthorized = node.config.isAuthorized(username, userId);
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
                        console.log(`currentConversationNode 1`);
                        // emit message directly the node where the conversation stopped
                        RED.events.emit("node:" + currentConversationNode, msg);
                    } else {
                        console.log(`relay 2`);
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

                    console.log(grey("--------------- Facebook Webhook Start ----------------"));
                    let port;
                    if (node.isHttps) {
                        port = "";
                    }
                    else {
                        port = ":" + RED.settings.get("uiPort");
                    }
                    console.log(green("Webhook URL: ") + white("" + (node.isHttps ? "https" : "http") + "://" + (node.serverLocation ? node.serverLocation : "localhost") + port + "/nicp/facebook" + this.webhookURL));
                    console.log(green("Verify token is: ") + white(this.verify_token));
                    console.log(grey("--------------- Facebook Webhook End ----------------"));

                    this.bot.expressMiddleware(RED.httpNode);
                    this.bot.on("message", this.handleMessage.bind(this.bot));
                    this.bot.on("postback", this.handleMessage.bind(this.bot));
                    this.bot.on("account_linking", this.handleMessage.bind(this.bot));
                }
            }
        }
        this.on("close", function (done) {
            let endpoints = ["/nicp/facebook" + node.credentials.webhookURL, '/nicp/facebook/_status' + node.credentials.webhookURL];
            // remove middlewarFe for facebook callback
            let routesCount = RED.httpNode._router.stack.length;
            _(RED.httpNode._router.stack).each(function (route, i, routes) {
                if (route != null && route.route != null) {
                    if (_.contains(endpoints, route.route.path)) {
                        routes.splice(i, 1);
                    }
                }
            });
            if (RED.httpNode._router.stack.length >= routesCount) {
                console.log("ERROR: improperly removed Facebook messenger routes, this will cause unexpected results and tricky bugs");
            }
            // this.bot = null;//當流程修改重新部署，會把bot物件清空，這樣bot的getProfile方法就沒了，故機器人可能就不會回話。且會出現這個錯誤"TypeError: Cannot read property 'getProfile' of null"
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
                        case "audio":
                            // download the audio into a buffer
                            helpers.downloadFile(attachment.payload.url)
                                .then(function (buffer) {
                                    resolve({
                                        chatId: chatId,
                                        messageId: messageId,
                                        type: "audio",
                                        content: buffer,
                                        date: moment(botMsg.timestamp),
                                        inbound: true
                                    });
                                })
                                .catch(function () {
                                    reject("Unable to download " + attachment.payload.url);
                                });
                            break;
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

    RED.nodes.registerType("NICP-facebook-node", FacebookBotNode, {
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
            }
        }
    });

    function FacebookInNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        this.bot = config.bot;

        this.config = RED.nodes.getNode(this.bot);
        if (this.config) {
            this.status({ fill: "red", shape: "ring", text: "disconnected" });

            node.bot = this.config.bot;

            if (node.bot) {
                this.status({ fill: "green", shape: "ring", text: "connected" });

                node.bot.on("relay", function (message, error) {
                    if (error != null) {
                        node.error(error);
                    } else {
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
    RED.nodes.registerType("NICP-facebook-receive", FacebookInNode);


    function FacebookOutNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        this.bot = config.bot;
        this.track = config.track;

        this.config = RED.nodes.getNode(this.bot);
        if (this.config) {
            this.status({ fill: "red", shape: "ring", text: "disconnected" });

            node.bot = this.config.bot;

            if (node.bot) {
                this.status({ fill: "green", shape: "ring", text: "connected" });
            } else {
                node.warn("no bot in config.");
            }
        } else {
            node.warn("no config.");
        }

        function sendMeta(msg) {
            return new Promise(function (resolve, reject) {

                let type = msg.payload.type;
                let bot = node.bot;

                let reportError = function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                };

                switch (type) {
                    case "persistent-menu":
                        if (msg.payload.command === "set") {
                            let items = helpers.parseButtons(msg.payload.items);
                            // for some reason the called the same button as web_url and not url
                            items.forEach(function (item) {
                                item.type = item.type === "url" ? "web_url" : item.type;
                            });
                            bot.setPersistentMenu(items, msg.payload.composerInputDisabled, reportError);
                        } else if (msg.payload.command === "delete") {
                            bot.removePersistentMenu(reportError);
                        }
                        break;

                    default:
                        reject();
                }

            });
        }

        function sendMessage(msg) {

            return new Promise(function (resolve, reject) {

                let type = msg.payload.type;
                let bot = node.bot;
                let credentials = node.config.credentials;
                let elements = null;
                let reportError = function (err) {
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
                            msg.payload.chatId,
                            {
                                text: msg.payload.content,
                                quick_replies: [
                                    {
                                        "content_type": "location"
                                    }
                                ]
                            },
                            reportError
                        );
                        break;

                    case "list-template":
                        // translate elements into facebook format
                        elements = msg.payload.elements.map(function (item) {
                            let element = {
                                title: item.title,
                                buttons: helpers.parseButtons(item.buttons)
                            };
                            if (!_.isEmpty(item.subtitle)) {
                                element.subtitle = item.subtitle;
                            }
                            if (!_.isEmpty(item.imageUrl)) {
                                element.image_url = item.imageUrl;
                            }
                            if (_.isEmpty(element.buttons)) {// 當沒有button屬性時要把他移除，不然傳到Messenger會錯
                                delete element.buttons;
                            }
                            return element;
                        });
                        // sends
                        bot.sendMessage(
                            msg.payload.chatId,
                            {
                                attachment: {
                                    type: "template",
                                    payload: {
                                        template_type: "list",
                                        image_aspect_ratio: msg.payload.aspectRatio,
                                        sharable: msg.payload.sharable,
                                        elements: elements
                                    }
                                }
                            },
                            reportError
                        );
                        break;

                    case "generic-template":
                        // translate elements into facebook format
                        elements = msg.payload.elements.map(function (item) {
                            let element = {
                                title: item.title,
                                buttons: helpers.parseButtons(item.buttons)
                            };
                            if (!_.isEmpty(item.subtitle)) {
                                element.subtitle = item.subtitle;
                            }
                            if (!_.isEmpty(item.imageUrl)) {
                                element.image_url = item.imageUrl;
                            }
                            if (_.isEmpty(element.buttons)) {// 當沒有button屬性時要把他移除，不然傳到Messenger會錯
                                delete element.buttons;
                            }
                            return element;
                        });
                        // sends
                        bot.sendMessage(
                            msg.payload.chatId,
                            {
                                attachment: {
                                    type: "template",
                                    payload: {
                                        template_type: "generic",
                                        image_aspect_ratio: msg.payload.aspectRatio,
                                        sharable: msg.payload.sharable,
                                        elements: elements
                                    }
                                }
                            },
                            reportError
                        );
                        break;
                    case "receipt-template":
                        // translate elements into facebook format
                        elements = msg.payload.elements.map(function (item) {
                            let element = {
                                title: item.title,
                                price: item.price
                            };
                            if (!_.isEmpty(item.subtitle)) {
                                element.subtitle = item.subtitle;
                            }
                            if (!_.isEmpty(item.imageUrl)) {
                                element.image_url = item.imageUrl;
                            }
                            if (!_.isEmpty(item.quantity)) {
                                element.quantity = item.quantity;
                            }
                            if (!_.isEmpty(item.currency)) {
                                element.currency = item.currency;
                            }
                            return element;
                        });
                        // sends
                        bot.sendMessage(
                            msg.payload.chatId,
                            {
                                attachment: {
                                    type: "template",
                                    payload: {
                                        template_type: "receipt",
                                        recipient_name: msg.payload.recipientName,
                                        order_number: msg.payload.orderNumber,
                                        currency: msg.payload.currency,
                                        payment_method: msg.payload.paymentMethod,
                                        timestamp: msg.payload.timestamp,
                                        summary: {
                                            total_cost: msg.payload.summary.totalCost
                                        },
                                        elements: elements
                                    }
                                }
                            },
                            reportError
                        );
                        break;
                    case "quick-replies":
                        // send
                        bot.sendMessage(
                            msg.payload.chatId,
                            {
                                text: msg.payload.content,
                                quick_replies: helpers.parseButtons(msg.payload.buttons)
                            },
                            reportError
                        );
                        break;

                    case "inline-buttons":
                        bot.sendMessage(
                            msg.payload.chatId,
                            {
                                attachment: {
                                    type: "template",
                                    payload: {
                                        template_type: "button",
                                        text: msg.payload.content,
                                        buttons: helpers.parseButtons(msg.payload.buttons)
                                    }
                                }
                            },
                            reportError
                        );
                        break;

                    case "message":
                        bot.sendMessage(
                            msg.payload.chatId,
                            {
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
                                        "image_url": "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center="
                                            + lat + "," + lon + "&zoom=16&markers=" + lat + "," + lon,
                                        "item_url": "http:\/\/maps.apple.com\/maps?q=" + lat + "," + lon + "&z=16"
                                    }
                                }
                            }
                        };

                        bot.sendMessage(
                            msg.payload.chatId,
                            {
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

                    case "video":
                        helpers.uploadBuffer({
                            recipient: msg.payload.chatId,
                            type: "video",
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
        let handler = function (msg) {
            node.send(msg);
        };
        RED.events.on("node:" + config.id, handler);

        this.on("input", function (msg) {
            // check if the message is from facebook
            if (msg.originalMessage != null && msg.originalMessage.transport !== "facebook") {
                // exit, it"s not from facebook
                return;
            }
            // try to send the meta first (those messages that doesn"t require a valid payload)
            sendMeta(msg)
                .then(function () {
                    // ok, meta sent, stop here
                }, function (error) {
                    // if here, either there was an error or no met message was sent
                    if (error != null) {
                        node.error(error);
                    } else {
                        // check payload
                        let payloadError = utils.hasValidPayload(msg);
                        if (payloadError != null) {
                            // invalid payload
                            node.error(payloadError);
                        } else {

                            // payload is valid, go on
                            let track = node.track;
                            let chatContext;
                            try {
                                chatContext = msg.chat();
                            } catch (error) {
                                console.log("msg.chat()不存在，有可能是直接從外部傳的");
                            }

                            // check if this node has some wirings in the follow up pin, in that case
                            // the next message should be redirected here
                            if (chatContext != null && track && !_.isEmpty(node.wires[0])) {
                                chatContext.set("currentConversationNode", node.id);
                                chatContext.set("currentConversationNode_at", moment());
                            }

                            let chatLog = new ChatLog(chatContext);

                            chatLog.log(msg, node.config.log)
                                .then(function () {
                                    return sendMessage(msg);
                                })
                                .then(function () {
                                    // we"re done
                                }, function (err) {
                                    node.error(err);
                                });
                        } // end valid payload
                    } // end no error
                }); // end then
        });
        // cleanup on close
        this.on("close", function () {
            RED.events.removeListener("node:" + config.id, handler);
        });
    }
    RED.nodes.registerType("NICP-facebook-send", FacebookOutNode);
};