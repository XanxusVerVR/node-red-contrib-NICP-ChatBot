let should = require("should");
let helper = require("node-red-node-test-helper");
let lowerNode = require("../lower-case.js");

describe("lower-case Node", function () {

    afterEach(function () {//如果沒有這行，第二個測試案例會不通過
        helper.unload();
    });

    it("測試此節點使用者定義的名稱是否為aaa", function (done) {
        let flow = [
            {
                "id": "ba23e170.6c734",
                "type": "lower-case",
                "z": "9fdb8a20.7c04d8",
                "name": "aaa",
                "x": 1020,
                "y": 480,
                "wires": [
                    []
                ]
            }
        ];
        helper.load(lowerNode, flow, function () {
            let node = helper.getNode(flow[0].id);
            node.should.have.property("name", "aaa");
            done();
        });
    });

    it("測試payload的字串是否有轉為小寫", function (done) {
        let flow = [{ id: "n1", type: "lower-case", name: "test name", wires: [["n2"]] },
        { id: "n2", type: "helper" }];
        helper.load(lowerNode, flow, function () {
            let n2 = helper.getNode("n2");
            let n1 = helper.getNode("n1");
            n2.on("input", function (msg) {
                msg.should.have.property("payload", "uppercase");
                done();
            });
            n1.receive({ payload: "UpperCase" });//這行一定要在最後
        });
    });

    it("測試payload的字串是否有轉為小寫(自己拉的節點)", function (done) {
        // let flow = [{ id: "n1", type: "lower-case", name: "test name", wires: [["n2"]] },
        // { id: "n2", type: "helper" }];
        let flow = [
            {
                "id": "n1",
                "type": "lower-case",
                "z": "9fdb8a20.7c04d8",
                "name": "aaa",
                "x": 1020,
                "y": 480,
                "wires": [
                    [["n2"]]
                ]
            },
            { id: "n2", type: "helper" }
        ];
        // 定義兩個節點
        /* let flow = [
            {
                "id": "34368fe0.57c51",
                "type": "inject",
                "z": "9fdb8a20.7c04d8",
                "name": "",
                "topic": "",
                "payload": "ABC",
                "payloadType": "str",
                "repeat": "",
                "crontab": "",
                "once": false,
                "onceDelay": 0.1,
                "x": 410,
                "y": 940,
                "wires": [
                    [
                        "6e5163bb.99704c"
                    ]
                ]
            },
            {
                "id": "n1",
                "type": "lower-case",
                "z": "9fdb8a20.7c04d8",
                "name": "",
                "x": 560,
                "y": 940,
                "wires": [
                    [["n2"]]
                ]
            },
            { id: "n2", type: "helper" }
        ]; */
        helper.load(lowerNode, flow, function () {
            let n2 = helper.getNode("n2");
            let n1 = helper.getNode("n1");
            n2.on("input", function (msg) {
                msg.should.have.property("payload", "uppercase");
                done();
            });
            n1.receive({ payload: "UpperCase" });
        });
    });
});