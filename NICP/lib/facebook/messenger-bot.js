let url = require("url");
let inherits = require("util").inherits;
let qs = require("querystring");
let EventEmitter = require("events").EventEmitter;
let request = require("request");
//let crypto = require("crypto");
let _ = require("underscore");
//let _s = require("underscore.string");


function Bot(opts) {
    opts = opts || {};
    if (!opts.token) {
        throw new Error("Missing page token. See FB documentation for details: https://developers.facebook.com/docs/messenger-platform/quickstart");
    }
    this.token = opts.token;
    this.app_secret = opts.app_secret || false;
    this.verify_token = opts.verify || "token";
    this.webhookURL = opts.webhookURL || false;
    EventEmitter.call(this);
}

inherits(Bot, EventEmitter);

_.extend(Bot.prototype, {

    getProfile: function (id) {
        let token = this.token;
        return new Promise(function (resolve, reject) {
            request({
                method: "GET",
                uri: "https://graph.facebook.com/v2.6/" + id,
                qs: {
                    fields: "first_name,last_name,profile_pic,locale,timezone,gender",
                    access_token: token
                },
                json: true
            }, function (err, res, body) {
                if (err) {
                    reject(err);
                } else if (body.error) {
                    reject(body.error);
                } else {
                    resolve(body);
                }
            });
        });
    },

    removePersistentMenu: function (cb) {
        request({
            method: "DELETE",
            uri: "https://graph.facebook.com/v2.6/me/messenger_profile",
            qs: {
                access_token: this.token
            },
            json: {
                fields: ["persistent_menu"]
            }
        }, function (err, res, body) {
            if (body != null && body.error != null) {
                return cb(body.error.message);
            }
            return cb(null);
        });
    },

    setPersistentMenu: function (items, composerInputDisabled, cb) {
        request({
            method: "POST",
            uri: "https://graph.facebook.com/v2.6/me/messenger_profile",
            qs: {
                access_token: this.token
            },
            json: {
                "persistent_menu": [
                    {
                        locale: "default",
                        composer_input_disabled: composerInputDisabled,
                        call_to_actions: items
                    }
                ]
            }
        }, function (err, res, body) {
            if (body != null && body.error != null) {
                return cb(body.error.message);
            }
            return cb(null);
        });
    },

    // 將我們(機器人、系統)處理完or要回應給使用者的訊息，傳給使用者(使用Send API)
    sendMessage: function (recipient, payload, cb) {

        // let jjson = {
        //     recipient: {
        //         id: recipient
        //     },
        //     message: payload
        // };
        // console.log(`送出的json字串：`);
        // console.log(JSON.stringify(jjson));
        if (!cb) {
            cb = Function.prototype;
        }
        request({
            method: "POST",
            uri: "https://graph.facebook.com/v2.6/me/messages",
            qs: {
                access_token: this.token
            },
            json: {
                recipient: {
                    id: recipient
                },
                message: payload
            }
        }, function (err, res, body) {
            if (err) {
                return cb(err);
            } else if ((body != null) && (_.isString(body))) {
                // body in string in case of error
                let errorJSON = null;
                try {
                    errorJSON = JSON.parse(body);
                } catch (e) {
                    errorJSON = { error: "Error parsing error payload from Facebook." };
                }
                return cb(errorJSON.error);
            } else if (body != null && body.error != null) {
                return cb(body.error.message);
            }
            return cb(null, body);
        });
    },

    expressMiddleware: function (express) {

        const bot = this;

        // Facebook對我們的Webhook做驗證
        express.get("/nicp/facebook" + bot.webhookURL, function (req, res) {
            bot._verify(req, res);
        });
        express.get("/nicp/facebook/_status" + bot.webhookURL, function (req, res) {
            res.send({ status: "ok" });
        });

        // Facebook Messenger將訊息傳到我們的Webhook服務
        let postPath = "/nicp/facebook" + bot.webhookURL;
        express.post(postPath, function (req, res) {
            bot._handleMessage(req.body);
            res.send({ status: "ok" });
        });

    },

    _handleMessage: function (json) {
        let _this = this;
        // exit if empty body
        if (json != null && _.isArray(json.entry)) {
            let entries = json.entry;
            entries.forEach(function (entry) {
                let events = entry.messaging;
                events.forEach(function (event) {
                    // handle inbound messages
                    if (event.message) {
                        _this.emit("message", event);
                    }
                    // handle postbacks
                    if (event.postback) {
                        event.message = {
                            text: event.postback.payload
                        };
                        delete event.postback;
                        _this.emit("postback", event);
                    }
                    // handle message delivered
                    if (event.delivery) {
                        _this.emit("delivery", event);
                    }
                    // handle authentication
                    if (event.optin) {
                        _this.emit("authentication", event);
                    }
                    // handle account linking
                    if (event.account_linking) {
                        _this.emit("account_linking", event);
                    }
                });
            });
        }
    },

    _verify: function (req, res) {
        let query = qs.parse(url.parse(req.url).query);
        console.log(`Verifying Facebook Messenger token ${query["hub.verify_token"]}, should be ${this.verify_token}`);
        if (query["hub.verify_token"] === this.verify_token) {
            console.log("Token verified.");
            return res.end(query["hub.challenge"]);
        }
        return res.end("Error, wrong validation token");
    }

});

module.exports = Bot;