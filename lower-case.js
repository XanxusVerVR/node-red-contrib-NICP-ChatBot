module.exports = function (RED) {
    function LowerCaseNode(config) {

        RED.nodes.createNode(this, config);

        //config預設有name屬性，不管使用者有沒有定義name，config的name屬性一直存在，當name沒有值的時候，預設空字串
        //而this的話，如使用者沒有定義name，則this將不存在name屬性，但只要有定義，就會跑出name屬性
        //故this config node物件的參考可能用以下程式碼設置:
        this.name = config.name || "To Lower Case";//當config的name沒定義時，值就是To Lower Case，這樣this的name永遠都會存在了，而且都有值
        this.name2 = config.name2;

        let node = this;

        if (this.credentials) {
            console.log(this.credentials.username);//存取credential的屬性
            console.log(this.credentials.password);
        }
        else {
            console.log("credentials不存在");
        }
        node.on("input", function (msg) {
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });

    }
    RED.nodes.registerType("lower-case", LowerCaseNode, {
        credentials: {//這裡也要定義credentials物件
            username: {
                type: "text"
            },
            password: {
                type: "password"
            }
        }
    });
};