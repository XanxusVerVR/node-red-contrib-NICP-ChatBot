module.exports = function (RED) {
    function ConfigCredentialNode(config) {
        RED.nodes.createNode(this, config);
    }
    RED.nodes.registerType("config-credential-node", ConfigCredentialNode, {
        credentials: {
            username: {
                type: "text"
            },
            password: {
                type: "password"
            }
        }
    });
};
