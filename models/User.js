/**
 * 用户MODEL
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	account : String,
	passwd : String,
	nickname : String,
	userType : {type:String,default:'3'},//1.超级管理员,2.博客管理员，3.一般用户	
	realname : String,
	mobile : String,
	email : String,
	wx : String,
	weibo : String,
	photo : {type:String,default:'/admin/images/default-photo.png'},
	disabled : { type: Boolean, default: false },
	lastModifyTime : Date,
	createTime : { type: Date, default: Date.now }
}); 

module.exports = mongoose.model('USER', schema);