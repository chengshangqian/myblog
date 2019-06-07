var express = require('express');
var router = express.Router();
var appUtil = require('../../utils/utils');
const querystring = require('querystring');
const uuid = require('uuid');
var multer  = require('multer');
//var upload = multer({ dest: 'uploads/user/' });
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '../resources/uploads/user/');
	},
	filename: function (req, file, cb) {
		var originalname = file.originalname;
		var startIndex = originalname.lastIndexOf(".");
		var endIndex = originalname.length;
		var suffix = originalname.substring(startIndex,endIndex);//后缀名
		cb(null, file.fieldname + '-' + uuid.v1() + suffix);
	}	
});

var upload = multer({ storage: storage });

/* 首页 */
router.get('/', function(req, res, next) {
	//阅读量前十排行榜文章
	//访客分布
	
	res.render('admin/index');
});

/* --------------------------------- 栏目管理 --------------------------------- */
router.get('/categories', function(req, res, next) {
	var keywds = req.query.keywds || '';
	var data = {'limit':req.query.limit || 15,'page':req.query.page || 1};
	if(keywds){
		data.keywds = keywds;
	}
	
	var opts = {
		path:'/api/categories?' + querystring.stringify(data),
		method:'GET'
	};
	
	appUtil.httpRequest(opts,result => {
		result.keywds = keywds;
		res.render('admin/category/index', result);
	});	
});

/* 进入新增或修改栏目页 */
router.get('/categories/update', function(req, res, next) {
	var id = req.query.id || '';
	console.log('id ==> ',id);
	if(id){
  	  var opts = {
			path:'/api/categories/' + id,
			method : 'GET'
		};
	
	  appUtil.httpRequest(opts,result => {
		  res.render('admin/category/update', result);
	  });
	}
	else{
		res.render('admin/category/update',{category:{}});
	}	
});

/* 新增或修改栏目 */
router.post('/categories/update', function(req, res, next) {
	var id = req.body.id || '';
	console.log('id ==> ',id);
	
	var data = { name : req.body.name, shortName : req.body.shortName};
	
	var opts = {
			path:'/api/categories/' + (id ? id : ''),
			data:data,
			method : id ? 'PUT' : 'POST'
		};
	
	appUtil.httpRequest(opts,result => {
		var idParam = '';
		if('success' === result.status){
			idParam = '&id='+result.category._id;
		}
		res.redirect('/admin/categories/update?status='+result.status+idParam);
	});		
});

/* --------------------------------- 文章管理 --------------------------------- */
router.get('/articles', function(req, res, next) {
	var keywds = req.query.keywds || '';
	var data = {'limit':req.query.limit || 15,'page':req.query.page || 1};
	if(keywds){
		data.keywds = keywds;
		data.keywdsFields = 'title';
	}
	
	//排序
	data.sort = '-lastModifyTime';	
	
	//TODO 更多查询条件
	//代码
	
	var opts = {
		path:'/api/articles?' + querystring.stringify(data),
		method:'GET'
	};
	
	appUtil.httpRequest(opts,result => {
		result.keywds = keywds;
		res.render('admin/article/index', result);
	});	
});

/* 进入新增或修改文章页 */
router.get('/articles/update', function(req, res, next) {
	var id = req.query.id || '';
	console.log('id ==> ',id);
	var data = {'limit':20,'page':1};//最多20个栏目和标签
	var categories = [];
	var tags = [];
	
	//查询栏目
	var opts = {
		path:'/api/categories?' + querystring.stringify(data),
		method:'GET'
	};
		
	appUtil.httpRequest(opts,rst => {
		categories = rst.categories;
		
		//查询标签
		opts = {
			path:'/api/tags?' + querystring.stringify(data),
			method:'GET'
		};
		
		appUtil.httpRequest(opts,rest => {
			tags = rest.tags;
			if(id){
				opts = {
					path:'/api/articles/' + id,
					method : 'GET'
				};
					
				appUtil.httpRequest(opts,result => {
					result.categories = categories;
					result.tags = tags;
					
					//保存成功
					var optStatus = req.query.status || '';
					if(optStatus){
						result.optStatus = optStatus;
					}
					
					res.render('admin/article/update', result);
				});
			}
			else{
				res.render('admin/article/update',{categories:categories,tags:tags,article:{}});
			}
		});
	});		
});

/* 新增或修改文章 */
router.post('/articles/update', function(req, res, next) {
	var id = req.body.id || '';
	console.log('id ==> ',id);
	
	var data = {
		category : req.body.category,
		title : req.body.title,
		subtitle : req.body.subtitle,
		summary:req.body.summary,
		tags:req.body.tags,
		published:!!req.body.published,
		content:req.body.content
	};
	
	var opts = {
			path:'/api/articles/' + (id ? id : ''),
			data:data,
			method : id ? 'PUT' : 'POST'
		};
	
	appUtil.httpRequest(opts,result => {
		var idParam = '';
		if('success' === result.status){
			idParam = '&id='+result.article._id;
		}
		res.redirect('/admin/articles/update?status='+result.status+idParam);
	});		
});

