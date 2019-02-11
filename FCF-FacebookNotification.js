const request = require("request");

module.exports = function (RED) {

    function FacebookNotification(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Facebook Notification Node";

        let node = this;

        this.on("input", function (msg) {
            let headers = {
                "Content-Type": "application/json;charset=utf-8"
            };
            let options = {
                url: `https://graph.facebook.com/v2.6/me/messages?access_token=${node.credentials.pageAccessToken}`,
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    "recipient": {
                        "id": msg.payload.userID
                    },
                    "message": {
                        "text": msg.payload.content
                    }
                })
            };
            request(options, function (error, response, body) {
                if (error) {
                    console.log(error);
                }
            });
        });
    }
    RED.nodes.registerType("FCF-FacebookNotification", FacebookNotification, {
        credentials: {
            pageAccessToken: {
                type: "text"
            }
        }
    });
};