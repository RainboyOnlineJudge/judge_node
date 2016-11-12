var judger = require('./index.js').judgerSync;


process.on('message',function(config){
    var result = judger(config);
    process.send(result)
})
