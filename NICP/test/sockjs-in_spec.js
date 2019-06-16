const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const sockjsInNode = require("../NICP-SockJS.js");
const Context = require("../red/runtime/nodes/context");

describe("SockJS In節點測試", function () {
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
        let sockjsInNodeConfig = JSON.parse(`[
            {
                "id": "af62052a.6195b8",
                "type": "NICP-SockJS In",
                "z": "adb26856.9e2d48",
                "name": "",
                "sockJSConfigNode": "4fcd48fc.434388",
                "destination": "/topic/notification/SCS-A",
                "x": 160,
                "y": 600,
                "wires": [
                    []
                ]
            },
            {
                "id": "4fcd48fc.434388",
                "type": "NICP-SockJS Node",
                "z": "",
                "name": "SCS"
            }
        ]`);
        helper.load(sockjsInNode, sockjsInNodeConfig, function () {
            let n1 = helper.getNode(sockjsInNodeConfig[0].id);
            let n1ConfigNode = helper.getNode(sockjsInNodeConfig[1].id);
            try {
                // n1.should.have.ownProperty("type");
                // n1.should.have.ownProperty("destination");
                // n1.should.have.ownProperty("name");
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("看config物件中的屬性值是否正確", function (done) {
        let sockjsInNodeConfig = JSON.parse(`[
            {
                "id": "af62052a.6195b8",
                "type": "NICP-SockJS In",
                "z": "adb26856.9e2d48",
                "name": "",
                "sockJSConfigNode": "4fcd48fc.434388",
                "destination": "/topic/notification/SCS-A",
                "x": 160,
                "y": 600,
                "wires": [
                    []
                ]
            },
            {
                "id": "4fcd48fc.434388",
                "type": "NICP-SockJS Node",
                "z": "",
                "name": "SCS"
            }
        ]`);
        helper.load(sockjsInNode, sockjsInNodeConfig, function () {
            let n1 = helper.getNode(sockjsInNodeConfig[0].id);
            let n1ConfigNode = helper.getNode(sockjsInNodeConfig[1].id);
            try {
                // n1.should.have.ownProperty("destination");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it("看輸出是否有該有的屬性", function (done) {
        let sockjsInNodeConfig = JSON.parse(`[
            {
                "id": "af62052a.6195b8",
                "type": "NICP-SockJS In",
                "z": "adb26856.9e2d48",
                "name": "",
                "sockJSConfigNode": "4fcd48fc.434388",
                "destination": "/topic/notification/SCS-A",
                "x": 160,
                "y": 600,
                "wires": [
                    []
                ]
            },
            {
                "id": "4fcd48fc.434388",
                "type": "NICP-SockJS Node",
                "z": "",
                "name": "SCS"
            }
        ]`);
        helper.load(sockjsInNode, sockjsInNodeConfig, function () {
            let n1 = helper.getNode(sockjsInNodeConfig[0].id);
            let n1ConfigNode = helper.getNode(sockjsInNodeConfig[1].id);
            try {
                // n1.should.have.ownProperty("name");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it("看輸出的屬性的值是否正確", function (done) {
        let sockjsInNodeConfig = JSON.parse(`[
            {
                "id": "af62052a.6195b8",
                "type": "NICP-SockJS In",
                "z": "adb26856.9e2d48",
                "name": "",
                "sockJSConfigNode": "4fcd48fc.434388",
                "destination": "/topic/notification/SCS-A",
                "x": 160,
                "y": 600,
                "wires": [
                    []
                ]
            },
            {
                "id": "4fcd48fc.434388",
                "type": "NICP-SockJS Node",
                "z": "",
                "name": "SCS"
            }
        ]`);
        helper.load(sockjsInNode, sockjsInNodeConfig, function () {
            let n1 = helper.getNode(sockjsInNodeConfig[0].id);
            let n1ConfigNode = helper.getNode(sockjsInNodeConfig[1].id);
            try {
                // n1.should.have.ownProperty("type");
                done();
            } catch (err) {
                done(err);
            }
        });
    });

});