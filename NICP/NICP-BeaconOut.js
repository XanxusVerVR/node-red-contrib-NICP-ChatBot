const eddystoneBeacon = require("eddystone-beacon");
const bleno = require("bleno");
const _ = require("underscore");
module.exports = function (RED) {

    function BeaconOut(config) {

        const setStatus = function _setStatus(fill, shape, text) {
            node.status({
                fill: fill,
                shape: shape,
                text: text
            });
        };

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Beacon Out Node";
        this.broadcastingMode = config.broadcastingMode;
        this.deviceName = config.deviceName;
        this.broadcastingUrl = config.broadcastingUrl;//Google URL
        this.txPowerLevel = config.txPowerLevel;
        this.namespaceId = config.namespaceId;//Google UID
        this.instanceId = config.instanceId;
        this.uuid = config.uuid;//Apple iBeacon
        this.major = config.major;
        this.minor = config.minor;
        this.measuredPower = -config.measuredPower;
        this.option = {
            name: this.deviceName,
            txPowerLevel: -this.txPowerLevel
        };

        const node = this;

        if (node.broadcastingMode == "url") { //如廣播模式是要廣播URL
            if (!_.isEmpty(node.broadcastingUrl)) {//如果URL不是空
                console.log(`廣播URL`);
                eddystoneBeacon.advertiseUrl(node.broadcastingUrl, node.option);
                setStatus("blue", "dot", "broadcasting");
            }
            else {
                eddystoneBeacon.stop();
                setStatus("red", "dot", "not broadcasting");
            }
        }
        else if (node.broadcastingMode == "uid") {//如廣播模式是要廣播UID
            if (!_.isEmpty(node.namespaceId) && !_.isEmpty(node.instanceId)) {
                console.log(`廣播UID`);
                eddystoneBeacon.advertiseUid(node.namespaceId, node.instanceId, node.option);
                setStatus("blue", "dot", "broadcasting");
            }
            else {
                eddystoneBeacon.stop();
                setStatus("red", "dot", "not broadcasting");
            }
        }
        else {
            if (!_.isEmpty(node.uuid) && !_.isEmpty(node.major) && !_.isEmpty(node.minor) && !_.isNull(node.measuredPower)) {
                console.log(`廣播iBeacon`);
                bleno.startAdvertisingIBeacon(node.uuid, node.major, node.minor, node.measuredPower);
                setStatus("blue", "dot", "broadcasting");
            }
            else {
                console.log("停止廣播iBeacon else");
                bleno.stopAdvertising();
                setStatus("red", "dot", "not broadcasting");
            }
        }

        node.on("input", function (msg) {
            if (msg.payload === "stop") {
                if (node.broadcastingMode == "url" || node.broadcastingMode == "uid") {
                    console.log(`停止廣播Google Eddystone`);
                    eddystoneBeacon.stop();
                    setStatus("red", "dot", "not broadcasting");
                }
                else {
                    console.log("停止廣播iBeacon");
                    bleno.stopAdvertising();
                    setStatus("red", "dot", "not broadcasting");
                }
            }
        });

        node.on("close", function (removed, done) {
            if (removed) {//當節點從面板上移除會做的事
                if (node.broadcastingMode == "url" || node.broadcastingMode == "uid") {
                    console.log(`停止廣播Google Eddystone`);
                    eddystoneBeacon.stop();
                }
                else {
                    console.log("停止廣播iBeacon close");
                    bleno.stopAdvertising();
                }
            } else {//當重新部署時，要做的事
            }
            done();
        });
    }
    RED.nodes.registerType("NICP-Beacon Out", BeaconOut);
};