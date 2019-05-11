const filterArray = function _filterArray(array) {
    // 把陣列中空值""把他去掉
    // 因從irsend list "" "" 這個指令輸出的可用裝置列表會有空白
    // 參考 https://bit.ly/2rpMQm8 在UPDATE - just another fast, cool way (using ES6):這個部分
    let temp = [];
    for (let i of array) {
        i && temp.push(i); // copy each non-empty value to the 'temp' array
    }
    array = temp;
    delete temp; // discard the variable
    return array;
};