const colors = require("colors");
const _ = require("underscore");
const should = require("should");
const helper = require("node-red-node-test-helper");
const fcfStatusNode = require("../NICP-Status.js");

describe("Status節點測試", function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });
    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it("測試propertyType屬性預設值", function (done) {
        let statusNode = JSON.parse(`[
            {
                "id": "7ffe7386.e316cc",
                "type": "NICP-Status",
                "z": "a23eccc3.30fa7",
                "name": "",
                "propertyType": "msg",
                "property": "payload",
                "propertyType2": "msg",
                "property2": "payload",
                "mode": "displayStatus",
                "isInputAndOutput": true,
                "inputs": 1,
                "outputs": 1,
                "rules": [
                    {
                        "comparisonOperator": "eq",
                        "beingComparedPropertyType": "str",
                        "beingComparedProperty": "DefaultString",
                        "fill": "red",
                        "shape": "ring",
                        "text": "disconnected"
                    }
                ],
                "bigFill": "red",
                "bigShape": "ring",
                "valStatusUnit": "度",
                "x": 430,
                "y": 140,
                "wires": [
                    []
                ]
            }
        ]`);
        helper.load(fcfStatusNode, statusNode, function () {
            let n1 = helper.getNode(statusNode[0].id);
            try {
                n1.should.have.property("propertyType", "msg");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it("測試property屬性預設值", function (done) {
        let statusNode = JSON.parse(`[
            {
                "id": "7ffe7386.e316cc",
                "type": "NICP-Status",
                "z": "a23eccc3.30fa7",
                "name": "",
                "propertyType": "msg",
                "property": "payload",
                "propertyType2": "msg",
                "property2": "payload",
                "mode": "displayStatus",
                "isInputAndOutput": true,
                "inputs": 1,
                "outputs": 1,
                "rules": [
                    {
                        "comparisonOperator": "eq",
                        "beingComparedPropertyType": "str",
                        "beingComparedProperty": "DefaultString",
                        "fill": "red",
                        "shape": "ring",
                        "text": "disconnected"
                    }
                ],
                "bigFill": "red",
                "bigShape": "ring",
                "valStatusUnit": "度",
                "x": 430,
                "y": 140,
                "wires": [
                    []
                ]
            }
        ]`);
        helper.load(fcfStatusNode, statusNode, function () {
            let n1 = helper.getNode(statusNode[0].id);
            try {
                n1.should.have.property("property", "payload");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it("測試propertyType2屬性預設值", function (done) {
        let statusNode = JSON.parse(`[
            {
                "id": "7ffe7386.e316cc",
                "type": "NICP-Status",
                "z": "a23eccc3.30fa7",
                "name": "",
                "propertyType": "msg",
                "property": "payload",
                "propertyType2": "msg",
                "property2": "payload",
                "mode": "displayStatus",
                "isInputAndOutput": true,
                "inputs": 1,
                "outputs": 1,
                "rules": [
                    {
                        "comparisonOperator": "eq",
                        "beingComparedPropertyType": "str",
                        "beingComparedProperty": "DefaultString",
                        "fill": "red",
                        "shape": "ring",
                        "text": "disconnected"
                    }
                ],
                "bigFill": "red",
                "bigShape": "ring",
                "valStatusUnit": "度",
                "x": 430,
                "y": 140,
                "wires": [
                    []
                ]
            }
        ]`);
        helper.load(fcfStatusNode, statusNode, function () {
            let n1 = helper.getNode(statusNode[0].id);
            try {
                n1.should.have.property("propertyType2", "msg");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it("測試property2屬性預設值", function (done) {
        let statusNode = JSON.parse(`[
            {
                "id": "7ffe7386.e316cc",
                "type": "NICP-Status",
                "z": "a23eccc3.30fa7",
                "name": "",
                "propertyType": "msg",
                "property": "payload",
                "propertyType2": "msg",
                "property2": "payload",
                "mode": "displayStatus",
                "isInputAndOutput": true,
                "inputs": 1,
                "outputs": 1,
                "rules": [
                    {
                        "comparisonOperator": "eq",
                        "beingComparedPropertyType": "str",
                        "beingComparedProperty": "DefaultString",
                        "fill": "red",
                        "shape": "ring",
                        "text": "disconnected"
                    }
                ],
                "bigFill": "red",
                "bigShape": "ring",
                "valStatusUnit": "度",
                "x": 430,
                "y": 140,
                "wires": [
                    []
                ]
            }
        ]`);
        helper.load(fcfStatusNode, statusNode, function () {
            let n1 = helper.getNode(statusNode[0].id);
            try {
                n1.should.have.property("property2", "payload");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it("預設模式mode屬性為displayStatus", function (done) {
        let statusNode = JSON.parse(`[
            {
                "id": "7ffe7386.e316cc",
                "type": "NICP-Status",
                "z": "a23eccc3.30fa7",
                "name": "",
                "propertyType": "msg",
                "property": "payload",
                "propertyType2": "msg",
                "property2": "payload",
                "mode": "displayStatus",
                "isInputAndOutput": true,
                "inputs": 1,
                "outputs": 1,
                "rules": [
                    {
                        "comparisonOperator": "eq",
                        "beingComparedPropertyType": "str",
                        "beingComparedProperty": "DefaultString",
                        "fill": "red",
                        "shape": "ring",
                        "text": "disconnected"
                    }
                ],
                "bigFill": "red",
                "bigShape": "ring",
                "valStatusUnit": "度",
                "x": 430,
                "y": 140,
                "wires": [
                    []
                ]
            }
        ]`);
        helper.load(fcfStatusNode, statusNode, function () {
            let n1 = helper.getNode(statusNode[0].id);
            try {
                n1.should.have.property("mode", "displayStatus");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it("測試rules屬性是否為預設的陣列內容", function (done) {
        let statusNode = JSON.parse(`[
            {
                "id": "7ffe7386.e316cc",
                "type": "NICP-Status",
                "z": "a23eccc3.30fa7",
                "name": "",
                "propertyType": "msg",
                "property": "payload",
                "propertyType2": "msg",
                "property2": "payload",
                "mode": "displayStatus",
                "isInputAndOutput": true,
                "inputs": 1,
                "outputs": 1,
                "rules": [
                    {
                        "comparisonOperator": "eq",
                        "beingComparedPropertyType": "str",
                        "beingComparedProperty": "DefaultString",
                        "fill": "red",
                        "shape": "ring",
                        "text": "disconnected"
                    }
                ],
                "bigFill": "red",
                "bigShape": "ring",
                "valStatusUnit": "度",
                "x": 430,
                "y": 140,
                "wires": [
                    []
                ]
            }
        ]`);
        helper.load(fcfStatusNode, statusNode, function () {
            let n1 = helper.getNode(statusNode[0].id);
            try {
                n1.should.have.property("rules", [{
                    comparisonOperator: "eq",
                    beingComparedPropertyType: "str",
                    beingComparedProperty: "DefaultString",
                    fill: "red",
                    shape: "ring",
                    text: "disconnected"
                }]);
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it("測試bigFill屬性的預設值", function (done) {
        let statusNode = JSON.parse(`[
            {
                "id": "7ffe7386.e316cc",
                "type": "NICP-Status",
                "z": "a23eccc3.30fa7",
                "name": "",
                "propertyType": "msg",
                "property": "payload",
                "propertyType2": "msg",
                "property2": "payload",
                "mode": "displayStatus",
                "isInputAndOutput": true,
                "inputs": 1,
                "outputs": 1,
                "rules": [
                    {
                        "comparisonOperator": "eq",
                        "beingComparedPropertyType": "str",
                        "beingComparedProperty": "DefaultString",
                        "fill": "red",
                        "shape": "ring",
                        "text": "disconnected"
                    }
                ],
                "bigFill": "red",
                "bigShape": "ring",
                "valStatusUnit": "度",
                "x": 430,
                "y": 140,
                "wires": [
                    []
                ]
            }
        ]`);
        helper.load(fcfStatusNode, statusNode, function () {
            let n1 = helper.getNode(statusNode[0].id);
            try {
                n1.should.have.property("bigFill","red");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it("測試bigShape屬性的預設值", function (done) {
        let statusNode = JSON.parse(`[
            {
                "id": "7ffe7386.e316cc",
                "type": "NICP-Status",
                "z": "a23eccc3.30fa7",
                "name": "",
                "propertyType": "msg",
                "property": "payload",
                "propertyType2": "msg",
                "property2": "payload",
                "mode": "displayStatus",
                "isInputAndOutput": true,
                "inputs": 1,
                "outputs": 1,
                "rules": [
                    {
                        "comparisonOperator": "eq",
                        "beingComparedPropertyType": "str",
                        "beingComparedProperty": "DefaultString",
                        "fill": "red",
                        "shape": "ring",
                        "text": "disconnected"
                    }
                ],
                "bigFill": "red",
                "bigShape": "ring",
                "valStatusUnit": "度",
                "x": 430,
                "y": 140,
                "wires": [
                    []
                ]
            }
        ]`);
        helper.load(fcfStatusNode, statusNode, function () {
            let n1 = helper.getNode(statusNode[0].id);
            try {
                n1.should.have.property("bigShape","ring");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it("測試valStatusUnit屬性的預設值", function (done) {
        let statusNode = JSON.parse(`[
            {
                "id": "7ffe7386.e316cc",
                "type": "NICP-Status",
                "z": "a23eccc3.30fa7",
                "name": "",
                "propertyType": "msg",
                "property": "payload",
                "propertyType2": "msg",
                "property2": "payload",
                "mode": "displayStatus",
                "isInputAndOutput": true,
                "inputs": 1,
                "outputs": 1,
                "rules": [
                    {
                        "comparisonOperator": "eq",
                        "beingComparedPropertyType": "str",
                        "beingComparedProperty": "DefaultString",
                        "fill": "red",
                        "shape": "ring",
                        "text": "disconnected"
                    }
                ],
                "bigFill": "red",
                "bigShape": "ring",
                "valStatusUnit": "度",
                "x": 430,
                "y": 140,
                "wires": [
                    []
                ]
            }
        ]`);
        helper.load(fcfStatusNode, statusNode, function () {
            let n1 = helper.getNode(statusNode[0].id);
            try {
                n1.should.have.property("valStatusUnit","度");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it("測試rules屬性有多個物件陣列", function (done) {
        let statusNode = JSON.parse(`[
            {
                "id": "7ffe7386.e316cc",
                "type": "NICP-Status",
                "z": "a23eccc3.30fa7",
                "name": "",
                "propertyType": "msg",
                "property": "payload",
                "propertyType2": "msg",
                "property2": "payload",
                "mode": "displayStatus",
                "isInputAndOutput": true,
                "inputs": 1,
                "outputs": 1,
                "rules": [
                    {
                        "comparisonOperator": "eq",
                        "beingComparedPropertyType": "str",
                        "beingComparedProperty": "DefaultString",
                        "fill": "red",
                        "shape": "ring",
                        "text": "disconnected"
                    },
                    {
                        "comparisonOperator": "gt",
                        "beingComparedPropertyType": "num",
                        "beingComparedProperty": "50",
                        "fill": "green",
                        "shape": "dot",
                        "text": "connected"
                    }
                ],
                "bigFill": "red",
                "bigShape": "ring",
                "valStatusUnit": "度",
                "x": 430,
                "y": 140,
                "wires": [
                    []
                ]
            }
        ]`);
        helper.load(fcfStatusNode, statusNode, function () {
            let n1 = helper.getNode(statusNode[0].id);
            try {
                n1.should.have.property("rules", [{
                    comparisonOperator: "eq",
                    beingComparedPropertyType: "str",
                    beingComparedProperty: "DefaultString",
                    fill: "red",
                    shape: "ring",
                    text: "disconnected"
                },{
                    comparisonOperator: "gt",
                    beingComparedPropertyType: "num",
                    beingComparedProperty: "50",
                    fill: "green",
                    shape: "dot",
                    text: "connected"
                }
                ]);
                done();
            } catch (err) {
                done(err);
            }
        });
    });
});
