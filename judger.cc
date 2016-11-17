#include <node.h>
#include <v8.h>
#include <cstdio>
#include <string>
#include <cstring>
#include <iostream>
#include <dlfcn.h>




struct config {
    int max_cpu_time;
    int max_real_time;
    long max_memory;
    int max_process_number;
    long max_output_size;
    char *exe_path;
    char *input_path;
    char *output_path;
    char *error_path;
    char *args[256];
    char *env[256];
    char *log_path;
    char *seccomp_rule_name;
    uid_t uid;
    gid_t gid;
};


struct result {
    int cpu_time;
    int real_time;
    long memory;
    int signal;
    int exit_code;
    int error;
    int result;
};

typedef struct config * pconfig;
typedef struct result * presult;
typedef char * pchar;
typedef void (*run_t)(pconfig,presult);


using v8::Local;
using v8::Array;
using v8::Object;
using v8::Number;


pchar alloChar(int size,std::string str){
      char *_p = (pchar)malloc(size);
      memset(_p,0,200*sizeof(char));
      int i;
      for(i =0 ;i<str.size();i++){
          _p[i] = (char)str[i];
      }
    return _p;
}

void PrintConfig(struct config * con){
    printf("\n\n-------------\n\n");
    printf("max_cpu_time %d\n",con->max_cpu_time);
    printf("max_real_time%d\n",con->max_real_time);
    printf("max_memory %ld\n",con->max_memory);
    printf("max_process_number %d\n",con->max_process_number);
    printf("max_output_size %ld\n",con->max_output_size);
    printf("exe_path %s\n",con->exe_path);
    printf("input_path %s\n",con->input_path);
    printf("output_path %s\n",con->output_path);
    printf("error_path %s\n",con->error_path);

    printf("\n");
    int i =0;
    while(con->args[i] != NULL){
        printf("args[%d]: %s\n",i,con->args[i]);
        i++;
    }

    printf("\n");
    i =0;
    while(con->env[i] != NULL){
        printf("env[%d]: %s\n",i,con->env[i]);
        i++;
    }

    printf("log_path %s\n",con->log_path);
    printf("seccomp_rule_name %s\n",con->seccomp_rule_name);
    printf("uid %d\n",con->uid);
    printf("gid %d\n",con->gid);

    printf("\n\n-------------\n\n");
}

void PrintResult(presult res){
    
    printf("\n\n-------------\n\n");
    printf("cpu_time: %d\n",res->cpu_time);
    printf("real_time: %d\n",res->real_time);
    printf("memory: %lf\n",(double)res->memory/(1024*1024));
    printf("signal: %d\n",res->signal);
    printf("result: %d\n",res->result);
    printf("error: %d\n",res->error);
    
    printf("\n\n-------------\n\n");
}

void freeConfig(pconfig con){
    int i =0;
    while(con->args[i] != NULL){
        free(con->args[i]);
        i++;
    }

    i =0;
    while(con->env[i] != NULL){
        free(con->env[i]);
        i++;
    }
    free(con);
}

void freeResult(presult res){
    free(res);
}

