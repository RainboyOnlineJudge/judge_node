var should = require('should')
var join = require('path').join;
var judge = require('../father.js');
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
        it('fork.c',function(done){
            this.timeout(15000)
            var config = JSON.parse( JSON.stringify(inte_config));
            config["max_memory"] = 1024 * 1024 * 1024
            
            _compile_c( join(t_path,'fork.c'),function(exe_path){
                config['exe_path'] = exe_path
                config.output_path = config.error_path = _output_path();
                judge(config,function(res){
                    // without seccomp
                    res.result.should.eql(_judger.SUCCESS);
                    // with general seccomp
                    config["seccomp_rule_name"] = "general"
                    judge(config,function(res){
                        // with general seccomp
                        res.result.should.eql(_judger.RUNTIME_ERROR);
                        res.signal.should.eql(31);
                        config["seccomp_rule_name"] = "c_cpp"
                        judge(config,function(res){
                            // with c_cpp seccomp
                            res.result.should.eql(_judger.RUNTIME_ERROR);
                            res.signal.should.eql(31);
                            done()
                        })
                    })
                })
            })

        })
    })

    describe('test_execve',function(){
        it('execve.c',function(done){
            this.timeout(15000)
            var config = JSON.parse( JSON.stringify(inte_config));
            config["max_memory"] = 1024 * 1024 * 1024

            _compile_c( join(t_path,'execve.c'),function(exe_path){
                config['exe_path'] = exe_path
                config.output_path = config.error_path = _output_path();
                judge(config,function(res){
                    //without seccomp
                    var out = "Helloworld\n";
                    res.result.should.eql(_judger.SUCCESS);
                    out.should.eql( output_content(config.output_path))

                    config["seccomp_rule_name"] = "general"
                    judge(config,function(res){
                        //with general seccomp
                        res.result.should.eql(_judger.RUNTIME_ERROR);
                        res.signal.should.eql(31);

                        config["seccomp_rule_name"] = "c_cpp"
                        judge(config,function(res){
                            //with c_cpp seccomp
                            res.result.should.eql(_judger.RUNTIME_ERROR);
                            res.signal.should.eql(31);
                            done()
                        })
                    })
                })
            })
        })
    })

    describe('test_write_file',function(){
        it('write_file.c',function(done){
            this.timeout(15000)
            var config = JSON.parse( JSON.stringify(inte_config));
            config["max_memory"] = 1024 * 1024 * 1024

            _compile_c( join(t_path,'write_file.c'),function(exe_path){
                config['exe_path'] = exe_path
                config.output_path = config.error_path = _output_path();
                judge(config,function(res){
                    //without seccomp
                    var out = "test";
                    res.result.should.eql(_judger.SUCCESS);
                    out.should.eql( output_content('/tmp/fffffffffffffile.txt'))

                    config["seccomp_rule_name"] = "general"
                    judge(config,function(res){

                        //with general seccomp
                        res.result.should.eql(_judger.RUNTIME_ERROR);
                        res.signal.should.eql(31);

                        config["seccomp_rule_name"] = "c_cpp"
                        judge(config,function(res){
                            //with c_cpp seccomp
                            res.result.should.eql(_judger.RUNTIME_ERROR);
                            res.signal.should.eql(31);
                            done()
                        })
                    })
                })
            })
        })
    })
}


module.exports = seccomp;
