module.exports = function (RED) {
    function Status(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.on("input", function (msg) {
            console.log(config);
            let propertyType = config.propertyType;//取得物件(msg、flow、global)
            let property = config.property;//取得屬性
            setStatus(config.rules[0].fill,config.rules[0].shape,config.rules[0].text);
            switch (propertyType) {
                case "msg":
                    console.log(msg[property]);
                    break;
                case "flow":
                    let flowContext = this.context().flow;
                    console.log(flowContext.get(property));//可以取出值了
                    break;
                case "global":
                    let globalContext = this.context().global;
                    console.log(globalContext.get(property));//可以取出值了
                    break;
                default:
            }
            node.send(msg);
        });
        function setStatus(_fill,_shape,_text) {
            node.status({
                fill: _fill,
                shape: _shape,
                text: _text
            });
        }
    }
    RED.nodes.registerType("FCF-Status", Status);
};