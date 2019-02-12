module.exports = function (RED) {
    function LowerCaseNode(config) {

        RED.nodes.createNode(this, config);

        //config預設有name屬性，不管使用者有沒有定義name，config的name屬性一直存在，當name沒有值的時候，預設空字串
        //而this的話，如使用者沒有定義name，則this將不存在name屬性，但只要有定義，就會跑出name屬性
        //故this config node物件的參考可能用以下程式碼設置:
        this.name = config.name || "To Lower Case";//當config的name沒定義時，值就是To Lower Case，這樣this的name永遠都會存在了，而且都有值
        this.name2 = config.name2;
        this.server = RED.nodes.getNode(config.server);//取得在config節點設置的物件資料

        let node = this;

        if (node.server) {
            console.log(node.server.host);
            console.log(node.server.port);
        }
        else {

        }
        node.on("input", function (msg) {
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });

    }
    RED.nodes.registerType("lower-case", LowerCaseNode);
};