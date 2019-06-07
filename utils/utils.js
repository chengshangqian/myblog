/**
 * 辅助工具类
 */
const CryptoJS = require("crypto-js"),
http = require('http'),
https = require('https'),

/*全局变量*/
globalData = {
	DEFAULT_SECRET_KEY_PREFIX : 'myblog',
	DEFAULT_SECRET_KEY_SUFFIX : '~!@#$%^&*()',
	DEFAULT_SECRET_ENCODING : 'HMACSHA512',
	MYBLOG_API_SERVER_PROTOCOL:'http:',
	MYBLOG_API_SERVER_HOST:'127.0.0.1',
	MYBLOG_API_SERVER_PORT:3000,
	DEFAULT_API_SERVER_PROTOCOL:'https:',
	DEFAULT_API_SERVER_HOST:'127.0.0.1',
	DEFAULT_API_SERVER_PORT:80,//用80，不用443
	AMAP_WEB_API_SERVER_HOST:'restapi.amap.com',//高德IP定位服务
	AMAP_WEB_API_SERVER_PATH:'/v3/ip',
	AMAP_WEB_APP_KEY:'1b598724384133e7b5c11f7c8cad879a'
},

/* 加密信息 */
encode = (msg, encoding, secretKeyPrefix, secretKeySuffix) => {
	let _encoding = encoding || globalData.DEFAULT_SECRET_ENCODING;
	let _secretKeyPrefix = secretKeyPrefix
			|| globalData.DEFAULT_SECRET_KEY_PREFIX;
	let _secretKeySuffix = secretKeySuffix
			|| globalData.DEFAULT_SECRET_KEY_SUFFIX;

	let secretKey = _secretKeyPrefix + _secretKeySuffix;
	let result = '';
	switch (_encoding) {
	case 'HMACSHA512':
		result = CryptoJS.HmacSHA512(msg, secretKey);
		break;
	// TODO 更多加密算法
	default:
		break;
	}

	return result.toString();
},

/*判断是否为空对象: {} \ [] */
isEmptyObject = obj => {
	var name;
	for (name in obj) {
		return false;
	}
	return true;
},


/*获取本地标准当前日期时间*/
localeDate = () => {
	var now = new Date();
	now.setHours(now.getHours() + 8);//东8区北京时间
	return now;
},

/*获取UTC标准当前日期时间
 * 在前端显示的时候，使用dateFormat格式化为本地时间
 */
UTCDate = () => {
	return new Date();
},

/*格式化Date日期*/
dateFormat = (date, fmt) => {
    if (null == date || undefined == date) return '';
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
},

/*http请求*/
httpRequest = (opts,cb) => {
	var protocol = opts.protocol || globalData.MYBLOG_API_SERVER_PROTOCOL;
	var host = opts.host || globalData.MYBLOG_API_SERVER_HOST;
	var port = opts.port || globalData.MYBLOG_API_SERVER_PORT;
	
	var path = opts.path;
	var method = opts.method || 'GET';
	
	var data = opts.data || {};//method为POST/PUT时才会被发送
	
	var options = {
		protocol:protocol,
		host:host,
		port:port,
		path:path,
		method:method
	};

	if('POST' === method || 'PUT' === method){
		data = JSON.stringify(data);
		options.headers = {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(data)
		};
	}
	
	var result = null;
	
	const remoteReq = http.request(options, remoteRes => {
		remoteRes.setEncoding('utf8');
		var rawData = '';
		remoteRes.on('data', chunk => {
			rawData += chunk;
		});
		
		remoteRes.on('end', _ => {
			try {
				result = JSON.parse(rawData);
			}
			catch (error) {
				result = {status:'failure',err:'将结果JSON化出错 ===> ' + error};
				console.log(error);
			}
			cb(result);
		});
	});	
	
	remoteReq.on('error', error => {
		result = {status:'failure',err:'https请求发生错误： ===> ' + error};
		console.log(error);	
		cb(result);
	});	
		
	if('POST' === method || 'PUT' === method){
		remoteReq.write(data);		
	}
	
	remoteReq.end();
},

/*https请求*/
httpsRequest = (opts,cb) => {
	console.log('发起https请求 ===== > ');
	var protocol = opts.protocol || globalData.DEFAULT_API_SERVER_PROTOCOL;
	var host = opts.host || globalData.DEFAULT_API_SERVER_HOST;
	var port = opts.port || globalData.DEFAULT_API_SERVER_PORT;
	
	var path = opts.path;
	var method = opts.method || 'GET';
	
	var data = opts.data || {};//method为POST/PUT时才会被发送
	
	var options = {
		protocol:protocol,
		host:host,
		port:port,
		path:path,
		method:method
	};

	if('POST' === method || 'PUT' === method){
		data = JSON.stringify(data);
		options.headers = {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(data)
		};
	}
	
	var result = null;
	
	const remoteReq = https.request(options, remoteRes => {
		remoteRes.setEncoding('utf8');
		var rawData = '';
		remoteRes.on('data', chunk => {
			rawData += chunk;
		});
		
		remoteRes.on('end', _ => {
			try {
				result = JSON.parse(rawData);
			}
			catch (error) {
				result = {status:'failure',err:'将结果JSON化出错 ===> ' + error};
				console.log(error);
			}
			cb(result);
		});
	});	
	
	remoteReq.on('error', error => {
		result = {status:'failure',err:'https请求发生错误： ===> ' + error};
		console.log(error);	
		cb(result);
	});	
		
	if('POST' === method || 'PUT' === method){
		remoteReq.write(data);		
	}
	
	remoteReq.end();
},

/*去除两边空格*/
trim = text => {
	return text == null ?
		"" :
		( text + "" ).replace( /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "" );
}

module.exports = {
	globalData,
	encode,
	isEmptyObject,
	localeDate, 
	UTCDate,
	dateFormat,
	httpRequest,
	trim,
	httpsRequest
};