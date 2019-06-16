const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const facebookNotificationNode = require("../NICP-FacebookNotification.js");
const Context = require("../red/runtime/nodes/context");

describe("Facebook Notification節點測試", function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function () {
        helper.unload().then(function () {
            return Context.clean({ allNodes: {} });
        }).then(function () {
            return Context.close();
        });
    });

    it("看config物件中是否有該有的屬性", function (done) {
        let facebookNotificationNodeConfig = JSON.parse(`[
            {
                "id": "d4749348.fba68",
                "type": "NICP-FacebookNotification",
                "z": "a9aa75b.b0d7c88",
                "name": "推播",
                "outputs": 0,
                "x": 1060,
                "y": 2040,
                "wires": []
            }
        ]`);
        helper.load(facebookNotificationNode, facebookNotificationNodeConfig, function () {
            let n1 = helper.getNode(facebookNotificationNodeConfig[0].id);
            try {
                n1.should.have.ownProperty("type");
                n1.should.have.ownProperty("name");
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("看config物件中屬性的預設值是否正確", function (done) {
        let facebookNotificationNodeConfig = JSON.parse(`[
            {
                "id": "d4749348.fba68",
                "type": "NICP-FacebookNotification",
                "z": "a9aa75b.b0d7c88",
                "name": "推播",
                "outputs": 0,
                "x": 1060,
                "y": 2040,
                "wires": []
            }
        ]`);
        helper.load(facebookNotificationNode, facebookNotificationNodeConfig, function () {
            let n1 = helper.getNode(facebookNotificationNodeConfig[0].id);
            try {
                n1.should.have.property("type", "NICP-FacebookNotification");
                n1.should.have.property("name", "推播");
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("接收Push Service節點的輸出(群體推播模式)，看推播給Messenger使用者的資料格式是否正確", function (done) {
        setTimeout(done, 300);
        let facebookNotificationNodeConfig = JSON.parse(`[
            {
                "id": "d4749348.fba68",
                "type": "NICP-FacebookNotification",
                "z": "a9aa75b.b0d7c88",
                "name": "推播",
                "outputs": 0,
                "x": 1060,
                "y": 2040,
                "wires": []
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        facebookNotificationNodeConfig.push(helperNode);

        helper.load(facebookNotificationNode, facebookNotificationNodeConfig, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(facebookNotificationNodeConfig[0].id);
            helperNode.on("input", function (msg) {
                (msg.payload).should.have.keys("recipient", "message");
                (msg.payload.recipient).should.have.ownProperty("id");
                (msg.payload.message).should.have.ownProperty("id");
                done();
            });
            n1.receive({
                "payload": {
                    "userID": [
                        "1289859468307573",
                        "5861606921075860"
                    ],
                    "content": "",
                    "result": {
                        "payload": {
                            "type": "inline-buttons",
                            "name": "按鈕範本",
                            "content": "本日特餐：豬排鐵板麵+中杯冰紅 $40",
                            "chatId": "",
                            "messageId": "-sARQPkFD63MeBPcExqR-fnorUe71_yCEq9QmuomnSJmSViesjgfViXLyT9frJErUO2WYLNE23eZmREK6fP8vw",
                            "buttons": [
                                {
                                    "type": "url",
                                    "label": "前往並加入餐點",
                                    "url": "https://ai-rest.cse.ntou.edu.tw/",
                                    "webViewHeightRatio": "full",
                                    "extensions": true,
                                    "answer": "",
                                    "alert": false
                                }
                            ]
                        },
                        "originalMessage": {
                            "transport": "facebook",
                            "chat": {
                                "id": ""
                            }
                        },
                        "_msgid": "301471b6.16aeae"
                    },
                    "config": {}
                },
                "_msgid": "541745c1.a01f5c"
            });
        });
    });

    it("接收Push Service節點的輸出(群體推播模式)，看推播給Messenger使用者的資料的值是否正確", function (done) {
        setTimeout(done, 300);
        let facebookNotificationNodeConfig = JSON.parse(`[
            {
                "id": "d4749348.fba68",
                "type": "NICP-FacebookNotification",
                "z": "a9aa75b.b0d7c88",
                "name": "推播",
                "outputs": 0,
                "x": 1060,
                "y": 2040,
                "wires": []
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        facebookNotificationNodeConfig.push(helperNode);

        helper.load(facebookNotificationNode, facebookNotificationNodeConfig, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(facebookNotificationNodeConfig[0].id);
            helperNode.on("input", function (msg) {
                (msg.payload.recipient).should.have.property("id", "1289859468307573");
                (msg.payload.message.attachment).should.have.property("type", "template");
                (msg.payload.message.attachment.payload).should.have.property("template_type", "button");
                (msg.payload.message.attachment.payload).should.have.property("text", "本日特餐：豬排鐵板麵+中杯冰紅 $40");
                (msg.payload.message.attachment.payload.buttons[0]).should.have.property("type", "web_url");
                (msg.payload.message.attachment.payload.buttons[0]).should.have.property("title", "前往並加入餐點");
                done();
            });
            n1.receive({
                "payload": {
                    "userID": [
                        "1289859468307573"
                    ],
                    "content": "",
                    "result": {
                        "payload": {
                            "type": "inline-buttons",
                            "name": "按鈕範本",
                            "content": "本日特餐：豬排鐵板麵+中杯冰紅 $40",
                            "chatId": "",
                            "messageId": "-sARQPkFD63MeBPcExqR-fnorUe71_yCEq9QmuomnSJmSViesjgfViXLyT9frJErUO2WYLNE23eZmREK6fP8vw",
                            "buttons": [
                                {
                                    "type": "url",
                                    "label": "前往並加入餐點",
                                    "url": "https://ai-rest.cse.ntou.edu.tw/",
                                    "webViewHeightRatio": "full",
                                    "extensions": true,
                                    "answer": "",
                                    "alert": false
                                }
                            ]
                        },
                        "originalMessage": {
                            "transport": "facebook",
                            "chat": {
                                "id": ""
                            }
                        },
                        "_msgid": "301471b6.16aeae"
                    },
                    "config": {}
                },
                "_msgid": "541745c1.a01f5c"
            });
        });
    });
});