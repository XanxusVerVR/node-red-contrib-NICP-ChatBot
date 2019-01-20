const should = require("should");
const helper = require("node-red-node-test-helper");
const lowerNode = require("../lower-case");

describe("lower-case Node", function () {

    afterEach(function () {//如果沒有這行，第二個測試案例會不通過
        helper.unload();
    });
    // it("should be loaded", function (done) {
    //     let flow = [{ id: "n1", type: "lower-case", name: "test name" }];
    //     helper.load(lowerNode, flow, function () {
    //         let n1 = helper.getNode("n1");
    //         n1.should.have.property("name", "test name");
    //         done();
    //     });
    // });
});