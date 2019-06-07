/**
 * 应用设置
 */
var http = require('http');

/*开启CORS解决API跨域调用问题*/
const enableCORS = function(req, res, next) {
	console.log('--- 开启API跨域调用START --- ');	
	//允许所有站点请求，上产品机应该过滤一下
    res.header("Access-Control-Allow-Origin", "*");
    //如果配置仍然出问题,可以考虑增加更多的headers允许,
    //比如"Access-Control-Allow-Headers":"X-Requested-With,Content-Type,Accept,Origin"
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    //允许的请求方法
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    
    res.header("Content-Type", "application/json;charset=utf-8");
    if(req.method == 'OPTIONS') {
    	//允许的请求方法
    	//res.header("Access-Control-Allow-Methods", "PUT,POST,GET");
        //让options请求快速返回
        res.sendStatus(200);
    }
    else { 
        next(); 
    }
    console.log('--- 开启API跨域调用END --- ');	   
};

/*登录验证*/
const loginVerify = function(req, res, next) {
	console.log('--- 进入登录验证 --- ');	
	var sessionAccount = req.session.sessionAccount;
	console.log('sessionAccount => ',sessionAccount);
	
	//已登录
	if(sessionAccount){
		next();
	}
	else{
		//跳转到登录页面，重新登录
		var path = req.path;
		console.log('path => ',path);
		if('/login' === path){
				next();//进入登录页面
		}
		else{
			res.redirect('/admin/login');
		}		
	}
	
	console.log('--- 离开登录验证 --- ');    
};


module.exports = {enableCORS:enableCORS,loginVerify:loginVerify};
