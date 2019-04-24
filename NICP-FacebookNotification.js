const request = require("request").defaults({ encoding: null });
const helpers = require("./lib/facebook/facebook");
const _ = require("underscore");

let sendAPI = function _sendAPI(recipient, payload, cb, token) {
    if (!cb) {
        cb = Function.prototype;
    }
    request({
        method: "POST",
        uri: "https://graph.facebook.com/v2.6/me/messages",
        qs: {
            access_token: token
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
};

const sendMessage = function _sendMessage(msg, token) {

    return new Promise(function (resolve, reject) {

        let type = msg.payload.type;
        let elements = null;
        let reportError = function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        };

        switch (type) {
            case "request":
                sendAPI(
                    msg.payload.chatId,
                    {
                        text: msg.payload.content,
                        quick_replies: [
                            {
                                "content_type": "location"
                            }
                        ]
                    },
                    reportError,
                    token
                );
                break;
            case "list-template":
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
                sendAPI(
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
                    reportError,
                    token
                );
                break;
            case "generic-template":
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
                sendAPI(
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
                    reportError,
                    token
                );
                break;
            case "receipt-template":
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
                sendAPI(
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
                    reportError,
                    token
                );
                break;
            case "quick-replies":
                sendAPI(
                    msg.payload.chatId,
                    {
                        text: msg.payload.content,
                        quick_replies: helpers.parseButtons(msg.payload.buttons)
                    },
                    reportError,
                    token
                );
                break;

            case "inline-buttons":
                sendAPI(
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
                    reportError,
                    token
                );
                break;
            case "message":
                sendAPI(
                    msg.payload.chatId,
                    {
                        text: msg.payload.content
                    },
                    reportError,
                    token
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
                sendAPI(
                    msg.payload.chatId,
                    {
                        attachment: locationAttachment
                    },
                    reportError,
                    token
                );
                break;
            default:
                reject("Unable to prepare unknown message type");
        }

    });
};
module.exports = function (RED) {

    function FacebookNotification(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Facebook Notification Node";

        const node = this;

        node.on("input", function (msg) {
            // 如果msg.payload.content有東西表示message有東西，就是一般餐點的狀態改變通知
            if (!_.isEmpty(msg.payload.content)) {
                let _msg = {
                    payload: {
                        type: "message",
                        chatId: msg.payload.userID[0],// 狀態改變只需要跟某一位顧客說即可
                        content: msg.payload.content
                    }
                };
                sendMessage(_msg, node.credentials.pageAccessToken).then(function () {
                }, function (err) {
                    node.error(err);
                });
            }
            // 不然的話就是群體推播
            else {
                for (let i = 0; i < msg.payload.userID.length; i++) {
                    msg.payload.result.payload.chatId = msg.payload.userID[i];
                    sendMessage(msg.payload.result, node.credentials.pageAccessToken).then(function () {
                    }, function (err) {
                        node.error(err);
                    });
                }
            }

        });
    }
    RED.nodes.registerType("NICP-FacebookNotification", FacebookNotification, {
        credentials: {
            pageAccessToken: {
                type: "text"
            }
        }
    });
};