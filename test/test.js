var should = require('should')

var integration = require('./test_integration.js');
var seccomp = require('./test_seccomp.js')

integration();
seccomp();

