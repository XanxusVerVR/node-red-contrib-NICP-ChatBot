const _ = require("underscore");
const request = require("request");
// const clc = require("cli-color");
// const green = clc.greenBright;
// const white = clc.white;
const cors = require("cors");
const moment = require("moment");
module.exports = function (RED) {
    function SlackIn(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Slack In Node";
        this.url = config.url;

        let responseJson;
        let node = this;

        let corsHandler = function (req, res, next) {
            next();
        };

        if (RED.settings.httpNodeCors) {
            corsHandler = cors(RED.settings.httpNodeCors);
            RED.httpNode.options("*", corsHandler);
        }
        let postCallback = function _postCallback(req, res) {
            // 用來處理一般訊息
            if (req.body.event) {
                if (!req.body.event.subtype && !req.body.event.bot_id) {
                    // Slack傳來的訊息資料
                    const msg = {
                        payload: {
                            // slack靠channel把訊息回覆給使用者
                            chatId: req.body.event.channel,
                            // user是Slack這個使用者的名稱而已，但不是靠這個把訊息回覆給使用者
                            userName: req.body.event.user,
                            // event_id是只是亂數字串
                            messageId: req.body.event_id,
                            type: "message",
                            content: req.body.event.text,
                            // event_ts疑似時間，不太確定...
                            date: req.body.event.event_ts,
                            inbound: true,
                        },
                        originalMessage: {
                            transport: "slack",
                            chat: {
                                id: req.body.event.channel
                            }
                        }
                    };
                    res.sendStatus(200);
                    node.send(msg);
                }
                // 當這個訊息是機器人發的
                else {
                    res.sendStatus(200);
                    console.log(`Slack In節點，節點ID為：${node.id}---只是機器人回送的訊息---`);
                }
            }
            // 處理驗證
            else {
                responseJson = {
                    challenge: req.body.challenge
                };
                res.json(responseJson).status(200);

            }
        };

        RED.httpNode.post(config.url, corsHandler, postCallback);

        if (!config.url) {
            config.url = "/您設置的URL樣式";
            node.status({
                fill: "blue",
                shape: "ring",
                text: "URL Path Undefined"
            });
        }
        else {
            node.status({
                fill: "blue",
                shape: "dot",
                text: config.url
            });
        }

        // console.log(green(`Push Service節點的ID: `) + white(node.id) + green(` 提供的URL樣式為 `) + white(`https://your_domain${config.url}`));

        node.on("close", function () {
            let node = this;
            RED.httpNode._router.stack.forEach(function (route, i, routes) {
                if (route.route && route.route.path === node.url) {
                    routes.splice(i, 1);
                }
            });
        });
    }
    RED.nodes.registerType("NICP-Slack In", SlackIn);






















    function SlackOut(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Slack Out Node";

        this.token = config.token;
        this.method = config.method;

        const node = this;

        node.on("input", function (msg) {

            const headers = {
                "Content-Type": "application/json;charset=utf-8",
                "Authorization": "Bearer " + node.token
            };

            const options = {
                url: "https://slack.com/api/chat.postMessage",
                method: "POST",
                headers: headers,
                // followAllRedirects: true,
                body: JSON.stringify({
                    text: msg.payload.content,
                    channel: msg.payload.chatId
                })
            };

            request(options, function (error, response, body) {
                try {
                    body = JSON.parse(body);
                } catch (error) {
                    console.log("可能出現格式錯誤!");
                    console.log(error);
                }
                // console.log(`下面是Slack回應的Body:`);
                // console.log(body);
                // node.send(msg);
            });

        });

    }
    RED.nodes.registerType("NICP-Slack Out", SlackOut);
};