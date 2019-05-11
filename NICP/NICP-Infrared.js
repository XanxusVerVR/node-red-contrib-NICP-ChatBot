/**
 * Created by aborovsky on 27.08.2015.
 */

const util = require('util');
const lircManager = require('./lib/lircmanager').LircManager;
const exec = require("child_process").exec;

module.exports = function (RED) {

    /**
     * ====== Lirc-controller ================
     * Holds configuration for lircjs,
     * initializes new lircjs connections
     * =======================================
     */
    function LIRCControllerNode(config) {
        const node = this;
        RED.nodes.createNode(this, config);
        node.name = config.name;
        node.devices = [];
        node.lirc = new lircManager();

        this._updateStatusDevices = function () {
            for (let key in node.devices) {
                let dev = node.devices[key];
                if (dev.output == node.lirc.activeOutput && node.lirc.isReady) {
                    dev.status({
                        fill: "green",
                        shape: "dot",
                        text: "active"
                    });
                } else if (node.lirc.isReady) {
                    dev.status({
                        fill: "yellow",
                        shape: "dot",
                        text: "inactive"
                    });
                } else {
                    dev.status({
                        fill: "red",
                        shape: "dot",
                        text: "not ready"
                    });
                }
            }
        };

        node.lirc.on('changeOutput', node._updateStatusDevices);
        node.lirc.on('ready', node._updateStatusDevices);
        node.lirc.on('notReady', node._updateStatusDevices);

        this.registerDevice = function (deviceNode) {
            node.devices.push(deviceNode);
        };

        this.send = function (device, cmd, output, cb) {
            RED.comms.publish("debug", { name: node.name, msg: 'sending to lirc: irsend SEND_ONCE ' + device + ' ' + cmd });
            //node.log('sending to lirc: ' + device + '/' + cmd);
            node.lirc.send(device, cmd, output, cb);
        };

        this.on("close", function () {
            node.log('disconnecting from lirc');
            node.lirc.end && node.lirc.end();
        });
    }

    RED.nodes.registerType("lirc-controller", LIRCControllerNode);

    // ======================= NICP-Infrared In Node by Xanxus =======================
    // ======================= NICP-Infrared In Node by Xanxus =======================
    // ======================= NICP-Infrared In Node by Xanxus =======================
    // ======================= NICP-Infrared In Node by Xanxus =======================
    function InfraredIn(config) {

        RED.nodes.createNode(this, config);

        const node = this;

        const inputCallback = function (msg) {
        };
        node.on("input", inputCallback);

    }
    RED.nodes.registerType("NICP-Infrared In", InfraredIn);

    /**
     * ====== NICP-Infrared Out(Lirc-out) =======================
     * Sends outgoing Global Cache device from
     * messages received via node-red flows
     * =======================================
     */
    function InfraredOut(config) {
        const node = this;
        RED.nodes.createNode(this, config);
        node.name = config.name;
        node.ctrl = RED.nodes.getNode(config.controller);
        node.device = config.device;
        node.output = config.output;

        node.ctrl && node.ctrl.registerDevice(node);



        this.on("input", function (msg) {
            RED.comms.publish("debug", { name: node.name, msg: 'lircout.onInput msg[' + util.inspect(msg) + ']' });
            //node.log('lircout.onInput msg[' + util.inspect(msg) + ']');
            if (!(msg && msg.hasOwnProperty('payload'))) return;
            let payload = msg.payload;
            if (typeof (msg.payload) === "object") {
                payload = msg.payload;
            } else if (typeof (msg.payload) === "string") {
                try {
                    payload = JSON.parse(msg.payload);
                } catch (e) {
                    payload = msg.payload.toString();
                }
            }
            if (payload == null || payload.trim().length == 0) {
                node.warn(node.name + ': lircout.onInput: illegal msg.payload!');
                return;
            }

            node.ctrl.send(node.device, payload, node.output, function (err) {
                if (err) {
                    node.error(node.name + ': send error: ' + err);
                }
                if (typeof (msg.cb) === 'function')
                    msg.cb(err);
            });

        });
        this.on("close", function () {
            node.log('lircOut [' + node.name + '] close');
        });

        node.status({
            fill: "red",
            shape: "dot",
            text: "not ready"
        });
    }

    RED.nodes.registerType("NICP-Infrared Out", InfraredOut);

    //  提供目前有哪些裝置的訊號檔
    RED.httpAdmin.get("/available-device-list", RED.auth.needsPermission("NICP-Infrared Out.read"), function (req, res) {
        const child = exec("irsend list \"\" \"\"", function (error, stdout, stderr) {
            res.json(stdout);
        });
    });

    // 提供此裝置的訊號檔有哪些訊號
    RED.httpAdmin.get("/device/command/:name", RED.auth.needsPermission("NICP-Infrared Out.read"), function (req, res) {
        const child = exec(`irsend list ${req.params.name} \"\"`, function (error, stdout, stderr) {
            res.json(stdout);
        });
    });
};