/* --------------------------------- 标签管理 --------------------------------- */
router.get('/tags', function(req, res, next) {
	var keywds = req.query.keywds || '';
	var data = {'limit':req.query.limit || 15,'page':req.query.page || 1};
	if(keywds){
		data.keywds = keywds;
	}
	
	var opts = {
			path:'/api/tags?' + querystring.stringify(data),
			method:'GET'
	};
	
	appUtil.httpRequest(opts,result => {
		result.keywds = keywds;
		res.render('admin/tag/index', result);
	});	
});

/* 进入新增或修改标签页面 */
router.get('/tags/update', function(req, res, next) {
	var id = req.query.id || '';
	console.log('id ==> ',id);
	if(id){
		var opts = {
				path:'/api/tags/' + id,
				method : 'GET'
		};
		
		appUtil.httpRequest(opts,result => {
			res.render('admin/tag/update', result);
		});
	}
	else{
		res.render('admin/tag/update',{tag:{}});
	}	
});

/* 新增或修改标签 */
router.post('/tags/update', function(req, res, next) {
	var id = req.body.id || '';
	console.log('id ==> ',id);
	
	var data = { name : req.body.name};
	
	var opts = {
			path:'/api/tags/' + (id ? id : ''),
			data:data,
			method : id ? 'PUT' : 'POST'
	};
	
	appUtil.httpRequest(opts,result => {
		var idParam = '';
		if('success' === result.status){
			idParam = '&id='+result.tag._id;
		}
		res.redirect('/admin/tags/update?status='+result.status+idParam);
	});		
});

/* --------------------------------- 敏感词管理 --------------------------------- */
router.get('/words', function(req, res, next) {
	var keywds = req.query.keywds || '';
	var data = {'limit':req.query.limit || 15,'page':req.query.page || 1};
	if(keywds){
		data.keywds = keywds;
	}
	
	var opts = {
			path:'/api/words?' + querystring.stringify(data),
			method:'GET'
	};
	
	appUtil.httpRequest(opts,result => {
		result.keywds = keywds;
		res.render('admin/word/index', result);
	});	
});

/* 进入新增或修改敏感词页面 */
router.get('/words/update', function(req, res, next) {
	var id = req.query.id || '';
	console.log('id ==> ',id);
	if(id){
		var opts = {
				path:'/api/words/' + id,
				method : 'GET'
		};
		
		appUtil.httpRequest(opts,result => {
			res.render('admin/word/update', result);
		});
	}
	else{
		res.render('admin/word/update',{word:{}});
	}	
});

/* 新增或修改敏感词 */
router.post('/words/update', function(req, res, next) {
	var id = req.body.id || '';
	console.log('id ==> ',id);
	
	var data = { name : req.body.name, enabled : !!req.body.enabled};
	
	var opts = {
			path:'/api/words/' + (id ? id : ''),
			data:data,
			method : id ? 'PUT' : 'POST'
	};
	
	appUtil.httpRequest(opts,result => {
		var idParam = '';
		if('success' === result.status){
			idParam = '&id='+result.word._id;
		}
		res.redirect('/admin/words/update?status='+result.status+idParam);
	});		
});

/* --------------------------------- 评论管理 --------------------------------- */
router.get('/comments', function(req, res, next) {
	var keywds = req.query.keywds || '';
	var data = {'limit':req.query.limit || 15,'page':req.query.page || 1};
	if(keywds){
		data.keywds = keywds;
	}
	
	data.sort = '-createTime';	
	
	var opts = {
		path:'/api/comments?' + querystring.stringify(data),
		method:'GET'
	};
	
	appUtil.httpRequest(opts,result => {
		result.keywds = keywds;
		res.render('admin/comment/index', result);
	});	
});

/* 进入新增或修改评论页 */
router.get('/comments/update', function(req, res, next) {
	var id = req.query.id || '';
	console.log('id ==> ',id);
	if(id){
  	  var opts = {
			path:'/api/comments/' + id,
			method : 'GET'
		};
	
	  appUtil.httpRequest(opts,result => {
		  res.render('admin/comment/update', result);
	  });
	}
	else{
		res.render('admin/comment/update',{comment:{}});
	}	
});

