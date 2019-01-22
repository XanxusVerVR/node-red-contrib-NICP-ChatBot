module.exports = function (RED) {
    function Command(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.on("input", function (msg) {
            msg.payload = config.command.trim().toString();
            node.send(msg);
        });
    }
    RED.nodes.registerType("FCF-Command", Command);
};