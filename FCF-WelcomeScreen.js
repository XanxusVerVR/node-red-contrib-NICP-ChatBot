const request = require("request");
const clc = require("cli-color");
const green = clc.greenBright;
const white = clc.white;
const redBright = clc.redBright;
module.exports = function (RED) {
    function WelcomeScreen(config) {

        RED.nodes.createNode(this, config);

        this.bot = RED.nodes.getNode(config.bot);
        this.startedButtonPostbackPayload = config.startedButtonPostbackPayload;
        this.greetings = config.greetings;

        let node = this;

        let headers = {
            "Content-Type": "application/json;charset=utf-8",
        };

        let messengerProfileAPIUrl = `https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${node.bot.credentials.token}`;

        let optionsGetStarted = {
            url: messengerProfileAPIUrl,
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                get_started: {
                    payload: node.startedButtonPostbackPayload
                }
            })
        };

        let optionsGreeting = {
            url: messengerProfileAPIUrl,
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                greeting: node.greetings
            })
        };

        let inputCallback = function (msg) {
            if (node.startedButtonPostbackPayload) {
                request(optionsGetStarted, function (error, response, body) {
                    if (error) {
                        console.log(white("發生error!!!，訊息如下："));
                        console.log(redBright(error));
                    }
                    else {
                        console.log("設置成功!");
                    }
                    console.log(white("回應狀態碼為: ") + green(response.statusCode));
                    console.log(white("回應的Body: ") + green(body));
                });
            }
            let isEveryExist = false;
            for (let i = 0; i < node.greetings.length; i++) {
                if (node.greetings[i].locale && node.greetings[i].text) {
                    isEveryExist = true;
                }
            }
            if (isEveryExist) {
                request(optionsGreeting, function (error, response, body) {
                    if (error) {
                        console.log(white("發生error!!!，訊息如下："));
                        console.log(redBright(error));
                    }
                    else {
                        console.log("設置成功!");
                    }
                    console.log(white("回應狀態碼為: ") + green(response.statusCode));
                    console.log(white("回應的Body: ") + green(body));
                });
            }

        };
        node.on("input", inputCallback);

    }
    RED.nodes.registerType("FCF-WelcomeScreen", WelcomeScreen);
};