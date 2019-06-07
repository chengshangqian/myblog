/**
 * 敏感词MODEL
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	name : String,
	enabled : { type: Boolean, default: false },
	lastModifyTime: Date,
	createTime : { type: Date, default: Date.now }
}); 

module.exports = mongoose.model('WORD', schema);