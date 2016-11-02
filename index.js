var ffi = require('ffi');
var ref = require('ref');
var Struct = require('ref-struct');

var checkArguments = require('./lib/checkArguments.js')


/* 指定结果的数据类型类型 */
var result = Struct({
    'cpu_time':'int',
    'real_time':'int',
    'memory':'long',
    'signal':'int',
    'exit_code':'int',
    'error':'int',
    'result':'int'
})
var resultPtr = ref.refType(result);

const _int = 4;
const _long = 8;
const _pointer = 8;
const argsArray = 100*_pointer;

const configStruct  = {
    'max_cpu_time':_int,
    'max_real_time':_int,
    'max_memory':_long,
    'path':_pointer,
    'in_file':_pointer,
    'out_file':_pointer,
    'err_file':_pointer,
    'args':argsArray,
    'env':argsArray,
    'use_sandbox':_int,
    'log_path':_pointer,
    'uid':_int,
    'gid':_int
}

function initStruct(config){
    var total_size = 4184;
    var myNewIn = new Buffer(total_size);
    for(i=0;i<total_size;i+=4)
        ref.set(myNewIn,0,0,'int');
    /* max_cpu_time */
    ref.set(myNewIn,0,config.max_cpu_time,'int');

    /* max_real_time  */
    ref.set(myNewIn,4,config.max_real_time,'int');
    
    /* max_memory */
    ref.set(myNewIn,8,config.max_memory,'long');

    /* max_process_number */
    ref.set(myNewIn,16,config.max_process_number,'long');

    /* max_output_size */
    ref.set(myNewIn,24,config.max_output_size,'long');

    /* exe_path*/
    var exe_path = ref.allocCString(config.exe_path,'ascii');
    ref.set(myNewIn,32,ref.address(exe_path),'long');

    /* input_path */
    var input_path= ref.allocCString(config.input_path,'ascii');
    ref.set(myNewIn,40,ref.address(input_path),'long');

    /* output_path*/
    var output_path= ref.allocCString(config.output_path,'ascii');
    ref.set(myNewIn,48,ref.address(output_path),'long');

    /* error_path*/
    var error_path= ref.allocCString(config.error_path,'ascii');
    ref.set(myNewIn,56,ref.address(error_path),'long');

    /* agrs */
    var tmp = 64;
    ref.set(myNewIn,tmp,ref.address(exe_path),'long');
    tmp+=8;

    for(var i =0;i<config.args.length;i++){
        var t_str = ref.allocCString(config.args[i],'ascii');
        ref.set(myNewIn,tmp,ref.address(t_str),'long');
        tmp+=_pointer;
    }
    ref.set(myNewIn,tmp,0,'long');


    /* env */
    tmp = 2112;
    for(var i =0;i<config.env.length;i++){
        var t_str = ref.allocCString(config.env[i],'ascii');
        ref.set(myNewIn,tmp,ref.address(t_str),'long');
        tmp+=_pointer;
    }
    ref.set(myNewIn,tmp,0,'long');

    /* log_path */
    var log_path = ref.allocCString(config.log_path,'ascii');
    ref.set(myNewIn,4160,ref.address(log_path),'long');


    /*seccomp_rule_name */
    var seccomp_rule_name= ref.allocCString(config.seccomp_rule_name,'ascii');
    ref.set(myNewIn,4168,ref.address(seccomp_rule_name),'long');

    /* uid */
    ref.set(myNewIn,4176,config.uid,'int');

    /* gid */
    ref.set(myNewIn,4180,config.gid,'int');
    return myNewIn;
}


/* 声明.so 文件 */
var libJudger = ffi.Library('/usr/lib/judger/libjudger',{
    'run':['int',['pointer',resultPtr]]
})

/* 导出的程序 */
function judger(userConfig,cb){

    var check=  checkArguments(userConfig)
    
    if (check.length){
        cb({
            state:"fail",
            result:check
        },null)
        return;
    }
    
    if(userConfig.max_memory <  16777216 && userConfig.max_memory != -1){
        userConfig.max_memoy += 16777216;
    }


    var myout = new result();
    var _config = initStruct(userConfig);
    
    libJudger.run.async(_config,myout.ref(),function(err,res){
        debugger;
        if(err)
            cb(err,null)
        else {
            var ans =  {
                state:'success',
                result:{
                    'cpu_time':myout.cpu_time,
                    'real_time':myout.real_time,
                    'memory':myout.memory,
                    'signal':myout.signal,
                    'exit_code':myout.exit_code,
                    'error':myout.error,
                    'result':myout.result
                }
            }
            cb(null,ans);
        }
    });
}


function judgerSync(userConfig){
    var check=  checkArguments(userConfig)
    
    if (check.length){
        return {
            state:"fail",
            result:check
        }
    }
    
    if(userConfig.max_memory <  16777216 && userConfig.max_memory != -1){
        userConfig.max_memoy += 16777216;
    }

    var myout = new result();
    //myout.cpu_time=0;
    //myout.real_time=0;
    //myout.memory=0;
    //myout.signal=0;
    //myout.exit_code=0;
    //myout.error=0;
    //myout.result=0;
    var _config = initStruct(userConfig);

    var res = libJudger.run(_config,myout.ref());
    var ans =  {
        state:'success',
        result:{
            'cpu_time':myout.cpu_time,
            'real_time':myout.real_time,
            'memory':myout.memory,
            'signal':myout.signal,
            'exit_code':myout.exit_code,
            'error':myout.error,
            'result':myout.result
        }
    }
    return ans;
}

const _judger = {
    SUCCESS:0,
    CPU_TIME_LIMIT_EXCEEDED:1,
    REAL_TIME_LIMIT_EXCEEDED:2,
    MEMORY_LIMIT_EXCEEDED:3,
    RUNTIME_ERROR:4,
    SYSTEM_ERROR:5
}
exports.judger = judger
exports.judgerSync = judgerSync;
exports._judger = _judger;



