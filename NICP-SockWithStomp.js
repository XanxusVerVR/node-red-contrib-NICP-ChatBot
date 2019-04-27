// 程式碼參考這篇  https://bit.ly/2ZuQtou
const _ = require("underscore");
const Stomp = require("stompjs");
const SockJS = require("sockjs-client");
let sock;
let stompClient;
module.exports = function (RED) {
    function SockWithStomp(config) {

        const setStatus = function _setStatus(fill, shape, text) {
            node.status({
                fill: fill,
                shape: shape,
                text: text
            });
        };

        RED.nodes.createNode(this, config);

        this.name = config.name || "My SockWithStomp Node";
        this.sockjsUrl = config.sockjsUrl;
        this.destination = config.destination;

        const node = this;

        if (!_.isEmpty(node.sockjsUrl) && !_.isEmpty(node.destination)) {

            sock = new SockJS(node.sockjsUrl);
            stompClient = Stomp.over(sock);

            sock.onopen = function () {
                console.log("open");
            };

            sock.onmessage = function (e) {
                console.log("message", e.data);
                sock.close();
            };

            sock.onclose = function () {
                console.log("close");
            };
            const subscribeCallback = function (message) {
                const msg = {};
                msg.payload = JSON.parse(message.body);
                node.send(msg);
            };

            const connectCallback = function (frame) {
                console.log("connect");
                stompClient.subscribe(node.destination, subscribeCallback);
                setStatus("green", "dot", "connected");
            };
            const errorCallback = function (error) {
                console.log("connect error:");
                console.log(error);
                setStatus("red", "dot", "disconnect");
            };
            stompClient.connect({}, connectCallback, errorCallback);
        }
        else {
            setStatus("red", "dot", "disconnect");
        }

        node.on("close", function (removed, done) {
            stompClient.disconnect(function () {
                console.log("disconnect !");
            });
            done();
        });
    }
    RED.nodes.registerType("NICP-SockWithStomp", SockWithStomp);
};