const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const facebookInNode = require("../NICP-Facebook.js");
const Context = require("../red/runtime/nodes/context");

describe("Facebook In節點測試", function () {
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
        let facebookInNodeConfig = JSON.parse(`[
            {
                "id": "28d44e7e.a27482",
                "type": "NICP-facebook-receive",
                "z": "a9aa75b.b0d7c88",
                "name": "",
                "bot": "2c04ecf3.c75794",
                "x": 450,
                "y": 140,
                "wires": [
                    [
                        "d7c3033.d6235",
                        "ddcb9da5.7e496"
                    ]
                ]
            },
            {
                "id": "2c04ecf3.c75794",
                "type": "NICP-facebook-node",
                "z": "",
                "botname": "Old Redbot Facebook Node",
                "isHttps": true,
                "serverLocation": "xanxus-node-red.cf"
            }
        ]`);
        helper.load(facebookInNode, facebookInNodeConfig, function () {
            let n1 = helper.getNode(facebookInNodeConfig[0].id);
            let n1ConfigNode = helper.getNode(facebookInNodeConfig[1].id);
            try {
                n1.should.have.ownProperty("name");
                n1ConfigNode.should.have.ownProperty("botname");
                n1ConfigNode.should.have.ownProperty("isHttps");
                n1ConfigNode.should.have.ownProperty("serverLocation");
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("測試處完的輸出是否有該有的屬性", function (done) {
        setTimeout(done, 300);
        let facebookInNodeConfig = JSON.parse(`[
            {
                "id": "28d44e7e.a27482",
                "type": "NICP-facebook-receive",
                "z": "a9aa75b.b0d7c88",
                "name": "",
                "bot": "2c04ecf3.c75794",
                "x": 450,
                "y": 140,
                "wires": [
                    [
                        "d7c3033.d6235",
                        "ddcb9da5.7e496"
                    ]
                ]
            },
            {
                "id": "2c04ecf3.c75794",
                "type": "NICP-facebook-node",
                "z": "",
                "botname": "Old Redbot Facebook Node",
                "isHttps": true,
                "serverLocation": "xanxus-node-red.cf"
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        facebookInNodeConfig.push(helperNode);

        helper.load(facebookInNode, facebookInNodeConfig, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(facebookInNodeConfig[0].id);
            helperNode.on("input", function (msg) {
                msg.should.have.keys("payload", "originalMessage");
                (msg.payload).should.have.keys("chatId", "messageId", "type", "content", "date", "inbound");
                (msg.originalMessage).should.have.keys("transport", "chat");
                (msg.originalMessage.chat).should.have.ownProperty("id");
                done();
            });
            // 讓Facebook In節點接收從Facebook Messenger平台發出請求的訊息
            n1.receive({
                "object": "page",
                "entry": [
                    {
                        "id": "2243241022597243",
                        "time": 1560680128809,
                        "messaging": [
                            {
                                "sender": {
                                    "id": "2326347097452404"
                                },
                                "recipient": {
                                    "id": "2243241022597243"
                                },
                                "timestamp": 1560680128502,
                                "message": {
                                    "mid": "Hxn9TmSsEySNceJNuXgpUmyxCGozeYRPuL6yIM2DmQpjkuDzo97JPBVV9gIlV2-ATC19pNMeyNDeSrgSV2YTBA",
                                    "seq": 0,
                                    "text": "xxx"
                                }
                            }
                        ]
                    }
                ]
            });//接收前面的節點傳過來的msg物件
        });
    });


    it("測試處完的輸出的屬性的值是否正確", function (done) {
        setTimeout(done, 300);
        let facebookInNodeConfig = JSON.parse(`[
            {
                "id": "28d44e7e.a27482",
                "type": "NICP-facebook-receive",
                "z": "a9aa75b.b0d7c88",
                "name": "",
                "bot": "2c04ecf3.c75794",
                "x": 450,
                "y": 140,
                "wires": [
                    [
                        "d7c3033.d6235",
                        "ddcb9da5.7e496"
                    ]
                ]
            },
            {
                "id": "2c04ecf3.c75794",
                "type": "NICP-facebook-node",
                "z": "",
                "botname": "Old Redbot Facebook Node",
                "isHttps": true,
                "serverLocation": "xanxus-node-red.cf"
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        facebookInNodeConfig.push(helperNode);

        helper.load(facebookInNode, facebookInNodeConfig, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(facebookInNodeConfig[0].id);
            helperNode.on("input", function (msg) {
                (msg.payload).should.have.property("chatId", "2243241022597243");
                (msg.payload).should.have.property("type", "message");
                (msg.payload).should.have.property("content", "xxx");
                (msg.payload).should.have.property("inbound", true);
                (msg.originalMessage).should.have.property("transport", facebook);
                (msg.originalMessage.chat).should.have.property("id", "2243241022597243");
                done();
            });
            // 讓Facebook In節點接收從Facebook Messenger平台發出請求的訊息
            n1.receive({
                "object": "page",
                "entry": [
                    {
                        "id": "2243241022597243",
                        "time": 1560680128809,
                        "messaging": [
                            {
                                "sender": {
                                    "id": "2326347097452404"
                                },
                                "recipient": {
                                    "id": "2243241022597243"
                                },
                                "timestamp": 1560680128502,
                                "message": {
                                    "mid": "Hxn9TmSsEySNceJNuXgpUmyxCGozeYRPuL6yIM2DmQpjkuDzo97JPBVV9gIlV2-ATC19pNMeyNDeSrgSV2YTBA",
                                    "seq": 0,
                                    "text": "xxx"
                                }
                            }
                        ]
                    }
                ]
            });//接收前面的節點傳過來的msg物件
        });
    });
});