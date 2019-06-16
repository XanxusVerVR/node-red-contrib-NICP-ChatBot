const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const facebookOutNode = require("../NICP-Facebook.js");
const Context = require("../red/runtime/nodes/context");

describe("Facebook Out節點測試", function () {
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
        let facebookOutNodeConfig = JSON.parse(`[
            {
                "id": "a48ed279.e8f43",
                "type": "NICP-facebook-send",
                "z": "e3bfd103.34ca9",
                "name": "",
                "bot": "2ded2c1.7e8a4d4",
                "track": false,
                "outputs": 0,
                "fcfFacebookRoleNode": "",
                "mode": "message",
                "startedButtonPostbackPayload": "",
                "greetings": [
                    {
                        "locale": "default",
                        "text": "Hi,Xanxus"
                    }
                ],
                "x": 740,
                "y": 360,
                "wires": []
            },
            {
                "id": "2ded2c1.7e8a4d4",
                "type": "NICP-facebook-node",
                "z": "",
                "botname": "unit-test bot",
                "isHttps": true,
                "serverLocation": "15d8fd26.ngrok.io"
            }
        ]`);
        helper.load(facebookOutNode, facebookOutNodeConfig, function () {
            let n1 = helper.getNode(facebookOutNodeConfig[0].id);
            let n1ConfigNode = helper.getNode(facebookOutNodeConfig[1].id);
            try {
                n1.should.have.ownProperty("name");
                n1.should.have.ownProperty("track");
                n1.should.have.ownProperty("mode");
                n1.should.have.ownProperty("startedButtonPostbackPayload");
                n1.should.have.ownProperty("greetings");
                n1ConfigNode.should.have.ownProperty("botname");
                n1ConfigNode.should.have.ownProperty("isHttps");
                n1ConfigNode.should.have.ownProperty("serverLocation");
                done();
            } catch (err) {
                done(err);
            }
        });
    });


    it("測試預設的屬性的值是否正確", function (done) {
        let facebookOutNodeConfig = JSON.parse(`[
            {
                "id": "a48ed279.e8f43",
                "type": "NICP-facebook-send",
                "z": "e3bfd103.34ca9",
                "name": "",
                "bot": "2ded2c1.7e8a4d4",
                "track": false,
                "outputs": 0,
                "fcfFacebookRoleNode": "",
                "mode": "message",
                "startedButtonPostbackPayload": "",
                "greetings": [
                    {
                        "locale": "default",
                        "text": "Hi,Xanxus"
                    }
                ],
                "x": 740,
                "y": 360,
                "wires": []
            },
            {
                "id": "2ded2c1.7e8a4d4",
                "type": "NICP-facebook-node",
                "z": "",
                "botname": "unit-test bot",
                "isHttps": true,
                "serverLocation": "15d8fd26.ngrok.io"
            }
        ]`);
        helper.load(facebookOutNode, facebookOutNodeConfig, function () {
            let n1 = helper.getNode(facebookOutNodeConfig[0].id);
            let n1ConfigNode = helper.getNode(facebookOutNodeConfig[1].id);
            try {
                n1.should.have.property("track", false);
                n1.should.have.property("mode", "message");
                (n1.greetings).should.be.an.Array();
                (n1.greetings[0]).should.have.property("locale", "default");
                (n1.greetings[0]).should.have.property("text", "Hi,Xanxus");

                n1ConfigNode.should.have.property("botname", "unit-test bot");
                n1ConfigNode.should.have.property("isHttps", true);
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("測試傳給Facebook Messenger使用者的訊息是否有該有的屬性", function (done) {
        setTimeout(done, 300);
        let facebookOutNodeConfig = JSON.parse(`[
            {
                "id": "a48ed279.e8f43",
                "type": "NICP-facebook-send",
                "z": "e3bfd103.34ca9",
                "name": "",
                "bot": "2ded2c1.7e8a4d4",
                "track": false,
                "outputs": 0,
                "fcfFacebookRoleNode": "",
                "mode": "message",
                "startedButtonPostbackPayload": "",
                "greetings": [
                    {
                        "locale": "default",
                        "text": "Hi,Xanxus"
                    }
                ],
                "x": 740,
                "y": 360,
                "wires": []
            },
            {
                "id": "2ded2c1.7e8a4d4",
                "type": "NICP-facebook-node",
                "z": "",
                "botname": "unit-test bot",
                "isHttps": true,
                "serverLocation": "15d8fd26.ngrok.io"
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        facebookOutNodeConfig.push(helperNode);

        helper.load(facebookOutNode, facebookOutNodeConfig, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(facebookOutNodeConfig[0].id);
            helperNode.on("input", function (msg) {
                (msg.payload).should.have.keys("recipient", "message");
                (msg.payload.recipient).should.have.ownProperty("id");
                (msg.payload.message).should.have.ownProperty("id");
                done();
            });
            // 接收Command節點的輸出
            n1.receive({
                "payload": {
                    "type": "message",
                    "content": "Unit Test!",
                    "chatId": "2326347097452404",
                    "messageId": "SMNuKf0QEjAzl_RaXj5hPGyxCGozeYRPuL6yIM2DmQoQ2gD214BAKbvOPIUfCH-GKNpbaawA59gTFmh9LwCgMA",
                    "inbound": false,
                    "roleName": "Default Bot Name"
                },
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "2326347097452404"
                    }
                },
                "_msgid": "6920db06.6ddbc4"
            });
        });
    });

    it("測試傳給Facebook Messenger使用者的訊息屬性的值是否正確", function (done) {
        setTimeout(done, 300);
        let facebookOutNodeConfig = JSON.parse(`[
            {
                "id": "a48ed279.e8f43",
                "type": "NICP-facebook-send",
                "z": "e3bfd103.34ca9",
                "name": "",
                "bot": "2ded2c1.7e8a4d4",
                "track": false,
                "outputs": 0,
                "fcfFacebookRoleNode": "",
                "mode": "message",
                "startedButtonPostbackPayload": "",
                "greetings": [
                    {
                        "locale": "default",
                        "text": "Hi,Xanxus"
                    }
                ],
                "x": 740,
                "y": 360,
                "wires": []
            },
            {
                "id": "2ded2c1.7e8a4d4",
                "type": "NICP-facebook-node",
                "z": "",
                "botname": "unit-test bot",
                "isHttps": true,
                "serverLocation": "15d8fd26.ngrok.io"
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        facebookOutNodeConfig.push(helperNode);

        helper.load(facebookOutNode, facebookOutNodeConfig, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(facebookOutNodeConfig[0].id);
            helperNode.on("input", function (msg) {
                (msg.payload.recipient).should.have.property("id", "2326347097452404");
                (msg.payload.message).should.have.property("text", "Unit Test!");
                done();
            });
            // 接收Command節點的輸出
            n1.receive({
                "payload": {
                    "type": "message",
                    "content": "Unit Test!",
                    "chatId": "2326347097452404",
                    "messageId": "SMNuKf0QEjAzl_RaXj5hPGyxCGozeYRPuL6yIM2DmQoQ2gD214BAKbvOPIUfCH-GKNpbaawA59gTFmh9LwCgMA",
                    "inbound": false,
                    "roleName": "Default Bot Name"
                },
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "2326347097452404"
                    }
                },
                "_msgid": "6920db06.6ddbc4"
            });
        });
    });
});