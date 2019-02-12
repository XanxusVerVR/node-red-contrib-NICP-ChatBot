module.exports = function (RED) {
    function RemoteServerNode(config) {
        RED.nodes.createNode(this, config);
        this.host = config.host;
        this.port = config.port;
    }
    RED.nodes.registerType("remote-server", RemoteServerNode);
};