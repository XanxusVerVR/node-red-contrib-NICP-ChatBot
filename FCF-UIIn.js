/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function (RED) {
    "use strict";
    const bodyParser = require("body-parser");
    const multer = require("multer");
    const cookieParser = require("cookie-parser");
    const getBody = require("raw-body");
    const cors = require("cors");
    const jsonParser = bodyParser.json();
    const urlencParser = bodyParser.urlencoded({ extended: true });
    const onHeaders = require("on-headers");
    const typer = require("media-typer");
    const isUtf8 = require("is-utf8");
    const hashSum = require("hash-sum");
    const moment = require("moment");

    function rawBodyParser(req, res, next) {
        if (req.skipRawBodyParser) { next(); } // don"t parse this if told to skip
        if (req._body) {
            return next();
        }
        req.body = "";
        req._body = true;

        let isText = true;
        let checkUTF = false;

        if (req.headers["content-type"]) {
            let parsedType = typer.parse(req.headers["content-type"]);
            if (parsedType.type === "text") {
                isText = true;
            } else if (parsedType.subtype === "xml" || parsedType.suffix === "xml") {
                isText = true;
            } else if (parsedType.type !== "application") {
                isText = false;
            } else if (parsedType.subtype !== "octet-stream") {
                checkUTF = true;
            } else {
                // applicatino/octet-stream
                isText = false;
            }
        }

        getBody(req, {
            length: req.headers["content-length"],
            encoding: isText ? "utf8" : null
        }, function (err, buf) {
            if (err) {
                return next(err);
            }
            if (!isText && checkUTF && isUtf8(buf)) {
                buf = buf.toString();
            }
            req.body = buf;
            next();
        });
    }

    let corsHandler = function (req, res, next) {
        next();
    };

    if (RED.settings.httpNodeCors) {
        corsHandler = cors(RED.settings.httpNodeCors);
        RED.httpNode.options("*", corsHandler);
    }

    function uiIn(config) {

        RED.nodes.createNode(this, config);

        if (RED.settings.httpNodeRoot !== false) {

            this.method = config.method;

            let node = this;

            node.webhookConfig = RED.nodes.getNode(config.webhookConfig);

            this.errorHandler = function (err, req, res, next) {
                node.warn(err);
                res.sendStatus(500);
            };

            this.callback = function (req, res) {
                let msgid = RED.util.generateId();
                res._msgid = msgid;
                let mode = req.query["hub.mode"];
                let token = req.query["hub.verify_token"];
                let challenge = req.query["hub.challenge"];
                if (mode && token) {
                    if (mode === "subscribe" && token === node.webhookConfig.credentials.verifyToken) {
                        console.log("Webhook驗證成功");
                        res.status(200).send(challenge);
                    } else {
                        res.sendStatus(403);
                    }
                }
            };

            let postCallback = function (req, res) {
                let msgid = RED.util.generateId();
                res._msgid = msgid;
                let body = req.body;
                if (body.object === "page") {
                    body.entry.forEach(function (entry) {
                        let webhook_event = entry.messaging[0];
                        if (webhook_event.message) {
                            console.log(webhook_event.message.text);
                            node.send({
                                payload: {
                                    chatId: webhook_event.sender.id,
                                    messageId: webhook_event.message.mid,
                                    type: "message",
                                    content: webhook_event.message.text,//使用者的文字訊息
                                    date: moment().format("YYYY-MM-DD HH:mm a"),
                                    inbound: false
                                },
                                originalMessage: {
                                    transport: "facebook",
                                    chat: {
                                        id: webhook_event.sender.id
                                    }
                                },
                                _msgid: msgid
                            });
                        }
                    });
                    res.status(200).send('EVENT_RECEIVED');
                } else {
                    res.sendStatus(404);
                }
            };

            let httpMiddleware = function (req, res, next) {
                next();
            };

            if (RED.settings.httpNodeMiddleware) {
                if (typeof RED.settings.httpNodeMiddleware === "function") {
                    httpMiddleware = RED.settings.httpNodeMiddleware;
                }
            }

            let metricsHandler = function (req, res, next) {
                next();
            };

            if (this.metric()) {
                console.log("metric");
                metricsHandler = function (req, res, next) {
                    let startAt = process.hrtime();
                    onHeaders(res, function () {
                        if (res._msgid) {
                            let diff = process.hrtime(startAt);
                            let ms = diff[0] * 1e3 + diff[1] * 1e-6;
                            let metricResponseTime = ms.toFixed(3);
                            let metricContentLength = res._headers["content-length"];
                            //assuming that _id has been set for res._metrics in uiOut node!
                            node.metric("response.time.millis", { _msgid: res._msgid }, metricResponseTime);
                            node.metric("response.content-length.bytes", { _msgid: res._msgid }, metricContentLength);
                        }
                    });
                    next();
                };
            }

            RED.httpNode.get("/webhook", cookieParser(), httpMiddleware, corsHandler, metricsHandler, this.callback, this.errorHandler);
            RED.httpNode.post("/webhook", cookieParser(), httpMiddleware, corsHandler, metricsHandler, jsonParser, urlencParser, rawBodyParser, postCallback, this.errorHandler);

            this.on("close", function () {
                let node = this;
                RED.httpNode._router.stack.forEach(function (route, i, routes) {
                    if (route.route && route.route.path === node.url && route.route.methods[node.method]) {
                        routes.splice(i, 1);
                    }
                });
            });
        } else {
            this.warn(RED._("uiIn.errors.not-created"));
        }
    }
    RED.nodes.registerType("UI-In", uiIn);
};