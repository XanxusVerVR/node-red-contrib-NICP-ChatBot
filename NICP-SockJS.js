// 程式碼參考這篇  https://bit.ly/2ZuQtou
const _ = require("underscore");
const Stomp = require("stompjs");
const _SockJS = require("sockjs-client");
const clc = require("cli-color");
const green = clc.greenBright;
const white = clc.white;
const red = clc.red;

let stompClient;
module.exports = function (RED) {

    // SockJS Configuration Credential節點
    function SockJSNode(config) {
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
        this.addition = function _addition(a, b) {
            return a + b;
        };
        // console.log(`印出SockJS Configuration Credential節點的sockjsUrl：${this.sockjsUrl}`);
    }
    RED.nodes.registerType("NICP-SockJS Node", SockJSNode, {
        credentials: {
            sockjsUrl: {
                type: "text"
            }
        }
    });

    // SockJS In節點
    function SockJSIn(config) {

        const setStatus = function _setStatus(fill, shape, text) {
            node.status({
                fill: fill,
                shape: shape,
                text: text
            });
        };

        RED.nodes.createNode(this, config);

        this.name = config.name || "My SockJSIn Node";
        this.destination = config.destination;
        this.sockJSConfigNode = RED.nodes.getNode(config.sockJSConfigNode);//取得credentials物件

        const node = this;
        // console.log(`1+1是：${node.sockJSConfigNode.addition(1, 1)}`);

        if (!_.isEmpty(node.sockJSConfigNode.credentials.sockjsUrl) && !_.isEmpty(node.destination)) {

            // sock = new _SockJS(node.sockJSConfigNode.credentials.sockjsUrl);
            stompClient = Stomp.over(node.sockJSConfigNode.getSockJSInstance());

            const subscribeCallback = function (message) {
                const msg = {};
                msg.payload = JSON.parse(message.body);
                node.send(msg);
            };

            const connectCallback = function (frame) {
                setTimeout(function () {
                    console.log(green("SockWithStomp節點的ID: ") + white(node.id) + green(" Stomp已連線！"));
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
                    console.log(red("SockWithStomp節點的ID: ") + white(node.id) + red(" Stomp連線錯誤！"));
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
                console.log(yellow("SockWithStomp節點的ID: ") + white(node.id) + yellow(" Stomp連線關閉！"));
            });
            done();
        });
    }
    RED.nodes.registerType("NICP-SockJS In", SockJSIn);

    // SockJS Out節點
    function SockJSOut(config) {

        const setStatus = function _setStatus(fill, shape, text) {
            node.status({
                fill: fill,
                shape: shape,
                text: text
            });
        };

        RED.nodes.createNode(this, config);

        this.name = config.name || "My SockJSOut Node";
        this.destination = config.destination;
        this.sockJSConfigNode = RED.nodes.getNode(config.sockJSConfigNode);//取得SockJS Configuration Credential節點的物件

        const node = this;

        // node.on("close", function (removed, done) {
        //     stompClient.disconnect(function () {
        //         console.log(yellow("SockWithStomp節點的ID: ") + white(node.id) + yellow(" Stomp連線關閉！"));
        //     });
        //     done();
        // });
    }
    RED.nodes.registerType("NICP-SockJS Out", SockJSOut);
};