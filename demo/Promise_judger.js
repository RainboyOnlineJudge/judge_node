/* 对judge 的一层Promise一层封装 */
var _judger = require('../index.js').judgerSync;
var Promise = require('bluebird');

function judger(config){
    return new Promise(function(resolve,recject){
        var res= _judger(config)
        resolve(res);
    })
}

module.exports = judger;
