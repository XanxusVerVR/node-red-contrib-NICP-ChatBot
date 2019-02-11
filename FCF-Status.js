const colors = require("colors");
const operators = {
    "eq": function (a, b) { return a == b; },
    "neq": function (a, b) { return a != b; },
    "lt": function (a, b) { return a < b; },
    "lte": function (a, b) { return a <= b; },
    "gt": function (a, b) { return a > b; },
    "gte": function (a, b) { return a >= b; },
    "btwn": function (a, b, c) { return a >= b && a <= c; },
    "cont": function (a, b) { return (a + "").indexOf(b) != -1; },
    "regex": function (a, b, c, d) { return (a + "").match(new RegExp(b, d ? "i" : "")); },
    "true": function (a) { return a === true; },
    "false": function (a) { return a === false; },
    "null": function (a) { return (typeof a == "undefined" || a === null); },
    "nnull": function (a) { return (typeof a != "undefined" && a !== null); },
    "empty": function (a) {
        if (typeof a === "string" || Array.isArray(a) || Buffer.isBuffer(a)) {
            return a.length === 0;
        } else if (typeof a === "object" && a !== null) {
            return Object.keys(a).length === 0;
        }
        return false;
    },
    "nempty": function (a) {
        if (typeof a === "string" || Array.isArray(a) || Buffer.isBuffer(a)) {
            return a.length !== 0;
        } else if (typeof a === "object" && a !== null) {
            return Object.keys(a).length !== 0;
        }
        return false;
    },

    "istype": function (a, b) {
        if (b === "array") { return Array.isArray(a); }
        else if (b === "buffer") { return Buffer.isBuffer(a); }
        else if (b === "json") {
            try { JSON.parse(a); return true; }   // or maybe ??? a !== null; }
            catch (e) { return false; }
        }
        else if (b === "null") { return a === null; }
        else { return typeof a === b && !Array.isArray(a) && !Buffer.isBuffer(a) && a !== null; }
    },
    "head": function (a, b, c, d, parts) {
        var count = Number(b);
        return (parts.index < count);
    },
    "tail": function (a, b, c, d, parts) {
        var count = Number(b);
        return (parts.count - count <= parts.index);
    },
    "index": function (a, b, c, d, parts) {
        var min = Number(b);
        var max = Number(c);
        var index = parts.index;
        return ((min <= index) && (index <= max));
    },
    "jsonata_exp": function (a, b) { return (b === true); },
    "else": function (a) { return a === true; }
};
module.exports = function (RED) {

    function Status(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name || "My Status Node";
        this.propertyType = config.propertyType;
        this.property = config.property;
        this.propertyType2 = config.propertyType2;
        this.property2 = config.property2;
        this.mode = config.mode;
        this.rules = config.rules;
        this.bigFill = config.bigFill;
        this.bigShape = config.bigShape;
        this.valStatusUnit = config.valStatusUnit.trim();

        let node = this;

        //定義input事件的Callback Function
        const inputCallback = function (msg) {
            let count = 0;//紀錄條件成立幾次，用來提醒使用者定義的條件可能成立多次
            if (node.mode == "displayStatus") {
                let property = getProperty(node.propertyType, node.property, msg);
                let rules = node.rules;
                for (let i = 0; i < rules.length; i++) {
                    let beingComparedPropertyValue = getProperty(rules[i].beingComparedPropertyType, rules[i].beingComparedProperty, msg);
                    if (operators[rules[i].comparisonOperator](property, beingComparedPropertyValue)) {
                        count++;
                        setStatus(rules[i].fill, rules[i].shape, rules[i].text);
                    }
                }
                if (count >= 2) {
                    node.warn("您有一個以上的條件成立!");
                }
            }
            else {
                let statusText = "";
                let property = getProperty(node.propertyType2, node.property2, msg);
                if (!property) {
                    statusText = "數值不存在";
                }
                else {
                    statusText = property + node.valStatusUnit;
                }
                setStatus(node.bigFill, node.bigShape, statusText);
            }
            node.send(msg);
        };
        //將Callback Function註冊到input事件
        node.on("input", inputCallback);
        //當displayVal模式時，就持續觸發input事件來更新狀態數值
        if (node.mode == "displayVal") {
            setInterval(function () {
                //觸發input事件
                node.emit("input", {});
            }, 2000);
        }
        else if (node.mode == "displayStatus" && node.propertyType == "flow" || node.propertyType == "global") {
            setInterval(function () {
                //觸發input事件
                node.emit("input", {});
            }, 2000);
        }
        //當重新部署時，要移除上次的input事件，否則重新部署一次會多觸發一次input事件
        node.on("close", function () {
            node.removeListener("input", inputCallback);
        });
        // 使用Arrow Function來綁定this.status的this
        let setStatus = (_fill, _shape, _text) => {
            this.status({
                fill: _fill,
                shape: _shape,
                text: _text
            });
        };
        // 使用Arrow Function來綁定this.status的this
        let getProperty = (propertyType, property, msg = null) => {
            let obj = null;
            switch (propertyType) {
                case "msg":
                    obj = msg[property];
                    break;
                case "flow":
                    let flowContext = this.context().flow;
                    obj = flowContext.get(property);
                    break;
                case "global":
                    let globalContext = this.context().global;
                    obj = globalContext.get(property);
                    break;
                case "str":
                case "num":
                case "bool":
                    obj = property;
                    break;
                default:
            }
            return obj;
        };
    }
    RED.nodes.registerType("FCF-Status", Status);
};