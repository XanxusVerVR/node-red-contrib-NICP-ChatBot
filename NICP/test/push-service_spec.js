const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const pushServiceNode = require("../NICP-PushService.js");
const Context = require("../red/runtime/nodes/context");

describe("Push Service節點測試", function () {
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
        let pushServiceNodeConfig = JSON.parse(`[
            {
                "id": "7887681a.294f58",
                "type": "NICP-PushService",
                "z": "a9aa75b.b0d7c88",
                "name": "",
                "url": "/nicp/rewabo/Push",
                "outputs": 1,
                "x": 1450,
                "y": 2040,
                "wires": [
                    [
                        "eaf1bfdd.950e8"
                    ]
                ]
            }
        ]`);
        helper.load(pushServiceNode, pushServiceNodeConfig, function () {
            let n1 = helper.getNode(pushServiceNodeConfig[0].id);
            try {
                n1.should.have.ownProperty("name");
                n1.should.have.ownProperty("url");
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("看config物件中的屬性預設值是否正確", function (done) {
        let pushServiceNodeConfig = JSON.parse(`[
            {
                "id": "7887681a.294f58",
                "type": "NICP-PushService",
                "z": "a9aa75b.b0d7c88",
                "name": "",
                "url": "/nicp/rewabo/Push",
                "outputs": 1,
                "x": 1450,
                "y": 2040,
                "wires": [
                    [
                        "eaf1bfdd.950e8"
                    ]
                ]
            }
        ]`);
        helper.load(pushServiceNode, pushServiceNodeConfig, function () {
            let n1 = helper.getNode(pushServiceNodeConfig[0].id);
            try {
                n1.should.have.property("url", "/nicp/rewabo/Push");
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("測試config模式(設置條件參數)是否有該有的屬性", function (done) {
        setTimeout(done, 300);
        let pushServiceNodeConfig = JSON.parse(`[
            {
                "id": "7887681a.294f58",
                "type": "NICP-PushService",
                "z": "a9aa75b.b0d7c88",
                "name": "",
                "url": "/nicp/rewabo/Push",
                "outputs": 1,
                "x": 1450,
                "y": 2040,
                "wires": [
                    [
                        "eaf1bfdd.950e8"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        pushServiceNodeConfig.push(helperNode);

        helper.load(pushServiceNode, pushServiceNodeConfig, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(pushServiceNodeConfig[0].id);
            helperNode.on("input", function (msg) {
                // (msg.payload.recipient).should.have.property("id", "2326347097452404");
                // (msg.payload.message).should.have.property("text", "Unit Test!");
                done();
            });
            // 接收外部服務的請求body
            n1.receive({
                "userID": {},
                "message": {},
                "result": {},
                "config": {
                    "id": "df6b6d35.ad8bf",
                    "type": "NICP-ConditionalTrigger",
                    "name": "開冷氣",
                    "rules": [
                        {
                            "t": "gte",
                            "v": "25",
                            "vt": "num",
                            "propertyType": "flow",
                            "property": "temperature",
                            "topic": "temperature"
                        },
                        {
                            "t": "gte",
                            "v": "16",
                            "vt": "num",
                            "propertyType": "flow",
                            "property": "peopleQuantity",
                            "topic": "peopleQuantity"
                        }
                    ],
                    "outputTopic": "AndNodeTopic1",
                    "gateType": "and",
                    "emitOnlyIfTrue": false
                }
            });
        });
    });

    it("測試config模式的值是否正確", function (done) {
        setTimeout(done, 300);
        let pushServiceNodeConfig = JSON.parse(`[
            {
                "id": "7887681a.294f58",
                "type": "NICP-PushService",
                "z": "a9aa75b.b0d7c88",
                "name": "",
                "url": "/nicp/rewabo/Push",
                "outputs": 1,
                "x": 1450,
                "y": 2040,
                "wires": [
                    [
                        "eaf1bfdd.950e8"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        pushServiceNodeConfig.push(helperNode);

        helper.load(pushServiceNode, pushServiceNodeConfig, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(pushServiceNodeConfig[0].id);
            helperNode.on("input", function (msg) {
                // (msg.payload.recipient).should.have.property("id", "2326347097452404");
                // (msg.payload.message).should.have.property("text", "Unit Test!");
                done();
            });
            // 接收外部服務的請求body
            n1.receive({
                "userID": {},
                "message": {},
                "result": {},
                "config": {
                    "id": "df6b6d35.ad8bf",
                    "type": "NICP-ConditionalTrigger",
                    "name": "開冷氣",
                    "rules": [
                        {
                            "t": "gte",
                            "v": "25",
                            "vt": "num",
                            "propertyType": "flow",
                            "property": "temperature",
                            "topic": "temperature"
                        },
                        {
                            "t": "gte",
                            "v": "16",
                            "vt": "num",
                            "propertyType": "flow",
                            "property": "peopleQuantity",
                            "topic": "peopleQuantity"
                        }
                    ],
                    "outputTopic": "AndNodeTopic1",
                    "gateType": "and",
                    "emitOnlyIfTrue": false
                }
            });
        });
    });

    it("測試推播模式的輸出是否有該有的屬性", function (done) {
        setTimeout(done, 300);
        let pushServiceNodeConfig = JSON.parse(`[
            {
                "id": "7887681a.294f58",
                "type": "NICP-PushService",
                "z": "a9aa75b.b0d7c88",
                "name": "",
                "url": "/nicp/rewabo/Push",
                "outputs": 1,
                "x": 1450,
                "y": 2040,
                "wires": [
                    [
                        "eaf1bfdd.950e8"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        pushServiceNodeConfig.push(helperNode);

        helper.load(pushServiceNode, pushServiceNodeConfig, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(pushServiceNodeConfig[0].id);
            helperNode.on("input", function (msg) {
                (msg).should.have.ownProperty("payload");
                (msg.payload).should.have.keys("userID", "content", "result", "config");
                done();
            });
            // 接收外部服務的請求body
            n1.receive({
                "userID": [
                    "1289859468307573",
                    "5861606921075860"
                ],
                "message": "",
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
                "config": {},
                "originalPlatform": "bossWebUI"
            });
        });
    });

    it("測試推播模式的輸出的屬性的值是否正確", function (done) {
        setTimeout(done, 300);
        let pushServiceNodeConfig = JSON.parse(`[
            {
                "id": "7887681a.294f58",
                "type": "NICP-PushService",
                "z": "a9aa75b.b0d7c88",
                "name": "",
                "url": "/nicp/rewabo/Push",
                "outputs": 1,
                "x": 1450,
                "y": 2040,
                "wires": [
                    [
                        "eaf1bfdd.950e8"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        pushServiceNodeConfig.push(helperNode);

        helper.load(pushServiceNode, pushServiceNodeConfig, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(pushServiceNodeConfig[0].id);
            helperNode.on("input", function (msg) {
                (msg).should.have.ownProperty("payload");
                done();
            });
            // 接收外部服務的請求body
            n1.receive({
                "userID": [
                    "1289859468307573",
                    "5861606921075860"
                ],
                "message": "",
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
                "config": {},
                "originalPlatform": "bossWebUI"
            });
        });
    });
});