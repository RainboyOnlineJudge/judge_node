var cp = require('child_process')
var join = require('path').join;

function judger(config,cb){

    var child = cp.fork( __dirname+'/client.js',{
        detached:true
    });

    child.on('message',function(result){
        child.kill();
        cb(result);
    })
    child.send(config)
}

module.exports= judger;
