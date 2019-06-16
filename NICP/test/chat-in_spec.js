const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const chatInNode = require("../NICP-Chat.js");
const Context = require("../red/runtime/nodes/context");

describe("Chat In節點測試", function () {
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
        let chatInNodeConfig = JSON.parse(`[
            {
                "id": "5e4cd411.7589dc",
                "type": "NICP-Chat In",
                "z": "a9aa75b.b0d7c88",
                "name": "",
                "botConfigData": "e7839b14.333e68",
                "x": 1230,
                "y": 720,
                "wires": [
                    [
                        "1d5b7647.450b9a"
                    ]
                ]
            },
            {
                "id": "e7839b14.333e68",
                "type": "NICP-Chat Config",
                "z": "",
                "botName": "Rewabo老闆端",
                "sendAPIUrl": "https://ai-rest.cse.ntou.edu.tw/rewabo/messages",
                "webhookPath": "/rewabo/webhook",
                "isHttps": true,
                "serverLocation": "xanxus-node-red.cf"
            }
        ]`);
        helper.load(chatInNode, chatInNodeConfig, function () {
            let n1 = helper.getNode(chatInNodeConfig[0].id);
            let n1ConfigNode = helper.getNode(chatInNodeConfig[1].id);
            try {
                // console.log(n1ConfigNode);
                // n1.should.have.ownProperty("name");
                // n1.should.have.ownProperty("botConfigData");
                // n1ConfigNode.should.have.ownProperty("botName");
                // n1ConfigNode.should.have.ownProperty("webhookPath");
                // n1ConfigNode.should.have.ownProperty("isHttps");
                // n1ConfigNode.should.have.ownProperty("serverLocation");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it("看config物件中的屬性值是否正確", function (done) {
        let chatInNodeConfig = JSON.parse(`[
            {
                "id": "5e4cd411.7589dc",
                "type": "NICP-Chat In",
                "z": "a9aa75b.b0d7c88",
                "name": "",
                "botConfigData": "e7839b14.333e68",
                "x": 1230,
                "y": 720,
                "wires": [
                    [
                        "1d5b7647.450b9a"
                    ]
                ]
            },
            {
                "id": "e7839b14.333e68",
                "type": "NICP-Chat Config",
                "z": "",
                "botName": "Rewabo老闆端",
                "sendAPIUrl": "https://ai-rest.cse.ntou.edu.tw/rewabo/messages",
                "webhookPath": "/rewabo/webhook",
                "isHttps": true,
                "serverLocation": "xanxus-node-red.cf"
            }
        ]`);
        done();


    });
    it("看輸出是否有該有的屬性", function (done) {
        let inputJson = `{
            "roleName": "shopKeeper",
            "senderId":"3858417550861136",
            "message": {
                "text": "開"
            },
            "date":"2019-03-22 20:44:50"
        }`;

        let outputJson = `{
            "payload": {
                "botName": "614 Demo",
                "chatId": "3858417550861136",
                "roleName": "shopKeeper",
                "messageId": "18906c3d46eaa8a308f4ce87e7ecf1f5d7eff2af0aa1bf8202c839b44b552335959e4bc3ed0320690b439a",
                "type": "message",
                "content": "d",
                "date": "2019-06-16 19:28:58"
            },
            "originalMessage": {
                "transport": "text",
                "chat": {
                    "id": "3858417550861136"
                }
            },
            "context": {},
            "_msgid": "2152dfc9.87fac"
        }`;
        done();
    });

    it("看輸出的屬性的值是否正確", function (done) {
        let inputJson = `同上面的測試案例`;
        let outputJson = `同上面的測試案例`;
        done();
    });
});