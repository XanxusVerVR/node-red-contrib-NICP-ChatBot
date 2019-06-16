const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const infraredOutNode = require("../NICP-Infrared.js");
const Context = require("../red/runtime/nodes/context");

describe("Infrared Out節點測試", function () {
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
        let infraredOutNodeConfig = JSON.parse(`[
            {
                "id": "f4d2c18e.f2b7c",
                "type": "NICP-Infrared Out",
                "z": "8eefe4f1.b4ef58",
                "name": "發射冷氣開關訊號",
                "controller": "32b42bad.8c4504",
                "device": "airc",
                "output": "1",
                "x": 990,
                "y": 480,
                "wires": []
            },
            {
                "id": "32b42bad.8c4504",
                "type": "lirc-controller",
                "z": "",
                "name": "AirCon"
            }
        ]`);
        helper.load(infraredOutNode, infraredOutNodeConfig, function () {
            let n1 = helper.getNode(infraredOutNodeConfig[0].id);
            try {
                n1.should.have.ownProperty("name");
                n1.should.have.ownProperty("device");
                done();
            } catch (err) {
                done(err);
            }
        });
    });


    it("看config物件中的屬性的值是否正確", function (done) {
        let infraredOutNodeConfig = JSON.parse(`[
            {
                "id": "f4d2c18e.f2b7c",
                "type": "NICP-Infrared Out",
                "z": "8eefe4f1.b4ef58",
                "name": "發射冷氣開關訊號",
                "controller": "32b42bad.8c4504",
                "device": "airc",
                "output": "1",
                "x": 990,
                "y": 480,
                "wires": []
            },
            {
                "id": "32b42bad.8c4504",
                "type": "lirc-controller",
                "z": "",
                "name": "AirCon"
            }
        ]`);
        helper.load(infraredOutNode, infraredOutNodeConfig, function () {
            let n1 = helper.getNode(infraredOutNodeConfig[0].id);
            try {
                n1.should.have.property("type", "NICP-Infrared Out");
                n1.should.have.property("name", "發射冷氣開關訊號");
                n1.should.have.property("device", "airc");
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("測試輸出是否有該有的屬性", function (done) {
        setTimeout(done, 300);
        let infraredOutNodeConfig = JSON.parse(`[
            {
                "id": "f4d2c18e.f2b7c",
                "type": "NICP-Infrared Out",
                "z": "8eefe4f1.b4ef58",
                "name": "發射冷氣開關訊號",
                "controller": "32b42bad.8c4504",
                "device": "airc",
                "output": "1",
                "x": 990,
                "y": 480,
                "wires": []
            },
            {
                "id": "32b42bad.8c4504",
                "type": "lirc-controller",
                "z": "",
                "name": "AirCon"
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        infraredOutNodeConfig.push(helperNode);

        helper.load(infraredOutNode, infraredOutNodeConfig, function () {
            let n1 = helper.getNode(infraredOutNodeConfig[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                msg.should.have.ownProperty("device");
                msg.should.have.ownProperty("payload");
                done();
            });
            // 接收Command的輸出
            n1.receive({
                "_msgid": "a2c4983a.29f638",
                "topic": "",
                "payload": {
                    "type": "message",
                    "content": "KEY_POWER",
                    "chatId": null,
                    "messageId": null,
                    "inbound": false,
                    "roleName": "Default Bot Name"
                }
            });
        });
    });

    it("測試輸出的資料的屬性值是否正確，", function (done) {
        setTimeout(done, 300);
        let infraredOutNodeConfig = JSON.parse(`[
            {
                "id": "f4d2c18e.f2b7c",
                "type": "NICP-Infrared Out",
                "z": "8eefe4f1.b4ef58",
                "name": "發射冷氣開關訊號",
                "controller": "32b42bad.8c4504",
                "device": "airc",
                "output": "1",
                "x": 990,
                "y": 480,
                "wires": []
            },
            {
                "id": "32b42bad.8c4504",
                "type": "lirc-controller",
                "z": "",
                "name": "AirCon"
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        infraredOutNodeConfig.push(helperNode);

        helper.load(infraredOutNode, infraredOutNodeConfig, function () {
            let n1 = helper.getNode(infraredOutNodeConfig[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                msg.should.have.property("device", "airc");
                msg.should.have.property("payload", "KEY_POWER");
                done();
            });
            n1.receive({
                remote: "airc",
                key: "KEY_POWER"
            });
        });
    });
});