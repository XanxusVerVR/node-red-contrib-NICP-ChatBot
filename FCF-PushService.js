var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
module.exports = function (RED) {//做推播，本程式自己就是server，由外面來呼叫

    function PushService(config) {//可參考這裡http://bit.ly/2u0eSD4的21-httpin.js程式
        RED.nodes.createNode(this, config);
        var node = this;
        node.URL = config.URL;
        var msg = {};

        var app = express();
        app.use(bodyParser.json());
        app.post(node.URL, function (req, res) {
            res.sendStatus(200);

            msg.userID = req.body.UserID;
            msg.payload = req.body.Message;
            node.send(msg);

            //console.log(msg);

        });
        app.listen(1881);//因此方法會再創一個1881的server，因此重新部署的時候會crash


    }//這支程式很重要，是從外部呼叫觸發nodered來做後續處理

    RED.nodes.registerType('FCF-PushService', PushService);
};