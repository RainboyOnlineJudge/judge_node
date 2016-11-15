var should = require('should')
var join = require('path').join;
var judgerSync = require('../index.js').judgerSync;
var _judger = require('../index.js').flag;

var base = require('./base.js');
var _compile_c = base._compile_c;
var make_input = base.make_input;
var _output_path = base.output_path;
var output_content = base.output_content;

var name = 'Rainboy'
var t_path = 'tests/testcase/seccomp'

var inte_config = {
    max_cpu_time :1000,
    max_real_time :3000,
    max_memory : 1024*1024*128,
    max_process_number:10, 
    max_output_size:1024*1024,
    exe_path: '/bin/ls',
    input_path:'/dev/null',
    output_path:'/dev/null',
    error_path:'/dev/null',
    args:[],
    env:['env=judger_test','test=judger'],
    log_path:'judger_test.log',
    seccomp_rule_name:null,
    gid:0,
    uid:0
};

var workspace = join(process.cwd(),'testcase/integration');

function seccomp(){
    describe('test_fork',function(){
        it('fork.c',function(){
            var config = JSON.parse( JSON.stringify(inte_config));
            config["max_memory"] = 1024 * 1024 * 1024
            config['exe_path'] = _compile_c( join(t_path,'fork.c'));
            config.output_path = config.error_path = _output_path();

            // without seccomp
            var res = judgerSync(config);
            res.result.should.eql(_judger.SUCCESS);

            // with general seccomp
            config["seccomp_rule_name"] = "general"
            res = judgerSync(config);
            res.result.should.eql(_judger.RUNTIME_ERROR);
            res.signal.should.eql(31);

            // with c_cpp seccomp
            config["seccomp_rule_name"] = "c_cpp"
            res = judgerSync(config);
            res.result.should.eql(_judger.RUNTIME_ERROR);
            res.signal.should.eql(31);

        })
    })

    describe('test_execve',function(){
        it('execve.c',function(){
            var config = JSON.parse( JSON.stringify(inte_config));
            config["max_memory"] = 1024 * 1024 * 1024
            config['exe_path'] = _compile_c( join(t_path,'execve.c'));
            config.output_path = config.error_path = _output_path();

            // without seccomp
            var res = judgerSync(config);
            var out = "Helloworld\n";
            res.result.should.eql(_judger.SUCCESS);
            out.should.eql( output_content(config.output_path))

            // with general seccomp
            config["seccomp_rule_name"] = "general"
            res = judgerSync(config);
            res.result.should.eql(_judger.RUNTIME_ERROR);
            res.signal.should.eql(31);

            // with c_cpp seccomp
            config["seccomp_rule_name"] = "c_cpp"
            res = judgerSync(config);
            res.result.should.eql(_judger.RUNTIME_ERROR);
            res.signal.should.eql(31);

        })
    })

    describe('test_write_file',function(){
        it('write_file.c',function(){
            var config = JSON.parse( JSON.stringify(inte_config));
            config["max_memory"] = 1024 * 1024 * 1024
            config['exe_path'] = _compile_c( join(t_path,'write_file.c'));
            config.output_path = config.error_path = _output_path();

            // without seccomp
            var res = judgerSync(config);
            var out = "test";
            res.result.should.eql(_judger.SUCCESS);
            out.should.eql( output_content('/tmp/fffffffffffffile.txt'))

            // with general seccomp
            config["seccomp_rule_name"] = "general"
            res = judgerSync(config);
            res.result.should.eql(_judger.RUNTIME_ERROR);
            res.signal.should.eql(31);

            // with c_cpp seccomp
            config["seccomp_rule_name"] = "c_cpp"
            res = judgerSync(config);
            res.result.should.eql(_judger.RUNTIME_ERROR);
            res.signal.should.eql(31);

        })
    })
}


module.exports = seccomp;
