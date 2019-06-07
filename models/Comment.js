/**
 * 评论MODEL
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const scm = Schema({
	article : { type: Schema.Types.ObjectId, ref: 'ARTICLE' },
	nickname : String,
	email : String,
	content : String,
	remoteAddress : String,
	audited : { type: Boolean, default: false },
	lastModifyTime: Date,
	createTime : { type: Date, default: Date.now }
}); 

module.exports = mongoose.model('COMMENT', scm);