/* 新增或修改评论 */
router.post('/comments/update', function(req, res, next) {
	var id = req.body.id || '';
	console.log('id ==> ',id);
	
	var data = { 
		article : req.body.article,
		nickname : req.body.nickname,
		email : req.body.email,
		content : req.body.content,
		audited : !!req.body.audited,
		remoteAddress : req.ip//TODO 需要区分IPV6 和 IPV4
	};
	
	var opts = {
			path:'/api/comments/' + (id ? id : ''),
			data:data,
			method : id ? 'PUT' : 'POST'
		};
	
	appUtil.httpRequest(opts,result => {
		var idParam = '';
		if('success' === result.status){
			idParam = '&id='+result.comment._id;
		}
		res.redirect('/admin/comments/update?status='+result.status+idParam);
	});		
});

/* --------------------------------- 行为管理 --------------------------------- */
router.get('/behaviors', function(req, res, next) {
	var keywds = req.query.keywds || '';
	var data = {'limit':req.query.limit || 15,'page':req.query.page || 1};
	if(keywds){
		data.keywds = keywds;
	}
	
	data.sort = '-createTime';
	
	var opts = {
			path:'/api/behaviors?' + querystring.stringify(data),
			method:'GET'
		};
	
	appUtil.httpRequest(opts,result => {
		result.keywds = keywds;
		res.render('admin/behavior/index', result);
	});
});

/* 进入新增或修改行为页 */
router.get('/behaviors/update', function(req, res, next) {
	var id = req.query.id || '';
	console.log('id ==> ',id);
	if(id){
		var opts = {
				path:'/api/behaviors/' + id,
				method : 'GET'
		};
		
		appUtil.httpRequest(opts,result => {
			res.render('admin/behavior/update', result);
		});
	}
	else{
		res.render('admin/behavior/update',{behavior:{}});
	}	
});

/* 新增或修改行为 */
router.post('/behaviors/update', function(req, res, next) {
	var id = req.body.id || '';
	console.log('id ==> ',id);
	
	var data = { 
		article : req.body.article,
		code : req.body.code,
		target : req.body.target,
		position : {},//TODO 使用高德地图API获取地理位置信息
		remoteAddress : req.ip//TODO 需要区分IPV6 和 IPV4
	};		
	
	var opts = {
			path:'/api/behaviors/' + (id ? id : ''),
			data:data,
			method : id ? 'PUT' : 'POST'
	};
	
	appUtil.httpRequest(opts,result => {
		var idParam = '';
		if('success' === result.status){
			idParam = '&id='+result.behavior._id;
		}
		res.redirect('/admin/behaviors/update?status='+result.status+idParam);
	});		
});


/* --------------------------------- 用户管理  --------------------------------- */
router.get('/users', function(req, res, next) {
	var keywds = req.query.keywds || '';
	var data = {'limit':req.query.limit || 15,'page':req.query.page || 1};
	if(keywds){
		data.keywds = keywds;
	}
	
	var opts = {
			path:'/api/users?' + querystring.stringify(data),
			method:'GET'
		};
	
	appUtil.httpRequest(opts,result => {
		result.keywds = keywds;
		res.render('admin/user/index', result);
	});
});

/* 进入新增或修改用户页 */
router.get('/users/update', function(req, res, next) {
	var id = req.query.id || '';
	console.log('id ==> ',id);
	
	if(id){
	  	var opts = {
	  		path : '/api/users/' + id,
	  		method : 'GET'
	  	};
	  	
	  	appUtil.httpRequest(opts,result => {
	  		res.render('admin/user/update', result);
	  	});
	}
	else{
		res.render('admin/user/update',{user:{}});
	}	
});

/* 新增或修改用户 */
router.post('/users/update',upload.single('photo'), function(req, res, next) {
	var id = req.body.id || '';
	console.log('id ==> ',id);

	var data = {
		account : req.body.account || '',
		passwd : req.body.passwd || '',
		userType : req.body.userType || '',
		realname : req.body.realname || '',
		nickname : req.body.nickname || '',
		//photo : req.body.photo || '',//TODO 在前端先上传到文件服务器或服务器上，这里保存的是文件的访问地址
		mobile : req.body.mobile || '',
		email : req.body.email || '',
		wx : req.body.wx || '',
		weibo : req.body.weibo || ''
	};
	
    var file = req.file;
    if(file){
        console.log('文件类型：%s', file.mimetype);
        console.log('原始文件名：%s', file.originalname);
        console.log('文件大小：%s', file.size);
        console.log('文件保存路径：%s', file.path);
        var photo = file.path.substr('../resources'.length);
        console.log('photo ==> ',photo); 
        data.photo = photo;
    }
	
	var opts = {
		path: '/api/users/' + (id ? id : ''),
		data: data,
		method : id ? 'PUT' : 'POST'
	};
	
	appUtil.httpRequest(opts,result => {
		var idParam = '';
		if('success' === result.status){
			var id = result.user._id;
			idParam = '&id='+id;
			
			//如果是当前登录用户，同时更新session里面的用户信息
			var user = req.session.sessionUser;
			if(id === user._id){
				req.session.sessionUser = result.user;
			}
		}
		res.redirect('/admin/users/update?status='+result.status+idParam);
	});		
});

