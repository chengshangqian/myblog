/**
 * 文章MODEL
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const scm = Schema({
	category : { type: Schema.Types.ObjectId, ref: 'CATEGORY' },
	title : String,
	subtitle : String,
	summary : String,
	author : String,
	content : String,
	tags : [String],
	published: { type: Boolean, default: false },
	publish: Date,
	read: { type:Number, default: 0 },
	liked: { type:Number, default: 0 },
	shared: { type:Number, default: 0 },
	lastModifyTime: Date,
	createTime : { type: Date, default: Date.now }
}); 

module.exports = mongoose.model('ARTICLE', scm);