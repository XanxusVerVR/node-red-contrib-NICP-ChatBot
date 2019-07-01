const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const conditionalTriggerNode = require("../NICP-ConditionalTrigger.js");
const Context = require("../red/runtime/nodes/context");

describe("ConditionalTrigger節點測試", function () {

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

    it("看config物件中是否有該有的屬性，和預設值", function (done) {
        // setTimeout(done, 20000);
        let conditionalTriggerNodeConfig = JSON.parse(`[
            {
                "id": "eade26c7.be8a98",
                "type": "NICP-ConditionalTrigger",
                "z": "386f7d55.ea1fb2",
                "name": "_name",
                "rules": [
                    {
                        "t": "gte",
                        "v": "27",
                        "vt": "str",
                        "propertyType": "msg",
                        "property": "temperature",
                        "topic": "tpTemperature"
                    },
                    {
                        "t": "gte",
                        "v": "12",
                        "vt": "str",
                        "propertyType": "msg",
                        "property": "peopleQuantity",
                        "topic": "tpPeopleQuantity"
                    }
                ],
                "configDataId": "--",
                "outputTopic": "_topic",
                "gateType": "and",
                "emitOnlyIfTrue": true,
                "x": 740,
                "y": 260,
                "wires": [
                    [
                        "453c1743.575428"
                    ]
                ]
            }
        ]`);
        helper.load(conditionalTriggerNode, conditionalTriggerNodeConfig, function () {
            let n1 = helper.getNode(conditionalTriggerNodeConfig[0].id);
            try {
                n1.should.have.property("name", "_name");
                n1.should.have.ownProperty("rules");
                n1.should.have.property("topic", "_topic");
                n1.should.have.property("type", "and");
                n1.should.have.property("emitOnlyIfTrue", true);
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("看rules陣列中是否有該有的屬性", function (done) {
        // setTimeout(done, 2000);
        let conditionalTriggerNodeConfig = JSON.parse(`[
            {
                "id": "eade26c7.be8a98",
                "type": "NICP-ConditionalTrigger",
                "z": "386f7d55.ea1fb2",
                "name": "_name",
                "rules": [
                    {
                        "t": "gte",
                        "v": "27",
                        "vt": "str",
                        "propertyType": "msg",
                        "property": "temperature",
                        "topic": "tpTemperature"
                    },
                    {
                        "t": "gte",
                        "v": "12",
                        "vt": "str",
                        "propertyType": "msg",
                        "property": "peopleQuantity",
                        "topic": "tpPeopleQuantity"
                    }
                ],
                "configDataId": "--",
                "outputTopic": "_topic",
                "gateType": "and",
                "emitOnlyIfTrue": true,
                "x": 740,
                "y": 260,
                "wires": [
                    [
                        "453c1743.575428"
                    ]
                ]
            }
        ]`);
        helper.load(conditionalTriggerNode, conditionalTriggerNodeConfig, function () {
            let n1 = helper.getNode(conditionalTriggerNodeConfig[0].id);
            try {
                for (let i = 0; i < n1.rules.length; i++) {
                    // keys的用法是，如果該物件底下預計會有6個屬性，那這6個屬性都要寫出來，不然會錯
                    (n1.rules[i]).should.have.keys("t", "v", "vt", "propertyType", "property", "topic");
                }
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("邏輯功能測試：當為or時，其中一個條件成立則觸發", function (done) {
        setTimeout(done, 300);
        let conditionalTriggerNodeConfig = JSON.parse(`[
            {
                "id": "eade26c7.be8a98",
                "type": "NICP-ConditionalTrigger",
                "z": "386f7d55.ea1fb2",
                "name": "_name",
                "rules": [
                    {
                        "t": "gte",
                        "v": "27",
                        "vt": "str",
                        "propertyType": "msg",
                        "property": "temperature",
                        "topic": "tpTemperature"
                    },
                    {
                        "t": "gte",
                        "v": "12",
                        "vt": "str",
                        "propertyType": "msg",
                        "property": "peopleQuantity",
                        "topic": "tpPeopleQuantity"
                    }
                ],
                "configDataId": "--",
                "outputTopic": "_topic",
                "gateType": "or",
                "emitOnlyIfTrue": true,
                "x": 740,
                "y": 260,
                "wires": [
                    [
                        "453c1743.575428"
                    ]
                ]
            }
        ]`);
        let helperNode = {
            id: "n2",
            type: "helper"
        };

        conditionalTriggerNodeConfig.push(helperNode);

        helper.load(conditionalTriggerNode, conditionalTriggerNodeConfig, function (err) {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(conditionalTriggerNodeConfig[0].id);
            // 讓溫度這個成立，所以要看看他存不存在
            n1.rules[0].should.have.property("property", "temperature");
            n1.rules[0].should.have.property("v", "27");
            helperNode.on("input", function (msg) {
                msg.should.have.property("bool", true);//send出去的msg是否有個屬性a，並且值為轉成小寫的uppercase
                // 印出來msg沒東西，但不知為何測試還是會通過
                // console.log(msg);
            });
            n1.receive({
                "_msgid": "e2a2543.bf6d4a8",
                "topic": "tpTemperature",
                "payload": 1560613484130,
                "temperature": 30
            });//接收前面的節點傳過來的msg物件
        });
    });

    it("邏輯功能測試：and，當msg.payload等於某個字串時，即觸發輸出", function (done) {
        setTimeout(done, 300);
        let conditionalTriggerNodeConfig = JSON.parse(`[
            {
                "id": "2a0c63a8.ca7c8c",
                "type": "NICP-ConditionalTrigger",
                "z": "e3bfd103.34ca9",
                "name": "",
                "rules": [
                    {
                        "t": "eq",
                        "v": "testOne",
                        "vt": "str",
                        "propertyType": "msg",
                        "property": "payload",
                        "topic": "topicA"
                    }
                ],
                "configDataId": "--",
                "outputTopic": "",
                "gateType": "and",
                "emitOnlyIfTrue": true,
                "x": 330,
                "y": 480,
                "wires": [
                    [
                        "9f8a3ddb.a1581"
                    ]
                ]
            }
        ]`);
        let helperNode = {
            id: "n2",
            type: "helper"
        };

        conditionalTriggerNodeConfig.push(helperNode);

        helper.load(conditionalTriggerNode, conditionalTriggerNodeConfig, function (err) {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(conditionalTriggerNodeConfig[0].id);
            // 這個測試案例Conditional Trigger的輸出:
            // {"topic":null,"payload":"testOne","bool":true,"_msgid":"12f05e6b.c33262"}
            helperNode.on("input", function (msg) {
                msg.should.have.property("bool", true);
                msg.should.have.property("payload", "testOne");
                // 印出來msg沒東西，但不知為何測試還是會通過
                // console.log(msg);
            });
            n1.receive({
                "_msgid": "69cb0ee7.8c2d2",
                "topic": "topicA",
                "payload": "testOne"
            });// 接收前面的節點傳過來的msg物件
        });
    });
});