/* 个人设置 */
router.get('/profile', function(req, res, next) {
	res.render('admin/profile/index',{user:req.session.sessionUser});
});

/* 修改个人设置 */
router.post('/profile',upload.single('photo'), function(req, res, next) {
	var id = req.body.id || '';
	console.log('id ==> ',id);
	console.log('req.body ==> ',req.body);
	console.log('req.query ==> ',req.query);
	
	var operation = req.body.operation || '';
	console.log('operation ==> ',operation);

	var data = {};
	var user = req.session.sessionUser;
	var verifyErr = '';
	
	//更新密码
	if(operation && 'updatePasswd' === operation){
		var oldPasswd = req.body.oldPasswd || '';
		var passwd = req.body.passwd || '';
		var repeatPasswd = req.body.repeatPasswd || '';
		if(oldPasswd && passwd && repeatPasswd && (passwd === repeatPasswd)){
			if(user.passwd === appUtil.encode(oldPasswd,appUtil.globalData.DEFAULT_SECRET_ENCODING,user.account)){
				data.passwd = passwd;
				data.account = user.account;//api端需要提供进行验证
			}
			else{
				verifyErr = '旧密码不正确';
			}
		}
		else{
			verifyErr = '缺少参数/参数值为空或者新密码不一致';	
		}
	}
	else{
		//更新个人信息
		var nickname = req.body.nickname || '';
		console.log('nickname => ',nickname);
		if(nickname){
		    data = {
				realname : req.body.realname || '',
				nickname :nickname,
				//photo : req.body.photo || '',//TODO 在前端先上传到文件服务器或服务器上，这里保存的是文件的访问地址
				mobile : req.body.mobile || '',
				email : req.body.email || '',
				wx : req.body.wx || '',
				weibo : req.body.weibo || ''
			};
		    
		    var file = req.file;
		    if(file){
		        console.log('文件类型：%s', file.mimetype);
		        console.log('原始文件名：%s', file.originalname);
		        console.log('文件大小：%s', file.size);
		        console.log('文件保存路径：%s', file.path);
		        var photo = file.path.substr('../resources'.length);
		        console.log('photo ==> ',photo); 
		        data.photo = photo;
		    }			
			
		}
		else{
			verifyErr = '缺少参数/参数值为空[nickname]：' + nickname;
		}
	}
	
	//两个必填项至少其中一个不为空:要么更新密码，要么更新个人信息
	console.log('data.nickname => ',data.nickname);
	if(data.passwd || data.nickname){
		var opts = {
			path: '/api/users/' + (id ? id : ''),
			data: data,
			method : 'PUT'
		};
		
		appUtil.httpRequest(opts,result => {
			//更新session
			if(result && 'success' === result.status){
				for(var p in result.user){
					user[p] = result.user[p];
				}
				req.session.sessionUser = user;
			}
			res.redirect('/admin/profile?id='+result.user._id+'&status='+result.status);
			//res.redirect('/admin/logout');//重新登录
		});		
	}
	else{
		res.redirect('/admin/profile?status=failure&error=' + verifyErr);
	}
});

/* 登录页 */
router.get('/login', function(req, res, next) {
	var sessionAccount = req.session.sessionAccount;
	if(sessionAccount){
		//如果已经登录，直接进入到管理后台首页
		return res.redirect('/admin');
	}
	res.render('admin/login/login');
});

/* 管理后台登录验证 */
router.post('/login', function(req, res, next) {
	var account = req.body.account;
	var passwd = req.body.passwd;

	//TODO 验证账号密码：不能为空
	
	var opts = {
		path:'/api/users/query/' + account,
		method:'GET'
	};
	
	appUtil.httpRequest(opts,result => {
		try{
			if(result.user){
				var user = result.user;
				if(user.passwd === appUtil.encode(passwd,appUtil.globalData.DEFAULT_SECRET_ENCODING,account)){
					//设置session
					req.session.sessionAccount = user.account; 				
					req.session.sessionUser = user;
					
					//登录成功，返回管理后台首页
					res.redirect('/admin');
				}
				else{
					throw '密码不正确'
					//TODO 返回信息提示
				}
			}
			else{
				throw '发现多个相同账户';
				//TODO 返回信息提示
			}
		}
		catch (e) {
			console.error('登录验证出错:  ',e.message);
			throw e;
		}
	});	
});

/* 退出登录 */
router.get('/logout', function(req, res, next) {
	req.session.destroy(function(err){
        if(err){
            console.error("退出失败!");
            return;
        }
        //清除登录cookie
        //res.clearCookie('cookieAccount');
        res.redirect('/admin/login');
    });
});

module.exports = router;
