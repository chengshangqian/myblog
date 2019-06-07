/**
 * 标签MODEL
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	name : String,
	lastModifyTime: Date,
	createTime : { type: Date, default: Date.now }
}); 

module.exports = mongoose.model('TAG', schema);