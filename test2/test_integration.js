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
var t_path = 'tests/testcase/integration'

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

function integration(){
    describe('args',function(){
        it('test_args_validation',function(done){
            judge('',function(result){
                result.should.eql('need config project')
                done()
            })
        });

        it('args_must_be_a_list',function(done){
            var config = JSON.parse( JSON.stringify(inte_config));
            config.args = "1234"
            judge(config,function(result){
                result.should.eql('args must be a list')
                done()
            })
        });

        it('args_must_be_a_list',function(done){
            var config = JSON.parse( JSON.stringify(inte_config));
            config.args = {k:1};
            judge(config,function(result){
                result.should.eql('args must be a list')
                done()
            })
        });

        it('args_item_must_be_string',function(done){
            var config = JSON.parse( JSON.stringify(inte_config));
            config.args = ["123",123];
            judge(config,function(result){
                result.should.eql('args item must be a string')
                done()
            })
        });

        it('args_item_must_be_string',function(done){
            var config = JSON.parse( JSON.stringify(inte_config));
            config.args = ["123",null];
            judge(config,function(result){
                result.should.eql('args item must be a string')
                done()
            })
        });

    });

    describe('env',function(){
        it('test_env_must_be_a_list',function(done){
            var config = JSON.parse( JSON.stringify(inte_config));
            config.env = "1234"
            judge(config,function(result){
                result.should.eql('env must be a list')
                done()
            })
        });

        it('env_must_be_a_list',function(done){
            var config = JSON.parse( JSON.stringify(inte_config));
            config.env= {k:1};
            judge(config,function(result){
                result.should.eql('env must be a list')
                done()
            })
        });

        it('env_must_be_a_list',function(done){
            var config = JSON.parse( JSON.stringify(inte_config));
            config.env= ["123",123];
            judge(config,function(result){
                result.should.eql('env item must be a string')
                done()
            })
        });

        it('env_must_be_a_list',function(done){
            var config = JSON.parse( JSON.stringify(inte_config));
            config.env= ["123",null];
            judge(config,function(result){
                result.should.eql('env item must be a string')
                done()
            })
        });

    });

    describe('test_normal',function(done){
        it('normal.c',function(done){
            var config = JSON.parse( JSON.stringify(inte_config));
            _compile_c( join(t_path,'normal.c'),function(exe_path){

                config['exe_path'] = exe_path;
                config.input_path = make_input('judger_test');
                config.output_path = config.error_path = _output_path();
                var out = 'judger_test\nHello world';
                judge(config,function(res){
                    res.result.should.eql(0);
                    out.should.eql( output_content(config.output_path))
                    done()
                });
            })
        })
    })

    describe('test_math',function(){
        it('math.c',function(done){
            var config = JSON.parse( JSON.stringify(inte_config));
            _compile_c( join(t_path,'math.c'),function(exe_path){
                config.exe_path = exe_path
                config.input_path = '/dev/null'
                config.output_path = config.error_path = _output_path();
                judge(config,function(res){
                    var out = 'abs 1024';
                    res.result.should.eql(0);
                    out.should.eql( output_content(config.output_path))
                    done()
                });
            })
        })
    })

    describe('test_args',function(){
        it('args.c',function(done){
            var config = JSON.parse( JSON.stringify(inte_config));
            _compile_c( join(t_path,'args.c'),function(exe_path){
                config.exe_path = exe_path
                config['args'] = ['test','hehe','000'];
                config.input_path = '/dev/null'
                config.output_path = config.error_path = _output_path();
                judge(config,function(res){
                    var out = 'argv[0]: /tmp/args\nargv[1]: test\nargv[2]: hehe\nargv[3]: 000\n';
                    res.result.should.eql(0);
                    out.should.eql( output_content(config.output_path))
                    done()
                });
            })
        })
    })

    //describe('test_env',function(){
        //it('env.c',function(){
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config['exe_path'] = _compile_c( join(t_path,'env.c'));
            //config.input_path = '/dev/null'
            //config.output_path = config.error_path = _output_path();
            //config.env= ['env=judger_test','test=judger'];
            //var res= judgerSync(config);
            //var out = 'judger_test\njudger\n';
            //res.result.should.eql(0);
            //out.should.eql( output_content(config.output_path))
        //})
    //})

    //describe('test_real_time',function(){
        //it('sleep.c',function(){
            //this.timeout(15000);
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config['exe_path'] = _compile_c( join(t_path,'sleep.c'));
            //var res= judgerSync(config);
            //res.result.should.eql(_judger.REAL_TIME_LIMIT_EXCEEDED);
            //res.real_time.should.aboveOrEqual(config.max_real_time);
        //})
    //})

    //describe('test_cpu_time',function(){
        //it('while1.c',function(){
            //this.timeout(15000);
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config['exe_path'] = _compile_c( join(t_path,'while1.c'));
            //var res= judgerSync(config);
            //res.result.should.eql(_judger.CPU_TIME_LIMIT_EXCEEDED);
            //res.cpu_time.should.aboveOrEqual(config.max_cpu_time);
        //})
    //})

    //describe('test_memory1',function(){
        //it('memory1.c',function(){
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config['max_memory']=64*1024*1024;
            //config['exe_path'] = _compile_c( join(t_path,'memory1.c'));
            //var res= judgerSync(config);
            //// malloc succeeded
            //res.result.should.eql(_judger.MEMORY_LIMIT_EXCEEDED);
            //res.memory.should.above(80*1024*1024);
        //})
    //})

    //describe('test_memory2',function(){
        //it('memory2.c',function(){
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config['max_memory']=64*1024*1024;
            //config['exe_path'] = _compile_c( join(t_path,'memory2.c'));
            //var res= judgerSync(config);
            //// malloc failed, return 1
            //res.exit_code.should.eql(1);
            //// malloc failed, so it should use a little memory
            //res.memory.should.below(20*1024*1024);
            ////console.log(res.result.memory /1024 /1024)
            //res.result.should.eql(_judger.RUNTIME_ERROR);
        //})
    //})

    //describe('test_memory3',function(){
        //it('memory3.c',function(){
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config['max_memory']=512*1024*1024;
            //config['exe_path'] = _compile_c( join(t_path,'memory3.c'));
            //var res= judgerSync(config);
            //res.result.should.eql(_judger.SUCCESS);
            //res.memory.should.above(102400000 *4);
        //})
    //})

    //describe('test_re1',function(){
        //it('re1.c',function(){
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config['exe_path'] = _compile_c( join(t_path,'re1.c'));
            //var res= judgerSync(config);
            //res.exit_code.should.eql(25);
        //})
    //})

    //describe('test_re2',function(){
        //it('re2.c',function(){
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config['exe_path'] = _compile_c( join(t_path,'re2.c'));
            //var res= judgerSync(config);
            //res.result.should.eql(_judger.RUNTIME_ERROR);
            //res.signal.should.eql(11);
        //})
    //})

    //describe('test_child_proc_cpu_time_limit',function(){
        //it('child_proc_cpu_time_limit.c',function(){
            //this.timeout(15000);
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config['exe_path'] = _compile_c( join(t_path,'child_proc_cpu_time_limit.c'));
            //var res= judgerSync(config);
            //res.result.should.eql(_judger.CPU_TIME_LIMIT_EXCEEDED);
        //})
    //})

    //describe('test_child_proc_real_time_limit',function(){
        //it('child_proc_real_time_limit.c',function(){
            //this.timeout(15000);
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config['exe_path'] = _compile_c( join(t_path,'child_proc_real_time_limit.c'));
            //var res= judgerSync(config);
            //res.result.should.eql(_judger.REAL_TIME_LIMIT_EXCEEDED);
            //res.signal.should.eql(9);
        //})
    //})

    //describe('test_stdout_and_stderr',function(){
        //it('stdout_stderr.c',function(){
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config['exe_path'] = _compile_c( join(t_path,'stdout_stderr.c'));
            //config.output_path = config.error_path = _output_path();
            //var res= judgerSync(config);
            //res.result.should.eql(_judger.SUCCESS);
            //var out  ="stderr\n+++++++++++++++\n--------------\nstdout\n"
            //out.should.eql( output_content(config.output_path))
        //})
    //})

    //describe('test_uid_and_gid',function(){
        //it('uid_gid.c',function(){
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config['exe_path'] = _compile_c( join(t_path,'uid_gid.c'));
            //config.output_path = config.error_path = _output_path();
            //config["uid"] = 65534;
            //config["gid"] = 65534;
            //var res= judgerSync(config);
            //res.result.should.eql(_judger.SUCCESS);
            //var out = "uid=65534(nobody) gid=65534(nogroup) groups=65534(nogroup)\nuid 65534\ngid 65534\n"
            //out.should.eql( output_content(config.output_path))
        //})
    //})

    //describe('test_gcc_random',function(){
        //it('uid_gid.c',function(){
            //this.timeout(15000);
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config["exe_path"] = "/usr/bin/gcc"
            //config["args"] = [
                //join(t_path,'gcc_random.c'),
                //'-o',
                //join('/tmp','gcc_random')
            //];
            //var res= judgerSync(config);
            //res.result.should.eql(_judger.CPU_TIME_LIMIT_EXCEEDED);
            //res.cpu_time.should.aboveOrEqual(1950);
            //res.real_time.should.aboveOrEqual(1950);
        //})
    //})
    
    //describe('test_cpp_meta',function(){
        //it('cpp_meta.cpp',function(){
            //this.timeout(15000);
            //var config = JSON.parse( JSON.stringify(inte_config));
            //config["exe_path"] = "/usr/bin/g++"
            //config["max_memory"] = 1024 * 1024 * 1024
            //config["args"] = [
                //join(t_path,'cpp_meta.cpp'),
                //'-o',
                //join('/tmp','cpp_meta')
            //];
            //var res= judgerSync(config);
            //res.result.should.eql(_judger.CPU_TIME_LIMIT_EXCEEDED);
            //res.cpu_time.should.aboveOrEqual(1950);
            //res.real_time.should.aboveOrEqual(1950);
        //})
    //})
}


module.exports = integration;
