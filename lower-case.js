module.exports = function (RED) {
    //LowerCaseNode節點的建構子
    function LowerCaseNode(config) {
        //第一件事必須呼叫RED.nodes.createNode來初始化，作用是把此節點分享給所有
        RED.nodes.createNode(this, config);
        //接下來就可以開始寫自己的程式了
        //宣告一個新物件node參考this
        const node = this;
        let context = this.context().flow;//建立並取得context物件
        let count = 0;//這裡一定要先宣告初始值為0
        //也有直接this.on這種寫法
        //註冊一個監聽器來監聽input事件來接收從上游傳來的訊息
        node.on("input", (msg) => {
            // msg.payload = msg.payload.toLowerCase();
            if(!context.get("count")){//count物件不存在(0和null都會被判定false)
                context.set("count",count++);
            }
            else{//如果存在
                count = context.get("count");
                count++;
                context.set("count",count);
            }
            //寄出訊息
            msg.payload = context.get("count");
            node.send(msg);
        });
        node.status({ fill: "green", shape: "dot", text: "XanxusTest4" });
    }
    RED.nodes.registerType("lower-case", LowerCaseNode);
}