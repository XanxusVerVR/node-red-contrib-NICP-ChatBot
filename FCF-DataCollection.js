
module.exports = function (RED) {
    function DataCollection(config) {

        RED.nodes.createNode(this, config);

        let context = this.context();
        this.name = config.name || "My Data Collection Node";
        this.rules = config.rules;
        this.collect = config.collect;
        this.whetherToSendLocation = config.whetherToSendLocation;

        let node = this;

        if (node.whetherToSendLocation) {
            node.rules.push({
                messageContent: "請點擊以下按鈕來提供您的位置喔!",
                variableName: "coordinate"
            });
        }

        this.on("input", function (msg) {

            msg.whetherToSendLocation = node.whetherToSendLocation;
            let rules = node.rules;
            let collect = node.collect;
            let output = [];

            if (collect == "query") {
                if (context.get("dataCount") == null) {

                    rules.reverse();
                    context.set("dataCount", rules.length - 1);

                    output[0] = msg;
                    output[1] = null;

                    let query = {};
                    context.set("query", query);

                    msg.payload = rules[context.get("dataCount")].messageContent;
                    context.set("dataCount", context.get("dataCount") - 1);
                    node.send(output);
                }
                else if (context.get("dataCount") > -1) {
                    output[0] = msg;
                    output[1] = null;
                    let query = context.get("query");
                    query[rules[context.get("dataCount") + 1].variableName] = msg.payload.content;
                    context.set("query", query);

                    msg.payload = rules[context.get("dataCount")].messageContent;
                    context.set("dataCount", context.get("dataCount") - 1);
                    node.send(output);
                }
                else {
                    output[0] = null;
                    output[1] = msg;
                    let query = context.get("query");
                    query[rules[context.get("dataCount") + 1].variableName] = msg.payload.content;
                    context.set("query", query);
                    msg.query = context.get("query");
                    context.set("dataCount", null);
                    if (msg.query.coordinate) {
                        msg.whetherToSendLocation = false;
                    }
                    node.send(output);
                }
            }
            if (collect == "userData") {
                if (context.get("dataCount") == null) {

                    rules.reverse();
                    context.set("dataCount", rules.length - 1);

                    output[0] = msg;
                    output[1] = null;

                    let userData = {};
                    userData.UserID = msg.payload.chatId;
                    context.set("userData", userData);

                    msg.payload = rules[context.get("dataCount")].messageContent;
                    context.set("dataCount", context.get("dataCount") - 1);
                    node.send(output);
                }
                else if (context.get("dataCount") > -1) {
                    output[0] = msg;
                    output[1] = null;
                    let userData = context.get("userData");
                    userData[rules[context.get("dataCount") + 1].variableName] = msg.payload.content;
                    context.set("userData", userData);

                    msg.payload = rules[context.get("dataCount")].messageContent;
                    context.set("dataCount", context.get("dataCount") - 1);

                    node.send(output);
                }
                else {
                    output[0] = null;
                    output[1] = msg;
                    let userData = context.get("userData");
                    userData[rules[context.get("dataCount") + 1].variableName] = msg.payload.content;
                    context.set("userData", userData);
                    msg.userData = context.get("userData");
                    context.set("dataCount", null);
                    node.send(output);
                }
            }
        });
    }
    RED.nodes.registerType("NICP-DataCollection", DataCollection);
};