const request = require("request");

module.exports = function (RED) {
    function PullService(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Pull Service Node";

        this.URL = config.URL;
        this.method = config.method;

        const node = this;

        this.on("input", function (msg) {
            const headers = {
                "Content-Type": "application/json;charset=utf-8"
            };

            const options = {
                url: node.URL,
                method: node.method,
                headers: headers,
                followAllRedirects: true,
                body: JSON.stringify(msg.frame)
            };

            if (node.method === "get") {
                delete options.body;
            }

            request(options, function (error, response, body) {
                try {
                    body = JSON.parse(body);
                } catch (error) {
                    console.log("可能出現格式錯誤!");
                    console.log(error);
                }
                // 如果是get，那就直接把整個回應body給payload
                if (node.method === "get") {
                    msg.payload = body;
                }
                // 如果是post，就用原本的設法
                else {
                    msg.result = body.result;
                    msg.payload = body.message;
                }
                node.send(msg);
            });

        });

    }
    RED.nodes.registerType("NICP-PullService", PullService);
};