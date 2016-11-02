# 说明

[QingdaoU_judger](https://github.com/QindaoU/Judger) 的node 接口,基于node-ffi

只能用于x64的linux,现在只在ubuntu 16.04 x64 通过测试


*****引用**

```
var judgerSync  = require('judge_node').judgerSync
var judger  = require('judge_node').judger
```

# 测试

 ```sh
cd test/
npm i
cd ..
sudo mocha
 ```
