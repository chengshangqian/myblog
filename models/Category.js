/**
 * 栏目MODEL
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	name : String,
	shortName : String,
	lastModifyTime: Date,
	createTime : { type: Date, default: Date.now }
}); 

module.exports = mongoose.model('CATEGORY', schema);