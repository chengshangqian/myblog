/**
 * 用户API
 */
var express = require('express');
var router = express.Router();
var User = require('../../models/User'); 
var appUtil = require('../../utils/utils');

/**
 * 从数据库中查询符合条件的所有的用户数据
 * req.query:form{
 *   keywds：模糊查询的关键字，比如要查询昵称或真实姓名为Jhon的用户，keywds = 'Jhon'; 不分大小写
 *   keywdsFields：模糊查询匹配字段，多个字段使用逗号隔开，如要查询昵称或真实姓名 : keywdsFields = 'nickname,realname'
 *   sort：排序，使用字符串格式，如'field1 -field2' ,注意两个字段之间用空格隔开
 *   page：页数，分页参数
 *   limit：限制获取的数据条数，即查询条数，分页参数
 *   ...：用户模型中的字段（此处省略）
 * }
 * @param req
 * @param res
 * @param next
 * @returns
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
    	var fields = form.keywdsFields || 'account,nickname,realname';
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
    var account = form.account || '',
		userType = form.userType || '',
		realname = form.realname || '',
		nickname = form.nickname || '',
		mobile = form.mobile || '',
		email = form.email || '',
		wx = form.wx || '',
		weibo = form.weibo || '';
    if(account){
    	where.account = account;
    }    
    if(userType){
    	where.userType = userType;
    }    
    if(realname){
    	where.realname = realname;
    }    
    if(nickname){
    	where.nickname = nickname;
    }    
    if(mobile){
    	where.mobile = mobile;
    }    
    if(email){
    	where.email = email;
    }    
    if(wx){
    	where.wx = wx;
    }    
    if(weibo){
    	where.weibo = weibo;
    }    
    var disabled = form.disabled || false;
    if(disabled){
    	//where.disabled = !!disabled;
    	if(true === disabled || 'true' === disabled){
    		where.disabled = true;
    	}    	
    	else if('false' === disabled){
    		where.disabled = false;
    	}
    }
    
    /*******  构造查询条件  *********/
    console.log('where ==> ',where);
    var query = User.countDocuments(where);
	
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
        query.find().limit(limit).skip(skip).then(dbUsers => {
    		var result = {status : 'success'};
    		if(!appUtil.isEmptyObject(dbUsers)){
    			result.users = dbUsers;
    	        result.pagination = {
    	        	page:page,
    	        	pages:pages,
	        		limit:limit,
	        		count:count
    	        };
    		}
    		res.json(result);
    	}).catch(err => {
    		console.info('查询用户时出错：',err);
    		res.json({status : 'failure',err : err});
    	}); 
        
    }).catch(err => {
		console.info('查询用户总记录数时出错：',err);
		res.json({status : 'failure',err : err});
    });
});

/**
 * 根据ID查询记录
 * @param req
 * @param res
 * @param next
 * @returns
 */
router.get('/:id', function(req, res, next) {
	var id = req.params.id || '';
	if(id){
		User.findById(id,function(err, dbUser) {
			var result = {status : 'success'};
			if (err || appUtil.isEmptyObject(dbUser)){
				var _err = err || ('数据库中无此用户 => _id:'+id);
				console.info(_err);
				result.status = 'failure';
				result.err = _err;
			}
			else{
				result.user = dbUser;
			}
			
			res.json(result);
		});
	}
	else{
		res.json({status:'failure',err:'缺少id参数'});
	}
});

/**
 * 根据用户账号查询用户信息：用于登录验证或者判断是否存在
 * @param req
 * @param res
 * @param next
 * @returns
 */
router.get('/query/:account', function(req, res, next) {
	var account = req.params.account || '';
	if(account){
		User.findOne({account:account},function(err, dbUser) {
			var result = {status : 'success'};
			if (err || appUtil.isEmptyObject(dbUser)){
				var _err = err || ('数据库中无此用户 => account: '+account);
				console.info(_err);
				result.status = 'failure';
				result.err = _err;
			}
			else{
				result.user = dbUser;
			}
			
			res.json(result);
		});
	}
	else{
		res.json({status:'failure',err:'缺少account参数'});
	}
});

/**
 * 新增记录
 * @param req
 * @param res
 * @param next
 * @returns
 */
router.post('/', function(req, res, next) {
	var form = req.body;
	
	/**
	 * 验证必需参数
	 */
	var account = form.account || '';
	var passwd = form.passwd || '';	
	var nickname = form.nickname || '';	
	if(!account || !passwd || !nickname){
		return res.json({status:'failure', err:'必需参数account|passwd|nickname为空.'});
	}
	
	/**
	 * 初始化需要保存的用户对象
	 */
	var record = {};
	var p;
	for(p in User.schema.obj){
		var v = form[p] || '';
		if(v) record[p] = v;
	}
	
	/**
	 * 特殊字段：加密密码
	 */
	record.passwd = appUtil.encode(passwd,appUtil.globalData.DEFAULT_SECRET_ENCODING,account);
	
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
	User.create(record).then(doc => {
		res.json({status : 'success',user:doc});
	}).catch(err => {
		console.info('新增用户失败：',err);
		res.json({status : 'failure',err:err});
	});
});

/**
 * 根据ID更新记录
 * @param req
 * @param res
 * @param next
 * @returns
 */
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
	for(p in User.schema.obj){
		// 不允许修改创建时间
		if('createTime' === p) continue;
		
		//处理Boolean类型：未传入参数的情况
		if(p === 'disabled' && (undefined === form[p] || null === form[p] || '' === form[p]))
			continue;	
		
		var v = form[p] || '';
		
		//同时处理Boolean类型赋值
		if(v || p === 'disabled') {
			//转换为boolean值
			if(p === 'disabled') v = !!v;
			
			record[p] = v;
		}
	}
	
	// 修改密码
	var passwd = form.passwd;
	if(passwd){
		var account = form.account || '';
		if(!account){
			return res.json({status:'failure',err:'修改密码缺少account参数'});
		}
		record.passwd = appUtil.encode(passwd,appUtil.globalData.DEFAULT_SECRET_ENCODING,account);			
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
	User.findByIdAndUpdate(id, record, {new:true}).then(doc => {
		res.json({status : 'success',user : doc});
	}).catch(err => {
		console.info('更新用户失败(id => ' + id + ',record => ' + record + ')：',err);
		res.json({status : 'failure',err : err});
	});
});

/**
 * 根据ID删除记录
 * @param req
 * @param res
 * @param next
 * @returns
 */
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
	User.deleteOne({_id:id}).then(result => {
		result.status = 'success';

		if(1 !== result.ok){
			result.status = 'failure';
			result.err = '未知的数据库错误';
			console.info('删除用户发生错误(id => ' + id + ')：',result);
		}
		
		res.json(result);
	}).catch(err => {
		console.info('删除用户失败(id => ' + id + ')：',err);
		res.json({status:'failure',err : err});
	});
});

module.exports = router;
