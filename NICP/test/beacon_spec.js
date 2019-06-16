const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const beaconNode = require("../NICP-Beacon.js");
const Context = require("../red/runtime/nodes/context");

describe("Beacon節點測試", function () {
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
        let beaconNodeConfig = JSON.parse(`[
            {
                "id": "ef6445cd.8c9f98",
                "type": "NICP-Beacon",
                "z": "8eefe4f1.b4ef58",
                "name": "",
                "broadcastingMode": "iBeacon",
                "deviceName": "My Beacon",
                "txPowerLevel": "",
                "broadcastingUrl": "",
                "namespaceId": "",
                "instanceId": "",
                "uuid": "4d479b0cb92642ed9dff3aad4b943b20",
                "major": "1",
                "minor": "17",
                "measuredPower": "29",
                "x": 200,
                "y": 40,
                "wires": []
            }
        ]`);
        helper.load(beaconNode, beaconNodeConfig, function () {
            let n1 = helper.getNode(beaconNodeConfig[0].id);
            try {
                beaconNodeConfig[0].should.have.ownProperty("name");
                beaconNodeConfig[0].should.have.ownProperty("broadcastingMode");
                beaconNodeConfig[0].should.have.ownProperty("deviceName");
                beaconNodeConfig[0].should.have.ownProperty("txPowerLevel");
                beaconNodeConfig[0].should.have.ownProperty("broadcastingUrl");
                beaconNodeConfig[0].should.have.ownProperty("namespaceId");
                beaconNodeConfig[0].should.have.ownProperty("instanceId");
                beaconNodeConfig[0].should.have.ownProperty("uuid");
                beaconNodeConfig[0].should.have.ownProperty("major");
                beaconNodeConfig[0].should.have.ownProperty("minor");
                beaconNodeConfig[0].should.have.ownProperty("measuredPower");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
});