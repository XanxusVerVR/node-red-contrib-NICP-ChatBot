const should = require("should");
const helper = require("node-red-node-test-helper");

describe("lower-case Node", function () {

    afterEach(function () {//如果沒有這行，第二個測試案例會不通過
        helper.unload();
    });
});