let should = require("should");
let helper = require("node-red-node-test-helper");
let lowerNode = require("../lower-case");

describe("lower-case Node", function () {

    // beforeEach(function (done) {
    //     helper.startServer(done);
    // });
    // afterEach(function (done) {
    //     helper.unload();
    //     helper.stopServer(done);
    // });

    // it("should be loaded", function (done) {
    //     let flow = [{ id: "n1", type: "lower-case", name: "test name" }];
    //     helper.load(lowerNode, flow, function () {
    //         let n1 = helper.getNode("n1");
    //         n1.should.have.property("name", "test name");
    //         done();
    //     });
    // });

    //     it("should make payload lower case", function (done) {
    //         let flow = [{ id: "n1", type: "lower-case", name: "test name", wires: [["n2"]] },
    //         { id: "n2", type: "helper" }];
    //         helper.load(lowerNode, flow, function () {
    //             let n2 = helper.getNode("n2");
    //             let n1 = helper.getNode("n1");
    //             n2.on("input", function (msg) {
    //                 msg.should.have.property("payload", "uppercase");
    //                 done();
    //             });
    //             n1.receive({ payload: "UpperCase" });
    //         });
    //     });
});
