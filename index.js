const binding = require('./build/Release/binding');

var checkArgument = require('./lib/checkArguments.js')


var flag = {
    SUCCESS:0,
    CPU_TIME_LIMIT_EXCEEDED:1,
    REAL_TIME_LIMIT_EXCEEDED:2,
    MEMORY_LIMIT_EXCEEDED:3,
    RUNTIME_ERROR:4,
    SYSTEM_ERROR:5
}

function judgerSync(config){
    var check = checkArgument(config);
    if( check.length !== 0)
        return check;

    debugger;
    if(!(config.seccomp_rule_name === 'general' || config.seccomp_rule_name === 'c_cpp'))
        config.seccomp_rule_name = null;

    return binding.hello(
        config.max_cpu_time,
        config.max_real_time ,
        config.max_memory,
        config.max_process_number,
        config.max_output_size,
        config.exe_path,
        config.input_path,
        config.output_path,
        config.error_path,
        config.args,
        config.env,
        config.log_path,
        config.seccomp_rule_name,
        config.gid,
        config.uid
    )
}

exports.judgerSync = judgerSync;
exports.judger = judgerSync;

exports.flag = flag;

