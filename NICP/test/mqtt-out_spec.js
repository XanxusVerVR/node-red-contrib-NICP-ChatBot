const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const mqttOutNode = require("../NICP-Mqtt.js");
const Context = require("../red/runtime/nodes/context");

describe("MQTT Out節點測試", function () {

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

    it("測試config是否有該有的屬性", function (done) {
        let mqttoutNodeConfig = JSON.parse(`[
            {
                "id": "33863f66.e2f03",
                "type": "NICP-Mqtt-Out",
                "z": "4a9650e6.2666f",
                "name": "",
                "topic": "lab401/raspberrypibplus/relay/actuator/switch/fan",
                "qos": "",
                "retain": "",
                "propertyType": "str",
                "x": 650,
                "y": 160,
                "wires": []
            }
        ]`);

        helper.load(mqttOutNode, mqttoutNodeConfig, function () {
            let n1 = helper.getNode(mqttoutNodeConfig[0].id);
            n1.should.have.ownProperty("name");
            n1.should.have.ownProperty("topic");
            n1.should.have.ownProperty("qos");
            n1.should.have.ownProperty("propertyType");
            n1.should.have.ownProperty("retain");
            done();
        });
    });

    it("測試外部的資料協定類型是MQTT", function (done) {
        setTimeout(done, 300);
        let mqttoutNodeConfig = JSON.parse(`[
            {
                "id": "33863f66.e2f03",
                "type": "NICP-Mqtt-Out",
                "z": "4a9650e6.2666f",
                "name": "",
                "topic": "lab401/raspberrypibplus/relay/actuator/switch/fan",
                "qos": "",
                "retain": "",
                "propertyType": "str",
                "x": 650,
                "y": 160,
                "wires": []
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        mqttoutNodeConfig.push(helperNode);

        helper.load(mqttOutNode, mqttoutNodeConfig, function () {
            let n1 = helper.getNode(mqttoutNodeConfig[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                (msg.payload).should.have.ownProperty("command");
                (msg.payload).should.have.property("command", "on");
                done();
            });
            n1.receive({
                "_msgid": "c1ed61bc.7f745",
                "topic": "",
                "payload": {
                    "command": "on"
                }
            });
        });
    });

    it("測試要發布的訊息，是否符合物聯網資料介面規格", function (done) {
        setTimeout(done, 300);
        let mqttoutNodeConfig = JSON.parse(`[
            {
                "id": "33863f66.e2f03",
                "type": "NICP-Mqtt-Out",
                "z": "4a9650e6.2666f",
                "name": "",
                "topic": "lab401/raspberrypibplus/relay/actuator/switch/fan",
                "qos": "",
                "retain": "",
                "propertyType": "str",
                "x": 650,
                "y": 160,
                "wires": []
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        mqttoutNodeConfig.push(helperNode);

        helper.load(mqttOutNode, mqttoutNodeConfig, function () {
            let n1 = helper.getNode(mqttoutNodeConfig[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                (msg.payload).should.have.keys("topic", "data", "qos", "retain", "protocolType", "dataId");
                (msg.payload).should.have.ownProperty("command");
                (msg.payload).should.have.property("command", "on");
                done();
            });
            n1.receive({
                "_msgid": "c1ed61bc.7f745",
                "topic": "",
                "payload": {
                    "command": "on"
                }
            });
        });
    });

});