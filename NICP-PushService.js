const _ = require("underscore");
const prettyjson = require('prettyjson');
const clc = require("cli-color");
const green = clc.greenBright;
const white = clc.white;
const cors = require("cors");
const moment = require("moment");
module.exports = function (RED) {
    function PushService(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Push Service Node";
        this.url = config.url;

        let node = this;

        let corsHandler = function (req, res, next) {
            next();
        };

        if (RED.settings.httpNodeCors) {
            corsHandler = cors(RED.settings.httpNodeCors);
            RED.httpNode.options("*", corsHandler);
        }

        const flowContext = this.context().flow;//建立並取得context物件

        let postCallback = function _postCallback(req, res) {
            console.log(`req.body:`);
            console.log(prettyjson.render(req.body, {
                noColor: false
            }));
            // console.log(JSON.stringify(req.body));
            //當config屬性存在，表示有資料需要設定並儲存
            if (!_.isEmpty(req.body.config)) {// 當_.isEmpty()參數中的物件是  未定義 null "" {}  等等這四個情況時，就會是true
                let contextFileSystemNodeTypeKey = flowContext.get(req.body.config.type, "xanxusContext");
                //如果這個類型的節點存在，那就拿出來，放新的進去
                if (contextFileSystemNodeTypeKey) {
                    let isExist = false;
                    // 做更新設定腳本的動作
                    for (let i = 0; i < contextFileSystemNodeTypeKey.length; i++) {
                        if (contextFileSystemNodeTypeKey[i].name == req.body.config.name) {// 從檔案系統開始找，如果找到和剛剛傳進來的名稱一樣，表示要更新
                            contextFileSystemNodeTypeKey[i] = req.body.config;// 更新
                            isExist = true;
                        }
                    }
                    if (isExist) {
                        flowContext.set(req.body.config.type, contextFileSystemNodeTypeKey, "xanxusContext");
                    }
                    else {
                        contextFileSystemNodeTypeKey.push(req.body.config);
                        flowContext.set(req.body.config.type, contextFileSystemNodeTypeKey, "xanxusContext");
                    }
                }
                //如果不存在，就創造新的，並放進去
                else {
                    let _contextFileSystemNodeTypeKey = [];
                    _contextFileSystemNodeTypeKey.push(req.body.config);
                    flowContext.set(req.body.config.type, _contextFileSystemNodeTypeKey, "xanxusContext");
                }
            }
            let msg = {
                payload: {
                    userID: req.body.userID || "",
                    content: req.body.message || "",
                    result: req.body.result || "",
                    config: req.body.config || ""
                }
            };
            node.send(msg);
            res.status(200).send({
                statusCode: 200,
                date: moment().format("YYYY-MM-DD HH:mm:ss")
            });
        };

        RED.httpNode.post(config.url, corsHandler, postCallback);

        if (!config.url) {
            config.url = "/您設置的URL樣式";
            node.status({
                fill: "blue",
                shape: "ring",
                text: "URL Path Undefined"
            });
        }
        else {
            node.status({
                fill: "blue",
                shape: "dot",
                text: config.url
            });
        }

        console.log(green(`Push Service節點的ID: `) + white(node.id) + green(` 提供的URL樣式為 `) + white(`https://your_domain${config.url}`));

        node.on("close", function () {
            let node = this;
            RED.httpNode._router.stack.forEach(function (route, i, routes) {
                if (route.route && route.route.path === node.url) {
                    routes.splice(i, 1);
                }
            });
        });
    }
    RED.nodes.registerType("NICP-PushService", PushService);
};