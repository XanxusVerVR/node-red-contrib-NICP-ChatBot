const _ = require("underscore");
const moment = require("moment");
const q = require("./lib/xanxus-queue");
let msgQueue = new q();
let originalMessengeUserIdQueue = new q();//儲存顧客的使用者ID
const ChatLog = require("./lib/chat-log");
const ChatContextStore = require("./lib/chat-context-store");
const helpers = require("./lib/facebook/facebook");
const utils = require("./lib/helpers/utils");
const request = require("request").defaults({
    encoding: null
});
const Bot = require("./lib/facebook/messenger-bot");
const clc = require("cli-color");

const green = clc.greenBright;
const white = clc.white;
const grey = clc.blackBright;

module.exports = function (RED) {
    //此方法用來將機器人處理好的訊息傳給Messenger平台的使用者
    let sendMessage = function _sendMessage(msg, node) {
        return new Promise((resolve, reject) => {

            let type = msg.payload.type;
            let bot = node.bot;
            let credentials = node.config.credentials;
            //多一個elements的宣告
            let elements = null;

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

                    bot.sendMessage(
                        msg.payload.chatId, {
                            text: msg.payload.content,
                            quick_replies: quickReplies
                        },
                        reportError
                    );

                    break;

                case "message":
                    bot.sendMessage(msg.payload.chatId, {
                        text: msg.payload.content
                    }, reportError);
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
    };

    let globalOutputRoleUserID;//當Facebook Out節點有設置角色ID時，將Messenger ID存入這個變數中
    let trackOpenFacebookOutNodeId;//儲存有打勾Tracking Answer功能的Facebook Out節點的ID
    let originalMessengeUserID;//存放最一開始Facebook In進來的UserID，為了保持Facebook Out在Tracking Answer功能輸出的時候，將輸出的UserID設回原本的
    let isFacebookOutRoleAnswer = false;//用來設置老闆是否回話了嗎 的狀態


    function FacebookBotNode(config) {

        RED.nodes.createNode(this, config);

        this.botname = config.botname;
        this.log = config.log;
        this.serverLocation = config.serverLocation;
        this.isHttps = config.isHttps;
        this.usernames = [];

        const node = this;

        if (config.usernames) {
            this.usernames = _(config.usernames.split(",")).chain()
                .map(function (userId) {
                    return userId.match(/^[a-zA-Z0-9_]+?$/) ? userId : null;
                })
                .compact()
                .value();
        }

        this.handleMessage = function (botMsg) {

            let facebookBot = this;

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
                    //這裡其實是return一個msg物件，return的msg物件從下一個then()進入
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
                    // if a conversation is going on, go straight to the conversation node, otherwise if authorized
                    // then first pin, if not second pin
                    //currentConversationNode存著現在這個將Track Conversation打勾的Facebook Out節點的id，如：fe1956ef.c91568
                    //前面是用來判斷是不是顧客，後面是判斷是不是老闆，如果現在的msg.payload.chatId與設置在Facebook Out的使用者ID相同，表示要將對話轉為等待這個被設置的使用者ID(老闆)
                    if (chatContext.get("currentConversationNode") != null || globalOutputRoleUserID == msg.payload.chatId) {
                        console.log("Facebook Out~~Track Conversation！！");
                        // void the current conversation
                        chatContext.set("currentConversationNode", null);
                        // emit message directly the node where the conversation stopped
                        // 使用者第一句話以外的訊息會從這裡觸發，並傳進來
                        RED.events.emit("node:" + trackOpenFacebookOutNodeId || currentConversationNode, msg);
                        isFacebookOutRoleAnswer = true;
                        if (msgQueue.size() != 0) {
                            let msgAndNodeObject = msgQueue.last();
                            sendMessage(msgAndNodeObject.waiteThisFacebookOutNodeMsg, msgAndNodeObject.waiteThisFacebookOutNode)
                                .then(function () {
                                    console.log("寄出Qu中的msg訊息了!!!!!");
                                    // we"re done
                                }, function (err) {
                                    node.error(err);
                                });
                            msgQueue.remove();
                        }
                        else {
                            console.log("msg的qu沒東西了!");
                            globalOutputRoleUserID = "";
                            isFacebookOutRoleAnswer = false;
                        }
                    } else {
                        console.log("Facebook In！！");
                        // 使用者第一句話或訊息會從這裡觸發並接收進來，並且傳給Facebook In
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
                    console.log(grey("--------------- Facebook Webhook Start ----------------"));
                    // eslint-disable-next-line no-console
                    let port;
                    if (node.isHttps) {
                        port = "";
                    }
                    else {
                        port = ":" + uiPort;
                    }
                    console.log(green("Webhook URL: ") + white("" + (node.isHttps ? "https" : "http") + "://" + (node.serverLocation ? node.serverLocation : "localhost") + port + "/redbot/facebook" + this.webhookURL));
                    // eslint-disable-next-line no-console
                    console.log(green("Verify token is: ") + white(this.verify_token));
                    // eslint-disable-next-line no-console
                    console.log(grey("--------------- Facebook Webhook End ----------------"));
                    // mount endpoints on local express
                    this.bot.expressMiddleware(RED.httpNode);

                    this.bot.on("message", this.handleMessage.bind(this.bot));
                    this.bot.on("postback", this.handleMessage.bind(this.bot));
                    this.bot.on("account_linking", this.handleMessage.bind(this.bot));
                }
            }
        }

        this.on("close", function (done) {
            let endpoints = ["/redbot/facebook" + node.credentials.webhookURL, "/redbot/facebook/_status" + node.credentials.webhookURL];
            // remove middleware for facebook callback
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
            this.bot = null;
            isFacebookOutRoleAnswer = false;
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
            }
        }
    });

    function FacebookInNode(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Facebook In Node";
        this.bot = config.bot;//config.bot是一個類似98bd3fe8.c4eb5這樣的字串
        this.config = RED.nodes.getNode(this.bot);

        const node = this;

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
                        originalMessengeUserID = message.payload.chatId;
                        originalMessengeUserIdQueue.add(originalMessengeUserID);
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

        this.name = config.name || "My Facebook Out Node";
        this.bot = config.bot;
        this.track = config.track;//當track有被使用者勾選，那facebook out後面可以再接其他節點，並且使用者的下一個訊息會重新路由至後面接的節點
        this.fcfFacebookRoleNode = RED.nodes.getNode(config.fcfFacebookRoleNode);
        this.config = RED.nodes.getNode(this.bot);
        let first;//代表顧客第一次說話

        const node = this;

        //當Facebook Out沒有選擇或設置某個角色時，credentials會null，所以這裡一定要做一個判斷
        let outputRoleUserID;
        if (node.fcfFacebookRoleNode) {
            outputRoleUserID = node.fcfFacebookRoleNode.credentials.targetUserID;
        }
        else {
            outputRoleUserID = "";
        }

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

        // relay message
        //當使用者一說話，就會觸發這個註冊的函式來傳送訊息
        let handler = function (msg) {
            //使用者說的話(除了第一句)都會從這裡傳到下個節點
            //也就是說當此Facebook Out有設置Track Conversation的時候，表示要將訊息傳給下個節點
            let m = originalMessengeUserIdQueue.last();
            msg.payload.chatId = m;//將Track Conversation之後使用者的輸出的UserID設為最一開始Facebook In進來的
            originalMessengeUserIdQueue.remove();
            node.send(msg);
        };
        //這會註冊一次註冊所有存在的Facebook Out節點，並以類似這樣的node:f48a9360.2482c事件名稱註冊
        RED.events.on("node:" + config.id, handler);

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
                            // let chatContext = ChatContextStore.getOrCreateChatContext(node, chatId);
                            let chatContext = msg.chat();//chatContext存著六個方法分別為：get、remove、set、dump、all、clear
                            // check if this node has some wirings in the follow up pin, in that case
                            // the next message should be redirected here
                            //當這個Facebook Out有把track打勾時，才會進來這if
                            //經測試，不管track有沒有打勾，都會有東西，不會null
                            if (chatContext != null && track && !_.isEmpty(node.wires[0])) {
                                globalOutputRoleUserID = outputRoleUserID;
                                trackOpenFacebookOutNodeId = node.id;
                                //假設先在一開始的Facebook In進來是顧客，那就把顧客這個物件的currentConversationNode設為空，這樣在包括有Tracking Answer的整個Flow第一次結束後，讓顧客不會又再直接進到有Tracking Answer的節點來開始對話流程
                                if (globalOutputRoleUserID) {
                                    chatContext.set("currentConversationNode", null);
                                }
                                else {
                                    chatContext.set("currentConversationNode", node.id);
                                    chatContext.set("currentConversationNode_at", moment());
                                }
                            }
                            let chatLog = new ChatLog(chatContext);
                            chatLog.log(msg, node.config.log)
                                .then(function () {
                                    //如果有設置要輸出的角色，那就把msg物件要輸出的角色ID換成使用者設置的角色ID(老闆)
                                    msg.payload.chatId = outputRoleUserID || msg.payload.chatId;
                                    //如果 這個Facebook Out有設置角色ID 而且 角色ID不等於自己 而且 老闆還沒回話 而且 count不是0 而且
                                    if (outputRoleUserID && outputRoleUserID != originalMessengeUserID && !isFacebookOutRoleAnswer && first && !_.isEmpty(node.wires[0])) {
                                        msgQueue.add({
                                            waiteThisFacebookOutNodeMsg: msg,
                                            waiteThisFacebookOutNode: node
                                        });
                                        first = false;
                                    }
                                    else {
                                        first = true;
                                        return sendMessage(msg, node);
                                    }
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
            count = 0;
            RED.events.removeListener("node:" + config.id, handler);
        });
    }
    RED.nodes.registerType("FCF-facebook-send", FacebookOutNode);

    //定義角色的節點在這
    function FacebookRole(config) {
        RED.nodes.createNode(this, config);
    }
    RED.nodes.registerType("FCF-facebook-config-role", FacebookRole, {
        credentials: {
            targetUserID: {
                type: "text"
            }
        }
    });
};