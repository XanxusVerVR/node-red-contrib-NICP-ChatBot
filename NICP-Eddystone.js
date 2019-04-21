const eddystoneBeacon = require("eddystone-beacon");
const _ = require("underscore");
module.exports = function (RED) {

    function Eddystone(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Eddystone Beacon Node";
        this.broadcastingMode = config.broadcastingMode;
        this.deviceName = config.deviceName;
        this.broadcastingUrl = config.broadcastingUrl;
        this.txPowerLevel = config.txPowerLevel;
        this.namespaceId = config.namespaceId;
        this.instanceId = config.instanceId;
        this.option = {
            name: this.deviceName,
            txPowerLevel: -this.txPowerLevel
        };

        const node = this;

        if (node.broadcastingMode == "url") { //如廣播模式是要廣播URL
            if (!_.isEmpty(node.broadcastingUrl)) {//如果URL不是空
                console.log(`廣播URL`);
                eddystoneBeacon.advertiseUrl(node.broadcastingUrl, node.option);
            }
            else {
                eddystoneBeacon.stop();
            }
        }
        else {//如廣播模式是要廣播UID
            if (!_.isEmpty(node.namespaceId) && !_.isEmpty(node.instanceId)) {
                console.log(`廣播UID`);
                eddystoneBeacon.advertiseUid(node.namespaceId, node.instanceId, node.option);
            }
            else {
                eddystoneBeacon.stop();
            }
        }
        node.on("input", function (msg) {
            if (msg.payload === "stop") {
                console.log(`停止廣播`);
                eddystoneBeacon.stop();
            }
        });
        node.on("close", function (removed, done) {
            if (removed) {
                eddystoneBeacon.stop();
                console.log(`This node has been deleted`);
                // This node has been deleted
            } else {
                console.log(`This node is being restarted`);
                // This node is being restarted
            }
            done();
        });
    }
    RED.nodes.registerType("NICP-Eddystone", Eddystone);
};