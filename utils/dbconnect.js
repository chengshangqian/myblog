/**
 * 返回数据库连接
 */
const mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/myblog',{ useNewUrlParser: true },error => {
	if(error){
		console.error('数据库连接失败(' + process.pid + ')：',error);
	}
	else{
		console.log(process.pid,'数据库连接成功(' + process.pid + ')...');
	}
});
module.exports = db;