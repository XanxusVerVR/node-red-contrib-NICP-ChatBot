const should = require("should");
const chai = require("chai");
const helper = require("node-red-node-test-helper");
const fcfCommandNode = require("../FCF-Command.js");
const Context = require("../red/runtime/nodes/context");

describe("Message節點測試", function () {

    this.timeout(1 * 1000);

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

    it("測試format屬性是否有預設值", function (done) {
        let messageNode = JSON.parse(`[
            {
                "id": "4ba52d54.d48be4",
                "type": "FCF-Command",
                "z": "e064253c.b676f8",
                "name": "",
                "answer": false,
                "track": false,
                "parse_mode": "",
                "message": [
                    {
                        "format": "handlebars",
                        "template": "This is the payload: {{payload}} !"
                    }
                ],
                "x": 500,
                "y": 580,
                "wires": [
                    [
                        "a22cd9b8.fd1f18"
                    ]
                ]
            }
        ]`);
        helper.load(fcfCommandNode, messageNode, function () {
            let n1 = helper.getNode(messageNode[0].id);
            try {
                n1.message[0].should.have.property("format", "handlebars");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    it("測試template屬性是否有預設值", function (done) {
        let messageNode = JSON.parse(`[
            {
                "id": "4ba52d54.d48be4",
                "type": "FCF-Command",
                "z": "e064253c.b676f8",
                "name": "",
                "answer": false,
                "track": false,
                "parse_mode": "",
                "message": [
                    {
                        "format": "handlebars",
                        "template": "This is the payload: {{payload}} !"
                    }
                ],
                "x": 500,
                "y": 580,
                "wires": [
                    [
                        "a22cd9b8.fd1f18"
                    ]
                ]
            }
        ]`);
        helper.load(fcfCommandNode, messageNode, function () {
            let n1 = helper.getNode(messageNode[0].id);
            try {
                n1.message[0].should.have.property("template", "This is the payload: {{payload}} !");
                done();
            } catch (err) {
                done(err);
            }
        });
    });
    //這裡的messageNode的原始資料有換行符號，但因為JSON.parse轉換時會錯誤，和message[1].template的值有雙引號，會導致轉換錯誤，所以改成單引號
    it("測試message陣列的長度是否為2", function (done) {
        let messageNode = JSON.parse(`[
            {
                "id": "4ba52d54.d48be4",
                "type": "FCF-Command",
                "z": "e064253c.b676f8",
                "name": "用來寫測試案例的",
                "answer": false,
                "track": false,
                "parse_mode": "",
                "message": [
                    {
                        "format": "html",
                        "template": "<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>"
                    },
                    {
                        "format": "json",
                        "template": "{'name':'Xanxus'}"
                    }
                ],
                "x": 560,
                "y": 580,
                "wires": [
                    [
                        "a22cd9b8.fd1f18"
                    ]
                ]
            }
        ]`);

        helper.load(fcfCommandNode, messageNode, function () {
            let n1 = helper.getNode(messageNode[0].id);
            try {
                n1.message.should.have.length(2);
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it("input Data Collection的資料，output Facebook Out，且Message節點本身沒設置模板訊息(手機選購案例的flow是這樣接的)", function (done) {
        let messageNode = JSON.parse(`[
            {
                "id": "ccd08f56.81777",
                "type": "FCF-Command",
                "z": "9fdb8a20.7c04d8",
                "name": "",
                "answer": false,
                "track": false,
                "parse_mode": "",
                "message": [],
                "x": 440,
                "y": 120,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]
        `);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        messageNode.push(helperNode);

        helper.load(fcfCommandNode, messageNode, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(messageNode[0].id);
            helperNode.on("input", function (msg) {
                msg.payload.should.have.property("content", "請問你要什麼品牌");//send出去的msg是否有個屬性a，並且值為轉成小寫的uppercase
                done();
            });
            n1.receive({
                "payload": "請問你要什麼品牌",
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "29ee9891.3bd2d8",
                "whetherToSendLocation": false
            });//接收前面的節點傳過來的msg物件
        });
    });

    it("input Frame的資料，output資料給Facebook Out，且Message節點本身沒設置模板訊息(手機選購案例的flow是這樣接的)", function (done) {
        let messageNode = JSON.parse(`[
            {
                "id": "ccd08f56.81777",
                "type": "FCF-Command",
                "z": "9fdb8a20.7c04d8",
                "name": "",
                "answer": false,
                "track": false,
                "parse_mode": "",
                "message": [],
                "x": 440,
                "y": 120,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]
        `);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        messageNode.push(helperNode);

        helper.load(fcfCommandNode, messageNode, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(messageNode[0].id);
            helperNode.on("input", function (msg) {
                msg.payload.should.have.property("content", "我幫您找到了這台手機：HTC的HTC U11。售價為18523元，相機有1200萬畫素，螢幕有5.5吋，容量有64G。請問還可以嗎？");//send出去的msg是否有個屬性a，並且值為轉成小寫的uppercase
                done();
            });
            n1.receive({
                "payload": "我幫您找到了這台手機：HTC的HTC U11。售價為18523元，相機有1200萬畫素，螢幕有5.5吋，容量有64G。請問還可以嗎？",
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "d271022d.f7293",
                "_event": "node:5307cb55.73b9d4",
                "whetherToSendLocation": false,
                "query": {
                    "brand": "HTC",
                    "price": "88888"
                },
                "frame": {
                    "Query": {
                        "brand": "HTC",
                        "price": "88888"
                    },
                    "UserData": {},
                    "Result": {
                        "mobile": "HTC U11",
                        "id": "H001"
                    }
                },
                "result": {
                    "mobile": "HTC U11",
                    "id": "H001"
                }
            });//接收前面的節點傳過來的msg物件
        });
    });

    it("input PullService的資料，且Message節點本身沒設置模板訊息(手機選購案例的flow是這樣接的)", function (done) {
        let messageNode = JSON.parse(`[
            {
                "id": "ccd08f56.81777",
                "type": "FCF-Command",
                "z": "9fdb8a20.7c04d8",
                "name": "",
                "answer": false,
                "track": false,
                "parse_mode": "",
                "message": [],
                "x": 440,
                "y": 120,
                "wires": [
                    [
                        "n2"
                    ]
                ]
            }
        ]
        `);

        let helperNode = {
            id: "n2",
            type: "helper"
        };

        messageNode.push(helperNode);

        helper.load(fcfCommandNode, messageNode, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(messageNode[0].id);
            helperNode.on("input", function (msg) {
                msg.payload.should.have.property("content", "已經完成訂單囉，感謝您的訂購^^");//send出去的msg是否有個屬性a，並且值為轉成小寫的uppercase
                done();
            });
            n1.receive({
                "payload": "已經完成訂單囉，感謝您的訂購^^",
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "2cb33937.086a56",
                "_event": "node:698d1187.bd9b3",
                "whetherToSendLocation": false,
                "userData": {
                    "UserID": "1001653183292396",
                    "phone": "0999999",
                    "name": "iii"
                },
                "frame": {
                    "Query": {},
                    "UserData": {
                        "UserID": "1001653183292396",
                        "phone": "0999999",
                        "name": "iii"
                    },
                    "Result": {}
                },
                "result": {}
            });//接收前面的節點傳過來的msg物件
        });
    });

    it("input Facebook In節點的資料，測試Message節點是某會輸出使用者設置的模板訊息(沒有插入變數)", function (done) {
        let messageNode = JSON.parse(`[
            {
                "id": "b2918cce.263e9",
                "type": "FCF-Command",
                "z": "9fdb8a20.7c04d8",
                "name": "",
                "answer": false,
                "track": false,
                "parse_mode": "",
                "message": [
                    {
                        "format": "text",
                        "template": "我是使用者設的模板字串"
                    }
                ],
                "x": 420,
                "y": 900,
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

        messageNode.push(helperNode);

        helper.load(fcfCommandNode, messageNode, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(messageNode[0].id);
            helperNode.on("input", function (msg) {
                msg.payload.should.have.property("content", "我是使用者設的模板字串");//send出去的msg是否有個屬性a，並且值為轉成小寫的uppercase
                done();
            });
            n1.receive({
                "payload": {
                    "chatId": "1001653183292396",
                    "messageId": "fa30799i_xjcp3co67P5PL4yXfIfO-uH986X9qnG8wTMTTcWYy_povGOq5FcfeO62PcAmgXMgnt6tBpfIx6jcQ",
                    "type": "message",
                    "content": "Hi",
                    "date": "2019-02-16T05:10:39.433Z",
                    "inbound": true
                },
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "d7472870.3531e8"
            });//接收前面的節點傳過來的msg物件
        });
    });

    it("input Facebook In節點的資料，測試Message節點是某會輸出使用者設置的模板訊息(有插入變數)", function (done) {
        let messageNode = JSON.parse(`[
            {
                "id": "6d416c2c.c9c744",
                "type": "FCF-Command",
                "z": "9fdb8a20.7c04d8",
                "name": "",
                "answer": false,
                "track": false,
                "parse_mode": "",
                "message": [
                    {
                        "format": "handlebars",
                        "template": "Hello: {{payload.content}} !"
                    }
                ],
                "x": 360,
                "y": 1100,
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

        messageNode.push(helperNode);

        helper.load(fcfCommandNode, messageNode, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(messageNode[0].id);
            helperNode.on("input", function (msg) {
                msg.payload.should.have.property("content", "Hello: Hi !");//send出去的msg是否有個屬性a，並且值為轉成小寫的uppercase
                done();
            });
            n1.receive({
                "payload": {
                    "chatId": "1001653183292396",
                    "messageId": "fa30799i_xjcp3co67P5PL4yXfIfO-uH986X9qnG8wTMTTcWYy_povGOq5FcfeO62PcAmgXMgnt6tBpfIx6jcQ",
                    "type": "message",
                    "content": "Hi",
                    "date": "2019-02-16T05:10:39.433Z",
                    "inbound": true
                },
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "d7472870.3531e8"
            });//接收前面的節點傳過來的msg物件
        });
    });

    it("input Facebook In節點的資料，測試Message節點當沒有設置模板訊息時，是否可以直接拿接收到的msg.payload當要輸出的訊息", function (done) {
        let messageNode = JSON.parse(`[
            {
                "id": "4ba52d54.d48be4",
                "type": "FCF-Command",
                "z": "e064253c.b676f8",
                "name": "用來寫測試案例的",
                "answer": false,
                "track": false,
                "parse_mode": "",
                "message": [],
                "x": 560,
                "y": 580,
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

        messageNode.push(helperNode);

        helper.load(fcfCommandNode, messageNode, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(messageNode[0].id);
            helperNode.on("input", function (msg) {
                msg.payload.should.have.property("content", "abc");//send出去的msg是否有個屬性a，並且值為轉成小寫的uppercase
                done();
            });
            n1.receive({//模擬Facebook In的輸出
                "payload": "abc",
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1763667070393238"
                    }
                },
                "_msgid": "e6f192e0.98774"
            });//接收前面的節點傳過來的msg物件
        });
    });

    it("input Facebook Out的資料(Tracking Answer測試)", function (done) {
        let messageNode = JSON.parse(`[
            {
                "id": "12997229.75adbe",
                "type": "FCF-Command",
                "z": "9fdb8a20.7c04d8",
                "name": "和使用者確認E-mail",
                "answer": false,
                "track": false,
                "parse_mode": "",
                "message": [
                    {
                        "format": "handlebars",
                        "template": "和您確認一下，您的E-mail是{{payload.content}}嗎?"
                    }
                ],
                "x": 750,
                "y": 620,
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

        messageNode.push(helperNode);

        helper.load(fcfCommandNode, messageNode, function () {
            let helperNode = helper.getNode("n2");
            let n1 = helper.getNode(messageNode[0].id);
            helperNode.on("input", function (msg) {
                msg.payload.should.have.property("content", "和您確認一下，您的E-mail是123@gmail.com嗎?");//send出去的msg是否有個屬性a，並且值為轉成小寫的uppercase
                done();
            });
            n1.receive({
                "payload": {
                    "chatId": "1001653183292396",
                    "messageId": "1GoCQUqSgSHc5yBYsc-Bgb4yXfIfO-uH986X9qnG8wSleQzXMAzY51DM3xg4oWF6sm26oYbosKRdcilXDVy_6w",
                    "type": "message",
                    "content": "123@gmail.com",
                    "date": "2019-02-16T05:47:50.338Z",
                    "inbound": true
                },
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "ba56f0fc.9bffd"
            });//接收前面的節點傳過來的msg物件
        });
    });

    it("測試Context flow，在Message節點的模板訊息有穿插flow的屬性，看是否可以成功轉換成實際的值", function (done) {
        let messageNode = JSON.parse(`[
            {
                "id": "51b6a1f0.2809f",
                "type": "FCF-Command",
                "z": "9fdb8a20.7c04d8",
                "name": "",
                "answer": false,
                "track": false,
                "parse_mode": "",
                "message": [
                    {
                        "format": "handlebars",
                        "template": "This is the payload: {{flow.aaa}} !"
                    }
                ],
                "x": 600,
                "y": 1020,
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

        messageNode.push(helperNode);

        helper.load(fcfCommandNode, messageNode, function () {
            let n1 = helper.getNode(messageNode[0].id);
            let helperNode = helper.getNode("n2");
            n1.context().flow.set("aaa", "123123");//設置一個context flow的物件屬性，所以是設置了flow.aaa=123123
            helperNode.on("input", function (msg) {
                msg.payload.should.have.property("content", "This is the payload: 123123 !");
                done();
            });
            n1.receive({
                "payload": {
                    "chatId": "1001653183292396",
                    "messageId": "PQMQ2y7ATsA_vBt4xC_rkL4yXfIfO-uH986X9qnG8wRAScFkL-VPk931KQD0Zhe65Q1M4nfayXOlcqVqvbIsWw",
                    "type": "message",
                    "content": "哈囉",
                    "date": "2019-02-15T23:13:43.632Z",
                    "inbound": true
                },
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "20eff319.b80abc"
            });
        });
    });

    it("測試Context global，在Message節點的模板訊息有穿插global的屬性，看是否可以成功轉換成實際的值", function (done) {
        let messageNode = JSON.parse(`[
            {
                "id": "51b6a1f0.2809f",
                "type": "FCF-Command",
                "z": "9fdb8a20.7c04d8",
                "name": "",
                "answer": false,
                "track": false,
                "parse_mode": "",
                "message": [
                    {
                        "format": "handlebars",
                        "template": "This is the payload: {{global.aaa}} !"
                    }
                ],
                "x": 600,
                "y": 1020,
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

        messageNode.push(helperNode);

        helper.load(fcfCommandNode, messageNode, function () {
            let n1 = helper.getNode(messageNode[0].id);
            let helperNode = helper.getNode("n2");
            n1.context().global.set("aaa", "123123");
            helperNode.on("input", function (msg) {
                msg.payload.should.have.property("content", "This is the payload: 123123 !");
                done();
            });
            n1.receive({
                "payload": {
                    "chatId": "1001653183292396",
                    "messageId": "PQMQ2y7ATsA_vBt4xC_rkL4yXfIfO-uH986X9qnG8wRAScFkL-VPk931KQD0Zhe65Q1M4nfayXOlcqVqvbIsWw",
                    "type": "message",
                    "content": "哈囉",
                    "date": "2019-02-15T23:13:43.632Z",
                    "inbound": true
                },
                "originalMessage": {
                    "transport": "facebook",
                    "chat": {
                        "id": "1001653183292396"
                    }
                },
                "_msgid": "20eff319.b80abc"
            });
        });
    });

});