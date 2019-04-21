const eddystoneBeacon = require("eddystone-beacon");
const bleno = require("bleno");
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
        const uuid = "e2c56db5dffb48d2b060d0f5a71096e0";
        const major = 444; // 0x0000 - 0xffff
        const minor = 555; // 0x0000 - 0xffff
        const measuredPower = -59; // -128 - 127
        bleno.on("stateChange", function (state) {
            console.log("on -> stateChange: " + state);
            if (state === "poweredOn") {
                console.log("開始廣播iBeacon");
                bleno.startAdvertisingIBeacon(uuid, major, minor, measuredPower);
            } else {
                console.log("停止廣播iBeacon");
                bleno.stopAdvertising();
            }
        });
        node.on("input", function (msg) {
            if (msg.payload === "stop") {
                console.log(`停止廣播`);
                eddystoneBeacon.stop();
            }



        });
        node.on("close", function (removed, done) {
            if (removed) {//當節點從面板上移除會做的事
                eddystoneBeacon.stop();
                console.log(`停止廣播`);
                bleno.stopAdvertising();
            } else {//當重新部署時，要做的事
            }
            done();
        });
    }
    RED.nodes.registerType("NICP-Eddystone", Eddystone);
};