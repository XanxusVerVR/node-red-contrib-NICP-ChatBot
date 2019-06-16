const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const mqttInNode = require("../NICP-Mqtt.js");
const Context = require("../red/runtime/nodes/context");

describe("MQTT In節點測試", function () {

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
        let mqttinNodeConfig = JSON.parse(`[
            {
                "id": "73573a9.62f96c4",
                "type": "NICP-Mqtt-In",
                "z": "386f7d55.ea1fb2",
                "name": "",
                "topic": "",
                "qos": "2",
                "datatype": "auto",
                "propertyType": "str",
                "x": 300,
                "y": 440,
                "wires": [
                    []
                ]
            }
        ]`);

        helper.load(mqttInNode, mqttinNodeConfig, function () {
            let n1 = helper.getNode(mqttinNodeConfig[0].id);
            n1.should.have.ownProperty("name");
            n1.should.have.ownProperty("topic");
            n1.should.have.ownProperty("qos");
            n1.should.have.ownProperty("datatype");
            n1.should.have.ownProperty("propertyType");
            done();
        });
    });

    it("測試外部的資料協定類型是MQTT", function (done) {
        setTimeout(done, 300);
        let mqttinNodeConfig = JSON.parse(`[
            {
                "id": "73573a9.62f96c4",
                "type": "NICP-Mqtt-In",
                "z": "386f7d55.ea1fb2",
                "name": "",
                "topic": "",
                "qos": "2",
                "datatype": "auto",
                "propertyType": "str",
                "x": 300,
                "y": 440,
                "wires": [
                    []
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        mqttinNodeConfig.push(helperNode);
        helper.load(mqttInNode, mqttinNodeConfig, function () {
            let n1 = helper.getNode(mqttinNodeConfig[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                msg.should.have.ownProperty("propertyType");
                msg.should.have.property("propertyType", "MQTT");
                done();
            });
            n1.receive({
                "topic": "lab401/raspberrypibplus/dht22/sensor",
                "data": {
                    "temperature": "27.20",
                    "humidity": "59.60"
                },
                "protocolType": "MQTT",
                "dataId": "57txwirnef"
            });
        });
    });

    it("測試從外部接收到資料，經處理後，是否符合物聯網資料介面規格", function (done) {
        setTimeout(done, 300);
        let mqttinNodeConfig = JSON.parse(`[
            {
                "id": "73573a9.62f96c4",
                "type": "NICP-Mqtt-In",
                "z": "386f7d55.ea1fb2",
                "name": "",
                "topic": "",
                "qos": "2",
                "datatype": "auto",
                "propertyType": "str",
                "x": 300,
                "y": 440,
                "wires": [
                    []
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        mqttinNodeConfig.push(helperNode);
        helper.load(mqttInNode, mqttinNodeConfig, function () {
            let n1 = helper.getNode(mqttinNodeConfig[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                msg.should.have.keys("topic", "data", "qos", "retain", "protocolType", "dataId");
                done();
            });
            n1.receive({
                "topic": "lab401/raspberrypibplus/dht22/sensor",
                "data": {
                    "temperature": "27.20",
                    "humidity": "59.60"
                },
                "protocolType": "MQTT",
                "dataId": "57txwirnef"
            });
        });
    });
});