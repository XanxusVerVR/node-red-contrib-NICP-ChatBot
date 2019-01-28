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
    it("節點是否有叫command的屬性，有的話，值是否為KEY_POWER", function (done) {
        let testFlows = [
            {
                "id": "cf6f4bbe.6afff8",
                "type": "FCF-Command",
                "z": "8f8a71ea.ab8d6",
                "name": "aaa",
                "command": "KEY_POWERS",
                "x": 500,
                "y": 200,
                "wires": [
                    [

                    ]
                ]
            }
        ];
        helper.load(commnadNode, testFlows, function () {
            let n1 = helper.getNode(testFlows[0].id);
            n1.should.have.property("command", "KEY_POWER");
            done();
        });
    });
});