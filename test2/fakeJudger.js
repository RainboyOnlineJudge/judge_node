var judger = require('../index.js').judgerSync

function judgerSync(config){

    return judger(
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
    );
}

exports.judgerSync = judgerSync;
exports.judger= judgerSync;
