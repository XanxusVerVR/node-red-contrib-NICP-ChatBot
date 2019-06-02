// 程式碼參考這篇  https://bit.ly/2ZuQtou
// API使用參考 https://bit.ly/2BIXo5D
const _ = require("underscore");
const Stomp = require("stompjs");
const _SockJS = require("sockjs-client");
const clc = require("cli-color");
const green = clc.greenBright;
const white = clc.white;
const red = clc.red;
module.exports = function (RED) {

    // Config節點
    function StompNode(config) {
        RED.nodes.createNode(this, config);

        this.sockjsUrl = this.credentials.sockjsUrl;
        const sock = new _SockJS(this.sockjsUrl);
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
        this.getSockJSInstance = function _getSockJSInstance() {
            return sock;
        };
    }
    RED.nodes.registerType("NICP-Stomp Node", StompNode, {
        credentials: {
            sockjsUrl: {
                type: "text"
            }
        }
    });


    // Stomp In節點
    function StompIn(config) {

        const setStatus = function _setStatus(fill, shape, text) {
            node.status({
                fill: fill,
                shape: shape,
                text: text
            });
        };

        RED.nodes.createNode(this, config);

        this.name = config.name || "My StompIn Node";
        this.destination = config.destination;
        this.sockJSConfigNode = RED.nodes.getNode(config.sockJSConfigNode);//取得credentials物件

        const node = this;

        if (!_.isEmpty(node.sockJSConfigNode.credentials.sockjsUrl) && !_.isEmpty(node.destination)) {

            const stompClient = Stomp.over(node.sockJSConfigNode.getSockJSInstance());

            const subscribeCallback = function (message) {
                const msg = {};
                msg.payload = JSON.parse(message.body);
                node.send(msg);
            };

            const connectCallback = function (frame) {
                setTimeout(function () {
                    console.log(green("Stomp節點的ID: ") + white(node.id) + green(" Stomp已連線！"));
                    try {
                        stompClient.subscribe(node.destination, subscribeCallback);
                    } catch (error) {
                        console.log("連線發生錯誤or來不及建立");
                        console.log(error);
                    }
                    setStatus("green", "dot", "connected");
                }, 1000);
            };
            const errorCallback = function (error) {
                setTimeout(function () {
                    console.log(red("Stomp節點的ID: ") + white(node.id) + red(" Stomp連線錯誤！"));
                    console.log(error);
                    setStatus("red", "dot", "disconnect");
                }, 1000);
            };
            stompClient.connect({}, connectCallback, errorCallback);
        }
        else {
            setStatus("red", "dot", "disconnect");
        }

        node.on("close", function (removed, done) {
            stompClient.disconnect(function () {
                console.log(yellow("Stomp節點的ID: ") + white(node.id) + yellow(" Stomp連線關閉！"));
            });
            done();
        });
    }
    RED.nodes.registerType("NICP-Stomp In", StompIn);


    // Stomp Out節點
    function StompOut(config) {

        const setStatus = function _setStatus(fill, shape, text) {
            node.status({
                fill: fill,
                shape: shape,
                text: text
            });
        };

        RED.nodes.createNode(this, config);

        this.name = config.name || "My StompOut Node";
        this.destination = config.destination;
        this.sockJSConfigNode = RED.nodes.getNode(config.sockJSConfigNode);//取得Stomp Configuration Credential節點的物件

        const node = this;

        let stompClient;

        if (!_.isEmpty(node.sockJSConfigNode.credentials.sockjsUrl) && !_.isEmpty(node.destination)) {

            stompClient = Stomp.over(node.sockJSConfigNode.getSockJSInstance());

            const connectCallback = function (frame) {
                console.log(green("Stomp節點的ID: ") + white(node.id) + green(" Stomp已連線！"));
                setStatus("green", "dot", "connected");
            };
            const errorCallback = function (error) {
                console.log(red("Stomp節點的ID: ") + white(node.id) + red(" Stomp連線錯誤！"));
                console.log(error);
                setStatus("red", "dot", "disconnect");
            };
            stompClient.connect({}, connectCallback, errorCallback);
        }
        else {
            setStatus("red", "dot", "disconnect");
        }

        node.on("input", function (msg) {
            stompClient.send(node.destination, {}, JSON.stringify(msg.payload));
        });

        node.on("close", function (removed, done) {
            stompClient.disconnect(function () {
                console.log(yellow("Stomp節點的ID: ") + white(node.id) + yellow(" Stomp連線關閉！"));
            });
            done();
        });
    }
    RED.nodes.registerType("NICP-Stomp Out", StompOut);
};
