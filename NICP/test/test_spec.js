const colors = require("colors");
const _ = require("underscore");
const should = require("should");
const helper = require("node-red-node-test-helper");
// const fcfStatusNode = require("../NICP-Status.js");

// describe("Facebook In節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試Webhook服務是否回應200", function (done) {
//         done();
//     });
//     it("測試Webhook服務的回應content-type是否為json", function (done) {
//         done();
//     });
//     it("測試Webhook服務的回應格式是否正確", function (done) {
//         done();
//     });
//     it("測試輸出的訊息是否有格式化", function (done) {
//         done();
//     });
//     it("測試是否有將訊息設置到payload屬性", function (done) {
//         done();
//     });
// });

// describe("Facebook Out節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試接收到的訊息是否有message屬性", function (done) {
//         done();
//     });
//     it("測試接收到的訊息是否有使用者ID", function (done) {
//         done();
//     });
//     it("測試輸出之訊息是否符合Messenger格式", function (done) {
//         done();
//     });
//     it("測試track屬性是否存在", function (done) {
//         done();
//     });
//     it("如果track屬性存在，測試chatContext物件是否有存在使用者ID", function (done) {
//         done();
//     });
// });

// describe("Facebook Notification節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("一般推播模式，測試content屬性是否不是空", function (done) {
//         done();
//     });
//     it("測試userID屬性是否為陣列", function (done) {
//         done();
//     });
//     it("測試輸出之msg物件是否包含type屬性且值為message", function (done) {
//         done();
//     });
//     it("如果是群體推播，測試result屬性是否存在", function (done) {
//         done();
//     });
//     it("測試result物件的chatId是否存在", function (done) {
//         done();
//     });
// });

// describe("Pull Service節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試URL屬性是否存在", function (done) {
//         done();
//     });
//     it("測試method屬性是否存在", function (done) {
//         done();
//     });
//     it("預期options.body要不存在，如果是get的話", function (done) {
//         done();
//     });
//     it("預期msg.result要存在，如果是post的話", function (done) {
//         done();
//     });
//     it("預期body.message要存在，如果post的話", function (done) {
//         done();
//     });
// });

// describe("Push Service節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試回應是否有statusCode屬性", function (done) {
//         done();
//     });
//     it("測試回應是否有date屬性", function (done) {
//         done();
//     });
// });

// describe("Chat In節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試回應是否有statusCode屬性", function (done) {
//         done();
//     });
//     it("測試sendAPIUrl屬性是否存在", function (done) {
//         done();
//     });
//     it("測試webhookPath屬性是否存在", function (done) {
//         done();
//     });
// });

// describe("Chat Out節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試msg物件是否有content屬性", function (done) {
//         done();
//     });
//     it("測試msg物件是否有chatId屬性", function (done) {
//         done();
//     });
//     it("測試是否有將使用者ID儲存至使用者ID佇列", function (done) {
//         done();
//     });
//     it("測試第一次訊息進來訊息佇列是否為空", function (done) {
//         done();
//     });
//     it("測試當track屬性存在時且msg物件中的transport為faebook時，是否將訊息相關資訊記錄至facebookWithTextContext物件中", function (done) {
//         done();
//     });
// });

// describe("SockJS In節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試SockJS Broker的連線URL是否存在", function (done) {
//         done();
//     });
//     it("測試訂閱的destination屬性是否存在", function (done) {
//         done();
//     });
// });

// describe("SockJS Out節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試SockJS Broker的連線URL是否存在", function (done) {
//         done();
//     });
//     it("測試發佈的destination屬性是否存在", function (done) {
//         done();
//     });
// });

// describe("MQTT In節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試連線的Server IP是否有設置", function (done) {
//         done();
//     });
//     it("測試連線的Port好是否有設置", function (done) {
//         done();
//     });
//     it("測試config是否有topic屬性", function (done) {
//         done();
//     });
// });

// describe("MQTT Out節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試連線的Server IP是否有設置", function (done) {
//         done();
//     });
//     it("測試連線的Port好是否有設置", function (done) {
//         done();
//     });
//     it("測試config是否有topic屬性", function (done) {
//         done();
//     });
// });

// describe("Beacon節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試config物件是否有broadcastingMode屬性", function (done) {
//         done();
//     });
//     it("測試config物件是否有deviceName屬性，當為URL模式時", function (done) {
//         done();
//     });
//     it("測試config物件是否有broadcastingUrl屬性，當為URL模式時", function (done) {
//         done();
//     });
//     it("測試config物件是否有txPowerLevel屬性", function (done) {
//         done();
//     });
//     it("測試config物件是否有namespaceId屬性，當為UID模式時", function (done) {
//         done();
//     });
//     it("測試config物件是否有instanceId屬性，當為UID模式時", function (done) {
//         done();
//     });
//     it("測試config物件是否有uuid屬性，當為iBeacon模式時", function (done) {
//         done();
//     });
//     it("測試config物件是否有major屬性，當為iBeacon模式時", function (done) {
//         done();
//     });
//     it("測試config物件是否有minor屬性，當為iBeacon模式時", function (done) {
//         done();
//     });
//     it("測試config物件是否有measuredPower屬性，當為iBeacon模式時", function (done) {
//         done();
//     });
// });

// describe("Infrared In 節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試config物件是否有listenDevice屬性", function (done) {
//         done();
//     });
//     it("測試config物件是否有listenCommand屬性", function (done) {
//         done();
//     });
// });

// describe("Infrared Out 節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試config物件是否有device屬性", function (done) {
//         done();
//     });
//     it("測試config物件是否有output屬性", function (done) {
//         done();
//     });
// });

// describe("Conditional Trigger 節點測試", function () {
//     beforeEach(function (done) {
//         helper.startServer(done);
//     });
//     afterEach(function (done) {
//         helper.unload();
//         helper.stopServer(done);
//     });
//     it("測試config物件是否有rules屬性", function (done) {
//         done();
//     });
//     it("測試config物件是否有topic屬性", function (done) {
//         done();
//     });
//     it("測試config物件是否有emitOnlyIfTrue屬性", function (done) {
//         done();
//     });
//     it("測試config物件的rules屬性是否為陣列", function (done) {
//         done();
//     });
//     it("測試輸出物件是否有topic屬性", function (done) {
//         done();
//     });
//     it("測試當And兩個條件成立時，應該要有輸出", function (done) {
//         done();
//     });
//     it("測試當or兩個其中一個條件成立時，應該要有輸出", function (done) {
//         done();
//     });
// });