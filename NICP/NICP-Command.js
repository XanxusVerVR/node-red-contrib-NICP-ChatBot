const _ = require("underscore");
const utils = require("./lib/helpers/utils");
const MessageTemplate = require("./lib/message-template");
const emoji = require("node-emoji");
const mustache = require("mustache");

module.exports = function (RED) {

    function extractTokens(tokens, set) {
        set = set || new Set();
        tokens.forEach(function (token) {
            if (token[0] !== 'text') {
                set.add(token[1]);
                if (token.length > 4) {
                    extractTokens(token[4], set);
                }
            }
        });
        return set;
    }

    function parseContext(key) {
        let match = /^(flow|global)(\[(\w+)\])?\.(.+)/.exec(key);
        if (match) {
            let parts = {};
            parts.type = match[1];
            parts.store = (match[3] === '') ? "default" : match[3];
            parts.field = match[4];
            return parts;
        }
        return undefined;
    }

    function NodeContext(msg, nodeContext, parent, escapeStrings, cachedContextTokens) {
        this.msgContext = new mustache.Context(msg, parent);
        this.nodeContext = nodeContext;
        this.escapeStrings = escapeStrings;
        this.cachedContextTokens = cachedContextTokens;
    }

    NodeContext.prototype = new mustache.Context();

    NodeContext.prototype.lookup = function (name) {
        // try message first:
        try {
            let value = this.msgContext.lookup(name);
            if (value !== undefined) {
                if (this.escapeStrings && typeof value === "string") {
                    value = value.replace(/\\/g, "\\\\");
                    value = value.replace(/\n/g, "\\n");
                    value = value.replace(/\t/g, "\\t");
                    value = value.replace(/\r/g, "\\r");
                    value = value.replace(/\f/g, "\\f");
                    value = value.replace(/[\b]/g, "\\b");
                }
                return value;
            }

            // try flow/global context:
            let context = parseContext(name);
            if (context) {
                let type = context.type;
                let store = context.store;
                let field = context.field;
                let target = this.nodeContext[type];
                if (target) {
                    return this.cachedContextTokens[name];
                }
            }
            return '';
        }
        catch (err) {
            throw err;
        }
    };

    NodeContext.prototype.push = function push(view) {
        return new NodeContext(view, this.nodeContext, this.msgContext, undefined, this.cachedContextTokens);
    };

    function Command(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Command Node";
        this.message = config.message;
        this.transports = ["telegram", "slack", "facebook", "smooch", "text"] || "";

        //此函式會隨機抓一個訊息回傳
        this.pickOne = function (messages) {
            let luck = Math.floor(Math.random() * messages.length);
            return _.isString(messages[luck].template) ? messages[luck].template : messages[luck].message;//這裡很像一定會是true
        };

        this.emptyMessages = function (messages) {
            return _.isEmpty(messages) || _(messages).all(function (message) {
                return _.isEmpty(message);
            });
        };

        let node = this;

        this.on("input", function (msg) {
            let message = node.message;
            let chatId = utils.getChatId(msg);
            let messageId = utils.getMessageId(msg);
            let template = MessageTemplate(msg, node);
            let is_json = false;
            let botName = msg.payload.botName || "Default Bot Name";

            // check transport compatibility
            if (!utils.matchTransport(node, msg)) {
                return;
            }

            if (_.isString(node.message) && !_.isEmpty(node.message)) {
                message = node.message;
            } else if (_.isArray(node.message) && !this.emptyMessages(node.message)) {//當有在此節點設置多個訊息時，會進到這個if。只設一個訊息也會進到這if
                message = node.pickOne(node.message);
            } else if (_.isString(msg.payload) && !_.isEmpty(msg.payload)) {//當沒有在此節點設置訊息時，會進到這個if
                message = msg.payload;
            } else if (_.isArray(msg.payload) && !this.emptyMessages(msg.payload)) {
                message = node.pickOne(msg.payload);
            } else if (_.isNumber(msg.payload)) {
                message = String(msg.payload);
            } else {
                node.error("Empty message");
            }

            let promises = [];
            let tokens = extractTokens(mustache.parse(message));
            let resolvedTokens = {};

            tokens.forEach(function (name) {
                let context = parseContext(name);
                if (context) {
                    let type = context.type;
                    let store = context.store;
                    let field = context.field;
                    let target = node.context()[type];
                    if (target) {
                        let promise = new Promise((resolve, reject) => {
                            target.get(field, store, (err, val) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolvedTokens[name] = val;
                                    resolve();
                                }
                            });
                        });
                        promises.push(promise);
                        return;
                    }
                }
            });
            Promise.all(promises).then(function () {
                message = mustache.render(message, new NodeContext(msg, node.context(), null, is_json, resolvedTokens));
                // 這時候的message是最終轉換好的字串:This is the payload: 321!
                msg.payload = {
                    type: "message",
                    content: emoji.emojify(template(message)),
                    chatId: chatId,
                    messageId: messageId,
                    inbound: false,
                    roleName: botName
                };
                if (msg.whetherToSendLocation) {
                    msg.payload.type = "request";//將type設為request才能在Facebook Out送出詢問位置的請求
                }
                // send out reply
                node.send(msg);
            }).catch(function (err) {
                node.error(err.message, msg);
            });
        });
    }
    RED.nodes.registerType("NICP-Command", Command);
};
