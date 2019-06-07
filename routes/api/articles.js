/**
 * 文章API
 */
var express = require('express');
var router = express.Router();
var Article = require('../../models/Article'); 
var appUtil = require('../../utils/utils');

/*
 * 从数据库中查询符合条件的所有的文章 limit(Number) : 限制获取的数据条数，即查询条数 skip(10) : 忽略数据的条数，即起始数
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
    	var fields = form.keywdsFields || 'title,subtitle,summary';//默认匹配标题、副标题、摘要
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
    var category = form.category || '',	
	    title = form.title || '',
		subtitle = form.subtitle || '',
		summary = form.summary || '',
		author = form.author || '',
		content = form.content || '';
    if(category){
    	where.category = category;
    }
    if(title){    	
    	where.title = title;
    }
    if(subtitle){     	
    	where.subtitle = subtitle;
    }
    if(summary){     	
    	where.summary = summary;
    }
    if(author){     	
    	where.author = author;
    }
    if(content){     	
    	where.content = content;
    }
    var published = form.published || false;
    if(published){
    	//where.published = !!published;
    	if(true === published || 'true' === published){
    		where.published = true;
    	}    	
    	else if('false' === published){
    		where.published = false;
    	}
    }
    
    /*******  构造查询条件  *********/
    console.log('where ==> ',where);
    var query = Article.countDocuments(where);
	
	console.log('or ==> ',or);    
    if(keywds && or.length > 0){
    	console.log('构造关键字查询 ==> '); 
    	query.or(or);
    }
    
    /*******  发起分页查询  *********/
    query.then(count => {
    	var page = Number(form.page || 1);
        var limit = Number(form.limit || 15);
        
        // 计算总页数
    	var pages = Math.ceil(count / limit);
    	// 确保请求页数范围： 1 <= page <= pages
        // 请求页数小于1则返回首页处理，超出总页数pages返回最后一页处理
        page = Math.max(Math.min(page, pages), 1);   
        // 1 <= limit <= 20,默认10
        limit = Math.max(Math.min(limit, 20), 1);
        var skip = (page - 1) * limit;
        
        /*******  添加排序  *********/
        console.log('sort ==> ',sort);
        if(sort){
        	console.log('添加排序 ==> '); 
        	query.sort(sort);
        }
        
        /*******  发起结果集查询  *********/
        query.find().populate({path:'category',select:'_id name'}).limit(limit).skip(skip).then(dbArticles => {
    		var result = {status : 'success'};
    		if(!appUtil.isEmptyObject(dbArticles)){
    			result.articles = dbArticles;
    	        result.pagination = {
    	        	page:page,
    	        	pages:pages,
	        		limit:limit,
	        		count:count
    	        };
    		}
    		res.json(result);
    	}).catch(err => {
    		console.info('查询文章时出错：',err);
    		res.json({status : 'failure',err : err});
    	}); 
        
    }).catch(err => {
		console.info('查询文章总记录数时出错：',err);
		res.json({status : 'failure',err : err});
    });
    console.log('完成查询文章 => ');    
});

/* 根据ID查询文章 */
router.get('/:id', function(req, res, next) {
	var id = req.params.id || '';
	if(id){
		Article.findById(id).populate({path:'category',select:'_id name'}).exec(function(err, dbArticle) {
			var result = {status : 'success'};
			if (err || appUtil.isEmptyObject(dbArticle)){
				var _err = err || ('数据库中无此文章 => _id:'+id);
				console.info(_err);
				result.status = 'failure';
				result.err = _err;
			}
			else{
				result.article = dbArticle;
			}
			
			res.json(result);
		});		
	}
	else{
		res.json({status:'failure',err:'缺少id参数'});
	}
});


/* 新增文章 */
router.post('/', function(req, res, next) {
	var form = req.body;
	
	/**
	 * 验证必需参数
	 */
	var category = form.category || '';	
	var title = form.title || '';
	if(!category || !title){
		return res.json({status:'failure',err:'必需参数category|title为空.'});
	}
	
	var record = {};
	var p;
	for(p in Article.schema.obj){
		var v = form[p] || '';
		
		if(v) record[p] = v;
	}
	
	var now = appUtil.UTCDate();	
	
	// 同时发布
	if(record.published){
		record.publishTime = now;
	}
	
	/**
	 * 公共字段：创建时间/最后更新时间。
	 * 使用的是UTC标准时间（0时区），比北京时间慢8小时
	 * 1.前端显示时可以使用util的dateFormat格式化为本地时间正确显示
	 * 2.重载Date对象的toJSON方法
	 */
	record.createTime = now;
	record.lastModifyTime = now
	
	/**
	 * 保存
	 */
	Article.create(record).then(doc => {
		res.json({status : 'success',article:doc});
	}).catch(err => {
		console.info('新增行为失败：',err);
		res.json({status : 'failure',err:err});
	});
});

/* 根据ID更新文章 */
router.put('/:id', function(req, res, next) {
	var id = req.params.id || '';
	
	/**
	 * 验证必须参数
	 */
	if(!id){
		return res.json({status:'failure',err:'缺少id参数'});
	}
	
	var now = appUtil.UTCDate();//修改时间/发布时间
	
	var record = {};
	var form = req.body;
	var p;
	for(p in Article.schema.obj){
		// 不允许修改创建时间、发布时间
		if('createTime' === p || 'publishTime' === p) continue;
		
		//处理Boolean类型：未传入参数的情况
		if(p === 'published' && (undefined === form[p] || null === form[p] || '' === form[p]))
			continue;
		
		var v = form[p] || '';
		
		//同时处理Boolean类型赋值
		if(v || p === 'published') {
			
			if(p === 'published'){
				// 转换为真正的boolean值
				v = !!v;
				
				// 更新发布时间
				if(v) record['publishTime'] = now;
			}
			
			//点赞、分享、阅读数自增或自减
			if(p === 'liked' || p === 'shared' || p === 'read'){
				var inc = {};
				inc[p] = v;
				v = inc ;
				p = '$inc'
			}
			
			record[p] = v;
		}
	}	
	
	// 无更新内容，失败返回
	if(appUtil.isEmptyObject(record)){
		return res.json({status:'failure',err:'缺少更新内容'});
	}
	
	// 最后一次修改时间
	record.lastModifyTime = now;
	
	/**
	 * 更新：返回更新后的记录
	 */
	Article.findByIdAndUpdate(id, record, {new:true}).then(doc => {
		res.json({status : 'success',article : doc});
	}).catch(err => {
		console.info('更新文章失败(id => ' + id + ',record => ' + record + ')：',err);
		res.json({status : 'failure',err : err});
	});
});

/* 根据ID删除文章 */
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
	Article.deleteOne({_id:id}).then(result => {
		result.status = 'success';

		if(1 !== result.ok){
			result.status = 'failure';
			result.err = '未知的数据库错误';
			console.info('删除文章发生错误(id => ' + id + ')：',result);
		}
		
		res.json(result);
	}).catch(err => {
		console.info('删除文章失败(id => ' + id + ')：',err);
		res.json({status:'failure',err : err});
	});
});

module.exports = router;
