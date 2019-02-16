const _ = require("underscore");
const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const assert = require("assert");
const fcfFrameNode = require("../FCF-Frame.js");
const Context = require("../red/runtime/nodes/context");

describe("Frame節點測試", function () {

    this.timeout(0.5 * 1000);

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

    it("測試name，當使用者沒填的時候，要有預設值", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "553085be.2da87c",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "",
                "className": "",
                "outputs": 1,
                "x": 450,
                "y": 540,
                "wires": [
                    []
                ]
            }
        ]`);
        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            n1.should.have.property("name", "My Frame Node");
            done();
        });
    });

    it("測試使用者自定義的name(節點的名稱)的值", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "e62c9a56.7fd688",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "phone",
                "className": "phone",
                "outputs": 1,
                "x": 480,
                "y": 200,
                "wires": [
                    [
                        "6ba01cd8.7e8a64"
                    ]
                ]
            }
        ]`);
        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            n1.should.have.property("name", "phone");
            done();
        });
    });

    it("測試Frame節點串在Data Collection和Pull Service中間時(此為手機選購案例中的一段flow，且為Data Collection將資料收集完成後的輸出)，輸出的msg.query的內容值是否正確", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "e62c9a56.7fd688",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "phone",
                "className": "phone",
                "outputs": 1,
                "x": 480,
                "y": 200,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        frameNode.push(helperNode);

        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                msg.query.should.have.property("brand", "HTC");
                msg.query.should.have.property("price", "99999");
                done();
            });
            n1.receive({
                "payload": {
                    "chatId": "1001653183292396",
                    "messageId": "wjzbJ1SjzMbBgNauILqQYb4yXfIfO-uH986X9qnG8wTmHTltGxW1VlkRmLZLBDPEe7vPIVheyGFKVl3hh0IIDw",
                    "type": "message",
                    "content": "99999",
                    "date": "2019-02-16T11:32:02.736Z",
                    "inbound": true
                },
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "1517c931.3d0597",
                "_event": "node:5307cb55.73b9d4",
                "whetherToSendLocation": false,
                "query": {
                    "brand": "HTC",
                    "price": "99999"
                }
            });
        });
    });

    it("測試Frame節點串在Data Collection和Pull Service中間時(此為手機選購案例中的一段flow，且為Data Collection將資料收集完成後的輸出)，輸出的msg.frame的內容值是否正確", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "e62c9a56.7fd688",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "phone",
                "className": "phone",
                "outputs": 1,
                "x": 480,
                "y": 200,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        frameNode.push(helperNode);

        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                msg.frame.Query.should.have.property("brand", "HTC");
                msg.frame.Query.should.have.property("price", "99999");
                let userDataObjectIsEmpty = _.isEmpty(msg.frame.UserData);
                assert.equal(userDataObjectIsEmpty, true);
                let resultObjectIsEmpty = _.isEmpty(msg.frame.Result);
                assert.equal(resultObjectIsEmpty, true);
                done();
            });
            n1.receive({
                "payload": {
                    "chatId": "1001653183292396",
                    "messageId": "wjzbJ1SjzMbBgNauILqQYb4yXfIfO-uH986X9qnG8wTmHTltGxW1VlkRmLZLBDPEe7vPIVheyGFKVl3hh0IIDw",
                    "type": "message",
                    "content": "99999",
                    "date": "2019-02-16T11:32:02.736Z",
                    "inbound": true
                },
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "1517c931.3d0597",
                "_event": "node:5307cb55.73b9d4",
                "whetherToSendLocation": false,
                "query": {
                    "brand": "HTC",
                    "price": "99999"
                }
            });
        });
    });

    it("當Frame接在Pull Service和Message之間時，Frame的輸出的payload有沒有拿到要傳給使用者的查詢結果訊息", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "e62c9a56.7fd688",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "phone",
                "className": "phone",
                "outputs": 1,
                "x": 480,
                "y": 200,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        frameNode.push(helperNode);

        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                msg.should.have.property("payload", "我幫您找到了這台手機：SONY的Sony Xperia XZ Premium。售價為24899元，相機有1900萬畫素，螢幕有5.5吋，容量有64G。請問還可以嗎？");
                done();
            });
            n1.receive({
                "payload": "我幫您找到了這台手機：SONY的Sony Xperia XZ Premium。售價為24899元，相機有1900萬畫素，螢幕有5.5吋，容量有64G。請問還可以嗎？",
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "9bceff2a.0604b",
                "_event": "node:c2790c.9a1a06f8",
                "query": {
                    "brand": "SONY"
                },
                "frame": {
                    "Query": {
                        "brand": "SONY",
                        "price": "99999"
                    },
                    "UserData": {},
                    "Result": {
                        "mobile": "HTC U11",
                        "id": "H001"
                    }
                },
                "result": {
                    "mobile": "Sony Xperia XZ Premium",
                    "id": "S001"
                }
            });
        });
    });

    it("當Frame接在Pull Service和Message之間時，Frame有沒有將Pull Service查詢完得資料存到Result裡(大寫的)", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "e62c9a56.7fd688",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "phone",
                "className": "phone",
                "outputs": 1,
                "x": 480,
                "y": 200,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        frameNode.push(helperNode);

        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                msg.frame.Result.should.have.property("mobile", "Sony Xperia XZ Premium");
                msg.frame.Result.should.have.property("id", "S001");
                done();
            });
            n1.receive({
                "payload": "我幫您找到了這台手機：SONY的Sony Xperia XZ Premium。售價為24899元，相機有1900萬畫素，螢幕有5.5吋，容量有64G。請問還可以嗎？",
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "9bceff2a.0604b",
                "_event": "node:c2790c.9a1a06f8",
                "query": {
                    "brand": "SONY"
                },
                "frame": {
                    "Query": {
                        "brand": "SONY",
                        "price": "99999"
                    },
                    "UserData": {},
                    "Result": {
                        "mobile": "HTC U11",
                        "id": "H001"
                    }
                },
                "result": {
                    "mobile": "Sony Xperia XZ Premium",
                    "id": "S001"
                }
            });
        });
    });

    it("當Frame接在Pull Service和Message之間時，Frame有沒有將Pull Service查詢完得資料存到result裡(小寫的)", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "e62c9a56.7fd688",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "phone",
                "className": "phone",
                "outputs": 1,
                "x": 480,
                "y": 200,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        frameNode.push(helperNode);

        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                msg.result.should.have.property("mobile", "Sony Xperia XZ Premium");
                msg.result.should.have.property("id", "S001");
                done();
            });
            n1.receive({
                "payload": "我幫您找到了這台手機：SONY的Sony Xperia XZ Premium。售價為24899元，相機有1900萬畫素，螢幕有5.5吋，容量有64G。請問還可以嗎？",
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "9bceff2a.0604b",
                "_event": "node:c2790c.9a1a06f8",
                "query": {
                    "brand": "SONY"
                },
                "frame": {
                    "Query": {
                        "brand": "SONY",
                        "price": "99999"
                    },
                    "UserData": {},
                    "Result": {
                        "mobile": "HTC U11",
                        "id": "H001"
                    }
                },
                "result": {
                    "mobile": "Sony Xperia XZ Premium",
                    "id": "S001"
                }
            });
        });
    });

    it("Frame接KeywordExtraction之後，是否有將關鍵字存起來", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "e62c9a56.7fd688",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "phone",
                "className": "phone",
                "outputs": 1,
                "x": 480,
                "y": 200,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        frameNode.push(helperNode);

        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {

                msg.query.should.have.property("brand", "SONY");
                msg.frame.Query.should.have.property("brand", "SONY");

                done();
            });
            n1.receive({
                "payload": {
                    "chatId": "1001653183292396",
                    "messageId": "GoV82Z-HWnwTC8JUT0wMnL4yXfIfO-uH986X9qnG8wTPOZMOKiegzDS121NogrWB2DIvKNm567zi4lOOF_pl5Q",
                    "type": "message",
                    "content": "我想換sony",
                    "date": "2019-02-16T11:52:13.055Z",
                    "inbound": true
                },
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "9bceff2a.0604b",
                "_event": "node:c2790c.9a1a06f8",
                "query": {
                    "brand": "SONY"
                }
            });
        });
    });

    it("Frame接收Pull Service第二次查詢的結果，測試是否有將新結果存起來，和有沒有設置要給使用者看得新結果訊息", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "e62c9a56.7fd688",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "phone",
                "className": "phone",
                "outputs": 1,
                "x": 480,
                "y": 200,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        frameNode.push(helperNode);

        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {

                msg.should.have.property("payload", "我幫您找到了這台手機：SONY的Sony Xperia XZ Premium。售價為24899元，相機有1900萬畫素，螢幕有5.5吋，容量有64G。請問還可以嗎？");
                msg.frame.Result.should.have.property("mobile", "Sony Xperia XZ Premium");
                msg.frame.Result.should.have.property("id", "S001");

                done();
            });
            n1.receive({
                "payload": "我幫您找到了這台手機：SONY的Sony Xperia XZ Premium。售價為24899元，相機有1900萬畫素，螢幕有5.5吋，容量有64G。請問還可以嗎？",
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "9bceff2a.0604b",
                "_event": "node:c2790c.9a1a06f8",
                "query": {
                    "brand": "SONY"
                },
                "frame": {
                    "Query": {
                        "brand": "SONY",
                        "price": "99999"
                    },
                    "UserData": {},
                    "Result": {
                        "mobile": "HTC U11",
                        "id": "H001"
                    }
                },
                "result": {
                    "mobile": "Sony Xperia XZ Premium",
                    "id": "S001"
                }
            });
        });
    });

    it("測試Frame是否有把Data Collection的User Data模式的資料存起來放到UserData、userData屬性裡，並且輸出", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "e62c9a56.7fd688",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "phone",
                "className": "phone",
                "outputs": 1,
                "x": 480,
                "y": 200,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        frameNode.push(helperNode);

        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {

                msg.userData.should.have.property("UserID", "1001653183292396");
                msg.userData.should.have.property("phone", "098899889");
                msg.userData.should.have.property("name", "戴碩泓");

                msg.userData.should.have.property("UserID", "1001653183292396");
                msg.userData.should.have.property("phone", "098899889");
                msg.frame.UserData.should.have.property("name", "戴碩泓");

                done();
            });
            n1.receive({
                "payload": {
                    "chatId": "1001653183292396",
                    "messageId": "5FNviZouZtom0dC8Z9MbP74yXfIfO-uH986X9qnG8wTifIlKNqiwWcnf2crz1eCYb2fH2-0r4r338q0MGW1u5w",
                    "type": "message",
                    "content": "戴碩泓",
                    "date": "2019-02-16T11:52:25.061Z",
                    "inbound": true
                },
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "c356b43b.203e08",
                "_event": "node:698d1187.bd9b3",
                "whetherToSendLocation": false,
                "userData": {
                    "UserID": "1001653183292396",
                    "phone": "098899889",
                    "name": "戴碩泓"
                }
            });
        });
    });

    it("測試Frame節點串在Data Collection和Pull Service中間時(此為手機選購案例中的一段flow，且為Data Collection將資料收集完成後的輸出，當使用者查第一次食)，是否有將Data Collection的資料存到context flow物件中", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "e62c9a56.7fd688",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "phone",
                "className": "phone",
                "outputs": 1,
                "x": 480,
                "y": 200,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        frameNode.push(helperNode);

        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                let contextFlowFrame = n1.context().flow.get("frame");
                let userDataObjectIsEmpty = _.isEmpty(contextFlowFrame.phone.UserData);
                let resultObjectIsEmpty = _.isEmpty(contextFlowFrame.phone.Result);
                assert.equal(userDataObjectIsEmpty, true);
                assert.equal(resultObjectIsEmpty, true);
                try {
                    contextFlowFrame.phone.Query.should.have.property("brand", "HTC");
                    contextFlowFrame.phone.Query.should.have.property("price", "99999");
                    done();
                } catch (err) {
                    done(err);
                }
            });
            n1.receive({
                "payload": {
                    "chatId": "1001653183292396",
                    "messageId": "wjzbJ1SjzMbBgNauILqQYb4yXfIfO-uH986X9qnG8wTmHTltGxW1VlkRmLZLBDPEe7vPIVheyGFKVl3hh0IIDw",
                    "type": "message",
                    "content": "99999",
                    "date": "2019-02-16T11:32:02.736Z",
                    "inbound": true
                },
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "1517c931.3d0597",
                "_event": "node:5307cb55.73b9d4",
                "whetherToSendLocation": false,
                "query": {
                    "brand": "HTC",
                    "price": "99999"
                }
            });
        });
    });

    it("當Frame接在Pull Service和Message之間時，這裡的Frame有沒有把Pull Service的查詢結果存到flow裡", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "e62c9a56.7fd688",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "phone",
                "className": "phone",
                "outputs": 1,
                "x": 480,
                "y": 200,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        frameNode.push(helperNode);

        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                let contextFlowFrame = n1.context().flow.get("frame");
                let userDataObjectIsEmpty = _.isEmpty(contextFlowFrame.phone.UserData);
                assert.equal(userDataObjectIsEmpty, true);
                try {
                    contextFlowFrame.phone.Result.should.have.property("mobile", "HTC U11");
                    contextFlowFrame.phone.Result.should.have.property("id", "H001");
                    done();
                } catch (err) {
                    done(err);
                }
            });
            n1.receive({
                "payload": "我幫您找到了這台手機：HTC的HTC U11。售價為18523元，相機有1200萬畫素，螢幕有5.5吋，容量有64G。請問還可以嗎？",
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "c8a84607.0d9f98",
                "_event": "node:5307cb55.73b9d4",
                "whetherToSendLocation": false,
                "query": {
                    "brand": "HTC",
                    "price": "99999"
                },
                "frame": {
                    "Query": {
                        "brand": "HTC",
                        "price": "99999"
                    },
                    "UserData": {},
                    "Result": {}
                },
                "result": {
                    "mobile": "HTC U11",
                    "id": "H001"
                }
            });
        });
    });

    it("Frame接KeywordExtraction之後，是否有將關鍵字存到flow", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "e62c9a56.7fd688",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "phone",
                "className": "phone",
                "outputs": 1,
                "x": 480,
                "y": 200,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        frameNode.push(helperNode);

        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                let contextFlowFrame = n1.context().flow.get("frame");
                let userDataObjectIsEmpty = _.isEmpty(contextFlowFrame.phone.UserData);
                assert.equal(userDataObjectIsEmpty, true);
                try {
                    contextFlowFrame.phone.Query.should.have.property("brand", "SONY");
                    contextFlowFrame.phone.Query.should.have.property("price", "88888");//因下面有set frame，所以這裡才找得到price
                    done();
                } catch (err) {
                    done(err);
                }

            });
            //由手機選購機器人案例為例，frame.js裡會再次get一次flow.frame，因此當使用者要更換sony時，frame最後才有price屬性，所以要在這裡設一次frame，才能模擬真實flow執行時的frame的內容和狀態
            n1.context().flow.set("frame", JSON.parse(`{
                "phone": {
                    "Query": {
                        "brand": "HTC",
                        "price": "88888"
                    },
                    "UserData": {},
                    "Result": {
                        "mobile": "HTC U11",
                        "id": "H001"
                    }
                }
            }`));
            n1.receive({
                "payload": {
                    "chatId": "1001653183292396",
                    "messageId": "dPhKoNi_ZA12q6rlXP5-tb4yXfIfO-uH986X9qnG8wThE6KQHB7fbt9AtEKnL3bYvo7e2mQl-3FAiPFO54haRw",
                    "type": "message",
                    "content": "我想換sony",
                    "date": "2019-02-16T13:44:53.381Z",
                    "inbound": true
                },
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "68e35bfa.a9d234",
                "_event": "node:c2790c.9a1a06f8",
                "query": {
                    "brand": "SONY"
                }
            });
        });
    });

    //it模板
    /* it("", function (done) {
        let frameNode = JSON.parse(`[
            {
                "id": "e62c9a56.7fd688",
                "type": "FCF-Frame",
                "z": "9fdb8a20.7c04d8",
                "name": "phone",
                "className": "phone",
                "outputs": 1,
                "x": 480,
                "y": 200,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]`);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        frameNode.push(helperNode);

        helper.load(fcfFrameNode, frameNode, function () {
            let n1 = helper.getNode(frameNode[0].id);
            let helperNode = helper.getNode("n2");
            helperNode.on("input", function (msg) {
                msg.query.should.have.property("", "");
                done();
            });
            n1.receive({
            });
        });
    }); */
});