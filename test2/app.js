var express = require('express');
var app = express();

app.get('/',function(req,res){
    res.end('helllo world');
})


app.listen('8080',function(){
    console.log('listen at 8080');
})
