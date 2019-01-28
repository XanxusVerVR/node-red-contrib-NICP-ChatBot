module.exports = function (RED) {
    function Command(config) {
        RED.nodes.createNode(this, config);

        // 將config的屬性設給這的this做參考，這樣測試才看得到自定義的屬性
        this.name = config.name;
        this.command = config.command;

        let node = this;

        node.on("input", function (msg) {
            msg.payload = config.command.trim().toString();
            node.send(msg);
        });
    }
    RED.nodes.registerType("FCF-Command", Command);
};