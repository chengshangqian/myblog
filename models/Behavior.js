/**
 * 行为MODEL
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const scm = Schema({
	article : { type: Schema.Types.ObjectId, ref: 'ARTICLE' },
	code : String,
	target : String,
	remoteAddress : String,
	position : {
		country: {type:String,default:'CN'},
		province: String,
		city: String,
		adcode: String,
		rectangle: String
	},
	happenedTime: Date,
	lastModifyTime: Date,
	createTime : { type: Date, default: Date.now }
}); 

module.exports = mongoose.model('BEHAVIOR', scm);