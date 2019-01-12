/**
 * Dialogflow API的scope https://developers.google.com/identity/protocols/googlescopes#dialogflowv2
 * gtoken模組的Github https://github.com/google/node-gtoken
 * googleapis模組的npm https://www.npmjs.com/package/googleapis#service-to-service-authentication
 * 私鑰跳脫字元的問題 https://www.extreg.com/blog/2017/12/gcs-service-account-private-key-not-working-env/
 */
const request = require("request");
const crypto = require("crypto"); //引用可以產生亂數字串的模組
const { GoogleToken } = require("gtoken");

module.exports = function (RED) {
    function Dispatcher(config) {

        RED.nodes.createNode(this, config);
        let node = this;
        node.agentCredentials = RED.nodes.getNode(config.agentCredentials);
        node.rules = config.rules;
        let projectID = node.agentCredentials.credentials.projectID.trim();
        let email = node.agentCredentials.credentials.email.trim();
        let privateKey = node.agentCredentials.credentials.privateKey.replace(/\\n/g, "\n").trim();

        this.on("input", function (msg) {

            let rules = node.rules;
            let output = [];
            let buf = crypto.randomBytes(25); //產生一個25byte的亂數資料，來當作請求網址的session ID

            const gtoken = new GoogleToken({
                email: email,
                scope: ["https://www.googleapis.com/auth/cloud-platform"],
                key: privateKey
            });

            let sendRequest = function (token) {

                let headers = {
                    "Content-Type": "application/json;charset=utf-8",
                    "Authorization": "Bearer " + token,
                };

                let options = {
                    url: `https://dialogflow.googleapis.com/v2/projects/${projectID}/agent/sessions/${buf.toString("hex")}:detectIntent`,
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({
                        "queryInput": {
                            "text": {
                                "text": msg.payload.content,
                                "languageCode": "zh-TW"
                            }
                        }
                    })
                };

                request(options, function (error, response, body) {
                    body = JSON.parse(body);
                    let action = body.queryResult.action;
                    rules.forEach(function (rule) {
                        if (action == (rule.topic).toString()) {
                            if (action == "input.unknown") {
                                msg.payload = body.queryResult.queryText;
                            }
                            output.push(msg);
                        } else {
                            output.push(null);
                        }
                    });
                    node.send(output);
                });
            };

            let gt = function () {
                gtoken.getToken().then(function (token) {
                    return sendRequest(token);
                }).catch(function (error) {
                    console.log(error);
                });
            };
            gt();
        });
    }
    RED.nodes.registerType("FCF-Dispatcher", Dispatcher);
};
