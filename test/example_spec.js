// 測試之前要請安裝相關模組: npm install node-red-node-test-helper should sinon node-red --no-save
const colors = require("colors");
const _ = require("underscore");
const should = require("should");
const helper = require("node-red-node-test-helper");
const lowerNode = require("../lower-case.js");

describe("lower-case節點測試", function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });
    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it("測試name屬性", function (done) {
        let toLowerCaseNode = JSON.parse(`[
            {
                "id": "c013f273.98d3a",
                "type": "lower-case",
                "z": "c957d368.ea1e3",
                "name": "XanxusLowerCase",
                "name2": "Xanxus",
                "inputs": 0,
                "outputs": 0,
                "x": 320,
                "y": 80,
                "wires": []
            }
        ]`);
        helper.load(lowerNode, toLowerCaseNode, function () {
            let n1 = helper.getNode(toLowerCaseNode[0].id);
            n1.should.have.property("name", "XanxusLowerCase");
            done();
        });
    });

    it("測試name2(自定義的)屬性", function (done) {
        let toLowerCaseNode = JSON.parse(`[
            {
                "id": "c013f273.98d3a",
                "type": "lower-case",
                "z": "c957d368.ea1e3",
                "name": "XanxusLowerCase",
                "name2": "Xanxus",
                "inputs": 0,
                "outputs": 0,
                "x": 320,
                "y": 80,
                "wires": []
            }
        ]`);



        helper.load(lowerNode, toLowerCaseNode, function () {
            let n1 = helper.getNode(toLowerCaseNode[0].id);
            n1.should.have.property("name2", "Xanxus");
            done();
        });
    });

    it("IO測試:是否有正確轉換成小寫", function (done) {

        let toLowerCaseNode = JSON.parse(`[
            {
                "id": "c013f273.98d3a",
                "type": "lower-case",
                "z": "c957d368.ea1e3",
                "name": "XanxusLowerCase",
                "name2": "Xanxus",
                "inputs": 0,
                "outputs": 0,
                "x": 320,
                "y": 80,
                "wires": [["n2"]]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        toLowerCaseNode.push(helperNode);

        helper.load(lowerNode, toLowerCaseNode, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(toLowerCaseNode[0].id);
            helperNode.on("input", function (msg) {
                msg.should.have.property("payload", "uppercase");//send出去的msg是否有個屬性a，並且值為轉成小寫的uppercase
                done();
            });
            n1.receive({ payload: "UpperCase" });//接收前面的節點傳過來的msg物件
        });
    });
});
