var judger= require('../father.js');
var path = process.cwd();
var join = require('path').join;
var fs = require('fs');

var basename = require('path').basename;

const workspace = '/tmp'

function randstr(){
    return Math.random().toString(36).substring(2);
}

var myconfig = {
    max_cpu_time :-1,
    max_real_time : -1,
    max_memory : -1,
    max_process_number:-1,
    max_output_size:-1,
    exe_path: '',
    input_path:'/dev/null',
    output_path:'/dev/null',
    error_path:'/dev/null',
    args:[],
    env:["PATH=/usr/bin"],
    log_path:'judger_test.log',
    seccomp_rule_name:null,
    gid:0,
    uid:0
}

function _compile_c(str_path,cb){
    var _config = JSON.parse( JSON.stringify(myconfig));
    _config.exe_path = '/usr/bin/gcc';
    var out_path = join('/tmp',basename(str_path).split('.')[0]);
    _config.args = [join(path,str_path),'-o',out_path];
    judger(_config,function(result){
        if(result.result !== 0 )
            throw new TypeError('compiler failed :'+str_path)
        else
            cb(out_path)
    })
}

function make_input(content){
    var out_path = join(workspace,randstr());
    fs.writeFileSync(out_path,content);
    return out_path;
}

function output_content(_path){
    return fs.readFileSync(_path,{encoding:'utf8'})
}

function output_path(){
    return join( workspace,randstr());
}

exports._compile_c = _compile_c;
exports.make_input = make_input;
exports.output_path = output_path;
exports.output_content = output_content;
