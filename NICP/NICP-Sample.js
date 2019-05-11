const _ = require("underscore");
const clc = require("cli-color");
const green = clc.greenBright;
const white = clc.white;
const redBright = clc.redBright;
module.exports = function (RED) {
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
            RED.util.evaluateNodeProperty(node.property, node.propertyType, node, msg, (err, value) => {
                if (err) {
                    done(undefined, undefined);
                } else {
                    done(undefined, value);
                }
            });
        }
    };
    function Sample(config) {

        RED.nodes.createNode(this, config);
        this.propertyType = config.propertyType;
        this.property = config.property;
        let node = this;

        let inputCallback = function (msg) {
            console.log("msg:");
            console.log(msg);
            getProperty(node, msg, (err, property) => {
                if (err) {
                    node.warn(err);
                    done();
                } else {
                    // 印出找到的值
                    console.log(property);
                }
            });
        };
        node.on("input", inputCallback);

    }
    RED.nodes.registerType("FCF-Sample", Sample);

    RED.httpAdmin.get("/static/js/*", function (req, res) {
        // 在mac上跑會印出：/Users/xanxus/.node-red/nodes/node-red-contrib-FCF-ChatBot/NICP/lib/
        var options = {
            root: __dirname + "/lib/",
            dotfiles: "deny"
        };
        /* 當html那裡像下面這樣寫
        <script type="text/javascript" src="geofence/js/underscore-min.js"></script>
        src="geofence/js/underscore-min.js" 就是在請求這個服務，而這個服務的端點長這樣"/geofence/js/*"，underscore-min.js被當作端點的變數傳進來
        故req.params[0]會印出：underscore-min.js
        這樣的做法是參考：https://bit.ly/2PWoedZ
        */
        res.sendFile(req.params[0], options);
    });
};