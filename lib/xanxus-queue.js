function Queue() {
    this.data = [];
}

Queue.prototype.add = function (record) {
    this.data.unshift(record);
};

Queue.prototype.remove = function () {
    this.data.pop();
};

//拿第一個，也就是最後進去的那個
Queue.prototype.first = function () {
    return this.data[0];
};

//拿最後一個，也就是先進去的那個
Queue.prototype.last = function () {
    return this.data[this.data.length - 1];
};

Queue.prototype.size = function () {
    return this.data.length;
};

Queue.prototype.clear = function () {
    this.data = [];
};

module.exports = Queue;

// 程式碼來源：https://hackernoon.com/the-little-guide-of-queue-in-javascript-4f67e79260d9