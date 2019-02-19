module.exports = function (RED) {
    function LowerCaseNode(config) {
        RED.nodes.createNode(this, config);

        this.name2 = config.name2;//要做單元測試一定要有這行，要把config的值再設到this裡

        let node = this;//要做單元測試一定要有這行，把node參考這裡的this

        node.on("input", function (msg) {
            //RED.settings.flowFile //可以印出目前這個Flow存放在本機檔案系統上的檔案名稱
            // console.log(RED.settings.userDir);// /Users/xanxus/.node-red
            this.status({
                fill: "red",
                shape: "ring",
                text: "<h1>Hello</h1>"
            });
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });

    }
    RED.nodes.registerType("lower-case", LowerCaseNode);
};
