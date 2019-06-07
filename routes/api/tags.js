/**
 * 标签API
 */
var express = require('express');
var router = express.Router();
var Tag = require('../../models/Tag'); 
var appUtil = require('../../utils/utils');

/*
 * 从数据库中查询符合条件的所有的标签 limit(Number) : 限制获取的数据条数，即查询条数 skip(10) : 忽略数据的条数，即起始数
 */	
router.get('/', function(req, res, next) {
	var form = req.query;
    /**
	 * 关键字模糊查询
	 */
    var keywds = form.keywds || '';
	console.log('keywds => ' , keywds);
    var or = [];
    if(keywds){
    	var fields = form.keywdsFields || 'name';
    	console.log('fields => ' , fields);
    	if(fields){
    		var fieldArr = fields.split(',');
    		console.log('fieldArr => ' , fieldArr);
            for(var i = 0; i < fieldArr.length; i++){ 
            	var field = {};
            	var p = fieldArr[i];        	
            	field[p] = new RegExp(keywds, 'ig');
            	or.push(field);
            }
    	}
    }
    
    /**
     * 排序
     * 升序：asc|ascending|1
     * 降序：desc|descending|-1
     * 例如：以下4种效果等同
     * 1.{ field1: 'asc', field2: 'desc' }、
     * 2.{ field1: 'ascending', field2: 'descending' }
     * 3.{ field1: 1, field2: -1 }
     * 4.'field1 -field2' ,注意两个字段之间用空格隔开
     */
    var sort = form.sort || '';
    
    /**
     * 过滤条件
     * TODO 根据项目需要自行定制更多过滤条件
     */
    var where = {};
    var name = form.name || '';
    if(name){
    	where.name = name;
    }    
    
    /*******  构造查询条件  *********/
    console.log('where ==> ',where);
    var query = Tag.countDocuments(where);
	console.log('or ==> ',or);    
    if(keywds && or.length > 0){
    	console.log('构造关键字查询 ==> '); 
    	query.or(or);
    }
    
    /*******  发起分页查询  *********/    
    query.then(count => {
    	var page = Number(form.page || 1);
        var limit = Number(form.limit || 15);
        console.log('page => ',page);
        console.log('limit => ',limit);
        console.log('count => ',count);
        // 计算总页数
    	var pages = Math.ceil(count / limit);
        console.log('pages => ',pages);
    	// 确保请求页数范围： 1 <= page <= pages
        // 请求页数小于1则返回首页处理，超出总页数pages返回最后一页处理
        page = Math.max(Math.min(page, pages), 1);   
        console.log('page => ',page);
        
        // 1 <= limit <= 20,默认10
        limit = Math.max(Math.min(limit, 20), 1);
        console.log('limit => ',limit);
        var skip = (page - 1) * limit;
        console.log('skip => ',skip);
        
        /*******  添加排序  *********/
        console.log('sort ==> ',sort);
        if(sort){
        	console.log('添加排序 ==> '); 
        	query.sort(sort);
        }
        
        /*******  发起结果集查询  *********/
        query.find().limit(limit).skip(skip).then(dbTags => {
    		var result = {status : 'success'};
    		if(!appUtil.isEmptyObject(dbTags)){
    			result.tags = dbTags;
    	        result.pagination = {
    	        	page:page,
    	        	pages:pages,
	        		limit:limit,
	        		count:count
    	        };
    		}
    		res.json(result);
    	}).catch(err => {
    		console.info('查询标签时出错：',err);
    		res.json({status : 'failure',err : err});
    	}); 
        
    }).catch(err => {
		console.info('查询标签总记录数时出错：',err);
		res.json({status : 'failure',err : err});
    });
});

/* 根据ID查询标签 */
router.get('/:id', function(req, res, next) {
	var id = req.params.id || '';
	if(id){
		Tag.findById(id,function(err, dbTag) {
			var result = {status : 'success'};
			if (err || appUtil.isEmptyObject(dbTag)){
				var _err = err || ('数据库中无此标签 => _id:'+id);
				console.info(_err);
				result.status = 'failure';
				result.err = _err;
			}
			else{
				result.tag = dbTag;
			}
			
			res.json(result);
		});
	}
	else{
		res.json({status:'failure',err:'缺少id参数'});
	}
});


/* 新增标签 */
router.post('/', function(req, res, next) {
	var form = req.body;
	
	/**
	 * 验证必需参数
	 */
	var name = form.name || '';
	if(!name){
		return res.json({status:'failure',err:'必需参数name为空.'});
	}
	
	var record = {};
	var p;
	for(p in Tag.schema.obj){
		var v = form[p] || '';
		// TODO 是否有保存字符串为空值的情况
		if(v) record[p] = v;
	}
	
	/**
	 * 公共字段：创建时间/最后更新时间。
	 * 使用的是UTC标准时间（0时区），比北京时间慢8小时
	 * 1.前端显示时可以使用util的dateFormat格式化为本地时间正确显示
	 * 2.重载Date对象的toJSON方法
	 */
	var now = appUtil.UTCDate();
	record.createTime = now;
	record.lastModifyTime = now
	
	/**
	 * 保存
	 */
	Tag.create(record).then(doc => {
		res.json({status : 'success',tag:doc});
	}).catch(err => {
		console.info('新增标签失败：',err);
		res.json({status : 'failure',err:err});
	});
});

/* 根据ID更新标签 */
router.put('/:id', function(req, res, next) {
	var id = req.params.id || '';
	
	/**
	 * 验证必须参数
	 */
	if(!id){
		return res.json({status:'failure',err:'缺少id参数'});
	}
	
	var record = {};
	var form = req.body;
	var p;
	for(p in Tag.schema.obj){
		// 不允许修改创建时间
		if('createTime' === p) continue;
		
		var v = form[p] || '';
		
		if(v) record[p] = v;
	}	
	
	// 无更新内容，失败返回
	if(appUtil.isEmptyObject(record)){
		return res.json({status:'failure',err:'缺少更新内容'});
	}
	
	// 最后一次修改时间
	record.lastModifyTime = appUtil.UTCDate();
	
	/**
	 * 更新：返回更新后的记录
	 */
	Tag.findByIdAndUpdate(id, record, {new:true}).then(doc => {
		res.json({status : 'success',tag : doc});
	}).catch(err => {
		console.info('更新标签失败(id => ' + id + ',record => ' + record + ')：',err);
		res.json({status : 'failure',err : err});
	});	
});

/* 根据ID删除标签 */
router.delete('/:id', function(req, res, next) {
	var id = req.params.id || '';

	/**
	 * 验证必须参数
	 */
	if(!id){
		return res.json({status:'failure',err:'缺少id参数'});
	}
	
	/**
	 * 删除
	 */	
	Tag.deleteOne({_id:id}).then(result => {
		result.status = 'success';

		if(1 !== result.ok){
			result.status = 'failure';
			result.err = '未知的数据库错误';
			console.info('删除标签发生错误(id => ' + id + ')：',result);
		}
		
		res.json(result);
	}).catch(err => {
		console.info('删除标签失败(id => ' + id + ')：',err);
		res.json({status:'failure',err : err});
	});	
});

module.exports = router;
