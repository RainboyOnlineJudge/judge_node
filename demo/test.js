var judger = require('../index.js').judger;

var join = require('path').join;
var base = process.cwd();

var config = {
    max_cpu_time : 100000,
    max_real_time : 100000,
    max_memory : 10000000000,
    max_process_number:4,
    max_output_size:1024*1024,
    exe_path: '/usr/bin/gcc',
    input_path:join(base,'in'),
    output_path:join(base,'gcc_out'),
    error_path:join(base,'err.log'),
    args:[join(base,'demo.c'),'-o',join(base,'demo')],
    env:['PATH=/usr/bin'],
    log_path:join(base,'compile.log'),
    seccomp_rule_name:null,
    gid:0,
    uid:0
}

judger(config,function(err,restul){
    console.log(err)
});

