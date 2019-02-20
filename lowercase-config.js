module.exports = function (RED) {
    function lowerCaseConfig(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name || "Xanxus Lower Case Config Name";
        this.userID = config.userID;
    }
    RED.nodes.registerType("lowercase-config", lowerCaseConfig, {
        credentials: {
            userID: {
                type: "text"
            }
        }
    });
};
