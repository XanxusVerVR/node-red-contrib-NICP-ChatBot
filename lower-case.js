module.exports = function (RED) {
    function LowerCaseNode(config) {
        RED.nodes.createNode(this, config);

        const flowContext = this.context().flow;//建立並取得context物件
        let contextFileSystemNodeTypeKey = flowContext.get(config.type, "xanxusContext");
        // console.log(contextFileSystemNodeTypeKey);
        this.name2 = contextFileSystemNodeTypeKey[0].name2 || config.name2;//要做單元測試一定要有這行，要把config的值再設到this裡
        this.datas = contextFileSystemNodeTypeKey[0].datas || config.datas;


        const node = this;//要做單元測試一定要有這行，把node參考這裡的this
        console.log(node);
        // console.log(flowContext.get(config.type, "xanxusContext"));
        node.on("input", function (msg) {
            // msg.payload = msg.payload.toLowerCase();
            msg.payload = node.name2;
            node.send(msg);

        });
    }
    RED.nodes.registerType("lower-case", LowerCaseNode);
};