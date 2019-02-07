const _ = require("underscore");
module.exports = function (RED) {
    function Frame(config) {

        RED.nodes.createNode(this, config);
        let node = this;
        let context = this.context().flow;//建立並取得context物件
        node.name = config.name;//取得使用者為這節點取的名稱

        this.on("input", function (msg) {

            let frame = {};
            let name;//用來當frame物件的屬性
            if (node.name) {//如果開發者有填節點的名稱，就存到name裡
                name = node.name;
            }
            else {
                name = 1;
            }

            if (_.isUndefined(context.get("frame")) || _.isNull(context.get("frame"))) {
                frame[name] = {//將此name設成frame的屬性名稱
                    Query: {},
                    UserData: {},
                    Result: {}
                };
                context.set("frame", frame);
            }

            frame = context.get("frame");

            //如果前一個節點的msg物件的query、userData、result不是空，就個別把這幾個屬性的值取出來，放到frame物件的name屬性裡
            if (msg.query != null) {
                Object.keys(msg.query).map(function (objectKey, index) {
                    let value = msg.query[objectKey];
                    frame[name].Query[objectKey] = value;
                });
            }
            if (msg.userData != null) {
                console.log(msg.userData);
                Object.keys(msg.userData).map(function (objectKey, index) {
                    let value = msg.userData[objectKey];
                    frame[name].UserData[objectKey] = value;
                });
            }
            if (msg.result != null) {
                Object.keys(msg.result).map(function (objectKey, index) {
                    let value = msg.result[objectKey];
                    frame[name].Result[objectKey] = value;
                });
            }
            context.set("frame", frame);
            msg.frame = context.get("frame")[name];
            node.send(msg);
        });
    }
    RED.nodes.registerType("FCF-Frame", Frame);
};
