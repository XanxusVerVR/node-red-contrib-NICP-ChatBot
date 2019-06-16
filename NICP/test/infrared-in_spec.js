const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const infraredInNode = require("../NICP-Infrared.js");
const Context = require("../red/runtime/nodes/context");

describe("Infrared In節點測試", function () {
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
        let infraredInNodeConfig = JSON.parse(`[
            {
                "id": "23eda757.874b48",
                "type": "NICP-Infrared In",
                "z": "8eefe4f1.b4ef58",
                "name": "監聽電視關的訊號",
                "listenDevice": "airc",
                "listenCommand": "BTN_0",
                "x": 220,
                "y": 320,
                "wires": [
                    [
                        "a3ddf73.8503008"
                    ]
                ]
            }
        ]`);
        helper.load(infraredInNode, infraredInNodeConfig, function () {
            let n1 = helper.getNode(infraredInNodeConfig[0].id);
            try {
                n1.should.have.ownProperty("name");
                n1.should.have.ownProperty("listenDevice");
                n1.should.have.ownProperty("listenCommand");
                done();
            } catch (err) {
                done(err);
            }
        });
    });


    it("看config物件中的屬性的值是否正確", function (done) {
        let infraredInNodeConfig = JSON.parse(`[
            {
                "id": "23eda757.874b48",
                "type": "NICP-Infrared In",
                "z": "8eefe4f1.b4ef58",
                "name": "監聽電視關的訊號",
                "listenDevice": "airc",
                "listenCommand": "BTN_0",
                "x": 220,
                "y": 320,
                "wires": [
                    [
                        "a3ddf73.8503008"
                    ]
                ]
            }
        ]`);
        helper.load(infraredInNode, infraredInNodeConfig, function () {
            let n1 = helper.getNode(infraredInNodeConfig[0].id);
            try {
                n1.should.have.property("type", "NICP-Infrared In");
                n1.should.have.property("name", "監聽電視關的訊號");
                n1.should.have.property("listenDevice", "airc");
                n1.should.have.property("listenCommand", "BTN_0");
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("測試從外部接收到資料，經處理後，是否符合物聯網資料介面規格", function (done) {
        setTimeout(done, 300);
        let infraredInNodeConfig = JSON.parse(`[
            {
                "id": "23eda757.874b48",
                "type": "NICP-Infrared In",
                "z": "8eefe4f1.b4ef58",
                "name": "監聽電視關的訊號",
                "listenDevice": "airc",
                "listenCommand": "BTN_0",
                "x": 220,
                "y": 320,
                "wires": [
                    [
                        "a3ddf73.8503008"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        infraredInNodeConfig.push(helperNode);

        helper.load(infraredInNode, infraredInNodeConfig, function () {
            let n1 = helper.getNode(infraredInNodeConfig[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                msg.should.have.ownProperty("topic");
                msg.should.have.ownProperty("data");
                msg.should.have.ownProperty("protocolType");
                msg.should.have.ownProperty("dataId");
                (msg.data).should.have.ownProperty("irDevice");
                (msg.data).should.have.ownProperty("irCommand");
                done();
            });
            n1.receive({
                remote: "airc",
                key: "KEY_POWER"
            });
        });
    });

    it("測試輸出的資料的屬性值是否正確，", function (done) {
        setTimeout(done, 300);
        let infraredInNodeConfig = JSON.parse(`[
            {
                "id": "23eda757.874b48",
                "type": "NICP-Infrared In",
                "z": "8eefe4f1.b4ef58",
                "name": "監聽電視關的訊號",
                "listenDevice": "airc",
                "listenCommand": "BTN_0",
                "x": 220,
                "y": 320,
                "wires": [
                    [
                        "a3ddf73.8503008"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        infraredInNodeConfig.push(helperNode);

        helper.load(infraredInNode, infraredInNodeConfig, function () {
            let n1 = helper.getNode(infraredInNodeConfig[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                msg.should.have.property("topic", "監聽電視關的訊號");
                (msg.data).should.have.property("irDevice", "airc");
                (msg.data).should.have.property("irCommand", "KEY_POWER");
                msg.should.have.property("protocolType", "Infrared");
                done();
            });
            n1.receive({
                remote: "airc",
                key: "KEY_POWER"
            });
        });
    });
});