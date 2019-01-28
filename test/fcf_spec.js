const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const commnadNode = require("../FCF-Command");
helper.init(require.resolve("node-red"));//不確定這樣有沒有抓到node-red

describe("Command節點測試", function () {//Command節點helper框架無法測試

    beforeEach(function (done) {
        helper.startServer(done);
    });
    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });
    it("節點是否有叫command的屬性，有的話，值是否為KEY_POWER", function (done) {
        let flow = [
            {
                "id": "50f94e06.574fa",
                "type": "FCF-Command",
                "z": "d87ce6a6.851728",
                "name": "aaaa",
                "command": "KEY_POWER",
                "x": 440,
                "y": 260,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            },
            { id: "n2", type: "helper" }
        ];
        helper.load(commnadNode, flow, function () {
            let n1 = helper.getNode(flow[0].id);
            n1.should.have.property("command", "KEY_POWER");
            done();
        });
    });
});