void Method(const v8::FunctionCallbackInfo<v8::Value>& args) {

    pconfig _config = (pconfig)malloc(sizeof(struct config));
    presult _result = (presult)malloc(sizeof(struct result));
    memset(_config,0,sizeof(struct config));
    memset(_result,0,sizeof(struct result));
    

  v8::Isolate* isolate = args.GetIsolate();
  v8::HandleScope scope(isolate);
  //printf("args: %d\n",args.Length());

  if(args[0]->IsNumber()){
      int max_cpu_time = args[0]->NumberValue();
      _config->max_cpu_time = max_cpu_time;
  }

  if(args[1]->IsNumber()){
      int max_real_time= args[1]->NumberValue();
      _config->max_real_time = max_real_time;
  }

  if(args[2]->IsNumber()){
      long max_memory= args[2]->NumberValue();
      _config->max_memory= max_memory;
  }

  if(args[3]->IsNumber()){
      int max_process_number= args[3]->NumberValue();
      _config->max_process_number= max_process_number;
  }

  if(args[4]->IsNumber()){
      int max_output_size= args[4]->NumberValue();
      _config->max_output_size = max_output_size;
  }

  if(args[5]->IsString()){
      //printf("yes, args[0] is string\n");
      v8::String::Utf8Value str(args[5]->ToString());
      std::string s(*str);
    _config->exe_path = alloChar(200,s);
  }

  if(args[6]->IsString()){
      //printf("yes, args[0] is string\n");
      v8::String::Utf8Value str(args[6]->ToString());
      std::string s(*str);
    _config->input_path= alloChar(200,s);
  }

  if(args[7]->IsString()){
      //printf("yes, args[0] is string\n");
      v8::String::Utf8Value str(args[7]->ToString());
      std::string s(*str);
    _config->output_path= alloChar(200,s);
  }
  if(args[8]->IsString()){
      //printf("yes, args[0] is string\n");
      v8::String::Utf8Value str(args[8]->ToString());
      std::string s(*str);
    _config->error_path= alloChar(200,s);
  }

  //printf("%s\n",_config->exe_path);
  //printf("%s\n",_config->input_path);
  //printf("%s\n",_config->output_path);
  //printf("%s\n",_config->error_path);

  if(args[9]->IsArray()){
     //v8::Local<v8::Array>  = args[1]->ToArray();
     v8::Local<v8::Array> input = v8::Local<v8::Array>::Cast(args[9]);
     _config->args[0]= _config->exe_path;
     int i;
     for(i = 0;i<input->Length();i++){
         v8::String::Utf8Value str(input->Get(i)->ToString());
         std::string s(*str);
         _config->args[i+1]= alloChar(200,s);
     }
  }
  
  if(args[10]->IsArray()){
     //v8::Local<v8::Array>  = args[1]->ToArray();
     v8::Local<v8::Array> input = v8::Local<v8::Array>::Cast(args[10]);
     int i;
     for(i = 0;i<input->Length();i++){
         v8::String::Utf8Value str(input->Get(i)->ToString());
         std::string s(*str);
         _config->env[i]= alloChar(200,s);
     }
  }

  if(args[11]->IsString()){
      v8::String::Utf8Value str(args[11]->ToString());
      std::string s(*str);
    _config->log_path= alloChar(200,s);
  }

  if(args[12]->IsString()){
      v8::String::Utf8Value str(args[12]->ToString());
      std::string s(*str);
    _config->seccomp_rule_name= alloChar(200,s);
  }
  if(args[13]->IsNumber()){
      int uid= args[13]->NumberValue();
      _config->uid = uid;
  }

  if(args[14]->IsNumber()){
      int gid= args[14]->NumberValue();
      _config->gid = gid;
  }

  //调用
  //PrintConfig(_config);

  void * libm_handle = dlopen("/usr/lib/judger/libjudger.so",RTLD_LAZY);
  if( !libm_handle){
      printf("open lib error: %s\n",dlerror());
  }

   run_t  run =(run_t)dlsym(libm_handle,"run");
   run(_config,_result);
    //printf("_memory: %lf\n",(double)_result->memory/1024/1204);
    //PrintResult(_result);

  Local<Number> cpu_time = Number::New(isolate,_result->cpu_time);
  Local<Number> real_time = Number::New(isolate,_result->real_time);
  Local<Number> signal = Number::New(isolate,_result->signal);
  Local<Number> exit_code= Number::New(isolate,_result->exit_code);
  Local<Number> result= Number::New(isolate,_result->result);
  Local<Number> error= Number::New(isolate,_result->error);
  Local<Number> memory= Number::New(isolate,_result->memory);

  Local<Object> obj= Object::New(isolate);

  obj->Set(v8::String::NewFromUtf8(isolate, "cpu_time"),cpu_time);
  obj->Set(v8::String::NewFromUtf8(isolate, "real_time"),real_time);
  obj->Set(v8::String::NewFromUtf8(isolate, "memory"),memory);
  obj->Set(v8::String::NewFromUtf8(isolate, "signal"),signal);
  obj->Set(v8::String::NewFromUtf8(isolate, "exit_code"),exit_code);
  obj->Set(v8::String::NewFromUtf8(isolate, "result"),result);
  obj->Set(v8::String::NewFromUtf8(isolate, "error"),error);

  freeResult(_result);
  freeConfig(_config);
  args.GetReturnValue().Set(obj);
}

void init(v8::Local<v8::Object> exports) {
  NODE_SET_METHOD(exports, "judger", Method);
}

NODE_MODULE(binding, init);
