module.exports = function (RED) {
    function LowerCaseNode(config) {
        RED.nodes.createNode(this, config);

        this.name2 = config.name2;

        let node = this;

        node.on("input", function (msg) {
            //RED.settings.flowFile //可以印出目前這個Flow存放在本機檔案系統上的檔案名稱
            // console.log(RED.settings.userDir);// /Users/xanxus/.node-red
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });

    }
    RED.nodes.registerType("lower-case", LowerCaseNode);
};
