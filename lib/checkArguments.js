/* 检查 参数的模块 */

function checkArguments(args){
    if(!args)
        return 'need config project'
    if(args.constructor != Object) 
        return 'args must be Object'
    
    if( Object.prototype.toString.call(args.args) !== '[object Array]')
        return 'args must be a list'

    for(var i =0;i<args.args.length;i++){
        if( Object.prototype.toString.call(args.args[i]) !== '[object String]' )
            return 'args item must be a string'
    }

    if( Object.prototype.toString.call(args.env) !== '[object Array]')
        return 'env must be a list'

    for(var i =0;i<args.env.length;i++){
        if( Object.prototype.toString.call(args.env[i]) !== '[object String]' )
            return 'env item must be a string'
    }



    return ''
}

module.exports = checkArguments;
