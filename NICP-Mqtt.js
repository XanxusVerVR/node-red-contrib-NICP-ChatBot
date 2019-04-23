/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function (RED) {
    "use strict";
    const mqtt = require("mqtt");
    const util = require("util");
    const isUtf8 = require("is-utf8");
    const HttpsProxyAgent = require("https-proxy-agent");
    const url = require("url");
    let getProperty = function _getProperty(node, msg, done) {
        if (node.propertyType === "jsonata") {
            RED.util.evaluateJSONataExpression(node.property, msg, (err, value) => {
                if (err) {
                    done(RED._("switch.errors.invalid-expr", { error: err.message }));
                } else {
                    done(undefined, value);
                }
            });
        } else {
            node.property = node.topic;
            RED.util.evaluateNodeProperty(node.property, node.propertyType, node, msg, (err, value) => {
                if (err) {
                    done(undefined, undefined);
                } else {
                    done(undefined, value);
                }
            });
        }
    };
    function matchTopic(ts, t) {
        if (ts == "#") {
            return true;
        }
        /* The following allows shared subscriptions (as in MQTT v5)
           http://docs.oasis-open.org/mqtt/mqtt/v5.0/cs02/mqtt-v5.0-cs02.html#_Toc514345522

           4.8.2 describes shares like:
           $share/{ShareName}/{filter}
           $share is a literal string that marks the Topic Filter as being a Shared Subscription Topic Filter.
           {ShareName} is a character string that does not include "/", "+" or "#"
           {filter} The remainder of the string has the same syntax and semantics as a Topic Filter in a non-shared subscription. Refer to section 4.7.
        */
        else if (ts.startsWith("$share")) {
            ts = ts.replace(/^\$share\/[^#+/]+\/(.*)/g, "$1");

        }
        let re = new RegExp("^" + ts.replace(/([\[\]\?\(\)\\\\$\^\*\.|])/g, "\\$1").replace(/\+/g, "[^/]+").replace(/\/#$/, "(\/.*)?") + "$");
        return re.test(t);
    }

    function MQTTInNode(n) {
        RED.nodes.createNode(this, n);
        this.topic = n.topic;
        this.propertyType = n.propertyType;
        this.qos = parseInt(n.qos);
        if (isNaN(this.qos) || this.qos < 0 || this.qos > 2) {
            this.qos = 2;
        }
        this.broker = n.broker;
        this.brokerConn = RED.nodes.getNode(this.broker);
        if (!/^(#$|(\+|[^+#]*)(\/(\+|[^+#]*))*(\/(\+|#|[^+#]*))?$)/.test(this.topic)) {
            return this.warn(RED._("mqtt.errors.invalid-topic"));
        }
        this.datatype = n.datatype || "utf8";
        let node = this;
        if (this.brokerConn) {
            this.status({ fill: "red", shape: "ring", text: "node-red:common.status.disconnected" });
            //製作假msg物件，為了送去getProperty方法去代換資料出來
            getProperty(node, { _msgid: RED.util.generateId(), topic: "", payload: "" }, (err, topic) => {//這裡的topic原本參數名叫property，為了識別所以改成topic，它是代換過的
                if (err) {
                    node.warn(err);
                    done();
                } else {
                    if (topic) {
                        node.brokerConn.register(this);
                        this.brokerConn.subscribe(topic, this.qos, function (topic, payload, packet) {
                            if (node.datatype === "buffer") {
                                // payload = payload;
                            } else if (node.datatype === "base64") {
                                payload = payload.toString("base64");
                            } else if (node.datatype === "utf8") {
                                payload = payload.toString("utf8");
                            } else if (node.datatype === "json") {
                                if (isUtf8(payload)) {
                                    payload = payload.toString();
                                    try { payload = JSON.parse(payload); }
                                    catch (e) { node.error(RED._("mqtt.errors.invalid-json-parse"), { payload: payload, topic: topic, qos: packet.qos, retain: packet.retain }); return; }
                                }
                                else { node.error((RED._("mqtt.errors.invalid-json-string")), { payload: payload, topic: topic, qos: packet.qos, retain: packet.retain }); return; }
                            } else {
                                if (isUtf8(payload)) { payload = payload.toString(); }
                            }
                            let msg = { topic: topic, payload: payload, qos: packet.qos, retain: packet.retain };
                            if ((node.brokerConn.broker === "localhost") || (node.brokerConn.broker === "127.0.0.1")) {
                                msg._topic = topic;
                            }
                            node.send(msg);
                        }, this.id);
                        if (this.brokerConn.connected) {
                            node.status({ fill: "green", shape: "dot", text: "node-red:common.status.connected" });
                        }
                    }
                    else {
                        this.error(RED._("mqtt.errors.not-defined"));
                    }
                }
            });

            this.on("close", function (removed, done) {
                if (node.brokerConn) {
                    if (removed) {
                        // This node has been removed so remove any subscriptions
                        node.brokerConn.unsubscribe(node.topic, node.id);
                    }
                    node.brokerConn.deregister(node, done);
                }
            });
        } else {
            this.error(RED._("mqtt.errors.missing-config"));
        }
    }
    RED.nodes.registerType("NICP-Mqtt-In", MQTTInNode);

    function MQTTOutNode(n) {
        RED.nodes.createNode(this, n);
        this.topic = n.topic;
        this.propertyType = n.propertyType;
        this.qos = n.qos || null;
        this.retain = n.retain;
        this.broker = n.broker;
        this.brokerConn = RED.nodes.getNode(this.broker);
        let node = this;
        if (this.brokerConn) {
            this.status({ fill: "red", shape: "ring", text: "node-red:common.status.disconnected" });
            this.on("input", function (msg) {
                if (msg.qos) {
                    msg.qos = parseInt(msg.qos);
                    if ((msg.qos !== 0) && (msg.qos !== 1) && (msg.qos !== 2)) {
                        msg.qos = null;
                    }
                }
                msg.qos = Number(node.qos || msg.qos || 0);
                msg.retain = node.retain || msg.retain || false;
                msg.retain = ((msg.retain === true) || (msg.retain === "true")) || false;
                getProperty(node, msg, (err, topic) => {//這裡的topic原本參數名叫property，為了識別所以改成topic，它是代換過的
                    if (err) {
                        node.warn(err);
                        done();
                    } else {
                        if (topic) {
                            msg.topic = topic;
                        }
                        if (msg.hasOwnProperty("payload")) {
                            if (msg.hasOwnProperty("topic") && (typeof msg.topic === "string") && (msg.topic !== "")) { // topic must exist

                                msg.payload = {
                                    topic: msg.topic,
                                    data: msg.payload,
                                    protocolType: "MQTT",
                                    dataId: RED.util.generateId()
                                };
                                this.brokerConn.publish(msg);  // send the message
                            }
                            else { node.warn(RED._("mqtt.errors.invalid-topic")); }
                        }
                    }
                });
            });
            if (this.brokerConn.connected) {
                node.status({ fill: "green", shape: "dot", text: "node-red:common.status.connected" });
            }
            node.brokerConn.register(node);
            this.on("close", function (done) {
                node.brokerConn.deregister(node, done);
            });
        } else {
            this.error(RED._("mqtt.errors.missing-config"));
        }
    }
    RED.nodes.registerType("NICP-Mqtt-Out", MQTTOutNode);
};
