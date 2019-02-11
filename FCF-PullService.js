const request = require("request");

module.exports = function (RED) {
    function PullService(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Pull Service Node";
        this.URL = config.URL;

        let node = this;

        this.on("input", function (msg) {

            let headers = {
                "Content-Type": "application/json;charset=utf-8"
            };

            let options = {
                url: node.URL,
                method: "POST",
                headers: headers,
                followAllRedirects: true,
                body: JSON.stringify(msg.frame)
            };

            request(options, function (error, response, body) {
                body = JSON.parse(body);
                msg.result = body.Result;
                msg.payload = body.Message;
                node.send(msg);
            });

        });

    }
    RED.nodes.registerType("FCF-PullService", PullService);
};