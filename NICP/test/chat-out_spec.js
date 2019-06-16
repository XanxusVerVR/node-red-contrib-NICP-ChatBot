const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const chatOutNode = require("../NICP-Chat.js");
const Context = require("../red/runtime/nodes/context");

describe("Chat Out節點測試", function () {
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
        let chatOutNodeConfig = JSON.parse(`[
            {
                "id": "d57184a8.6bee68",
                "type": "NICP-Chat Out",
                "z": "f3a05b3a.283a08",
                "name": "",
                "botConfigData": "16d659f2.9ef6c6",
                "track": false,
                "outputs": 0,
                "textConfigRoleNode": "",
                "x": 780,
                "y": 1180,
                "wires": []
            }
        ]`);
        helper.load(chatOutNode, chatOutNodeConfig, function () {
            let n1 = helper.getNode(chatOutNodeConfig[0].id);
            try {
                n1.should.have.ownProperty("name");
                n1.should.have.ownProperty("track");
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("測試預設的屬性的值是否正確", function (done) {
        let chatOutNodeConfig = JSON.parse(`[
            {
                "id": "d57184a8.6bee68",
                "type": "NICP-Chat Out",
                "z": "f3a05b3a.283a08",
                "name": "",
                "botConfigData": "16d659f2.9ef6c6",
                "track": false,
                "outputs": 0,
                "textConfigRoleNode": "",
                "x": 780,
                "y": 1180,
                "wires": []
            }
        ]`);
        helper.load(chatOutNode, chatOutNodeConfig, function () {
            let n1 = helper.getNode(chatOutNodeConfig[0].id);
            try {
                n1.should.have.property("track", false);
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("測試輸出是否有該有的屬性", function (done) {
        setTimeout(done, 300);
        let chatOutNodeConfig = JSON.parse(`[
            {
                "id": "d57184a8.6bee68",
                "type": "NICP-Chat Out",
                "z": "f3a05b3a.283a08",
                "name": "",
                "botConfigData": "16d659f2.9ef6c6",
                "track": false,
                "outputs": 0,
                "textConfigRoleNode": "",
                "x": 780,
                "y": 1180,
                "wires": []
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        chatOutNodeConfig.push(helperNode);

        helper.load(chatOutNode, chatOutNodeConfig, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(chatOutNodeConfig[0].id);
            helperNode.on("input", function (msg) {
                (msg.payload).should.have.keys("roleName", "recipientId","originalSenderId","message");
                (msg.payload.message).should.have.ownProperty("text");
                done();
            });
            // 接收Command節點的輸出
            n1.receive({
                "payload": {
                    "type": "message",
                    "content": "Unit Test !",
                    "chatId": "3858417550861136",
                    "messageId": "b05d4951b637facaea699361b6d580448c0eb26c499d800c200dfc9ac8aa474320a1434779b02a09d74d9e",
                    "inbound": false,
                    "roleName": "614 Demo"
                },
                "originalMessage": {
                    "transport": "text",
                    "chat": {
                        "id": "3858417550861136"
                    }
                },
                "context": {},
                "_msgid": "6b3dd402.0e765c"
            });
        });
    });

    it("測試輸出的屬性的值是否正確", function (done) {
        setTimeout(done, 300);
        let chatOutNodeConfig = JSON.parse(`[
            {
                "id": "d57184a8.6bee68",
                "type": "NICP-Chat Out",
                "z": "f3a05b3a.283a08",
                "name": "",
                "botConfigData": "16d659f2.9ef6c6",
                "track": false,
                "outputs": 0,
                "textConfigRoleNode": "",
                "x": 780,
                "y": 1180,
                "wires": []
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        chatOutNodeConfig.push(helperNode);

        helper.load(chatOutNode, chatOutNodeConfig, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(chatOutNodeConfig[0].id);
            helperNode.on("input", function (msg) {
                (msg.payload).should.have.property("roleName", "chatbot");
                (msg.payload).should.have.property("recipientId", "3858417550861136");
                (msg.payload.message).should.have.property("text", "Unit Test !");
                done();
            });
            // 接收Command節點的輸出
            n1.receive({
                "payload": {
                    "type": "message",
                    "content": "Unit Test !",
                    "chatId": "3858417550861136",
                    "messageId": "b05d4951b637facaea699361b6d580448c0eb26c499d800c200dfc9ac8aa474320a1434779b02a09d74d9e",
                    "inbound": false,
                    "roleName": "614 Demo"
                },
                "originalMessage": {
                    "transport": "text",
                    "chat": {
                        "id": "3858417550861136"
                    }
                },
                "context": {},
                "_msgid": "6b3dd402.0e765c"
            });
        });
    });
});