const eddystoneBeacon = require("eddystone-beacon");
const _ = require("underscore");
module.exports = function (RED) {

    function Eddystone(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Eddystone Beacon Node";
        this.broadcastingMode = config.broadcastingMode;
        this.deviceName = config.deviceName;
        this.broadcastingUrl = config.broadcastingUrl;
        this.option = {
            name: this.deviceName
        };

        const node = this;

        if (!_.isEmpty(node.broadcastingUrl)) {
            console.log(`開始廣播`);
            eddystoneBeacon.advertiseUrl(`https://www.google.com.tw/`, { name: "Xanxus Beacon" });
        }
        node.on("input", function (msg) {
            if (msg.payload == "stop") {
                console.log(`停止廣播`);
                eddystoneBeacon.stop();
            }
            // if (node.broadcastingMode == "url") {

            // }
            // else if (node.broadcastingMode == "uid") {

            // }
            // else {
            //     console.log(`TLM模式`);
            // }
        });
    }
    RED.nodes.registerType("NICP-Eddystone", Eddystone);
};