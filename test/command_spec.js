const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const commnadNode = require("../FCF-Command.js");

describe("Command節點測試", function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });
    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });
    it("測試command屬性", function (done) {
        let testFlows = JSON.parse(`[
            {
                "id":"a9d90022.19126",
                "type":"FCF-Command",
                "z":"c957d368.ea1e3",
                "name":"",
                "command":"KEY_POWER",
                "x":500,
                "y":560,
                "wires":[
                    [

                    ]
                ]
            }
        ]`);
        helper.load(commnadNode, testFlows, function () {
            let n1 = helper.getNode(testFlows[0].id);
            n1.should.have.property("command", "KEY_POWER");
            done();
        });
    });
});